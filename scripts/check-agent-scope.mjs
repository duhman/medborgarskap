#!/usr/bin/env node
/**
 * Class 4 PR diff guard: agents must not touch infra paths without an escape.
 * Fails with stable prefix AGENT_SCOPE_VIOLATION (grep-friendly).
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, basename, normalize } from "node:path";
import { fileURLToPath } from "node:url";

export const ERROR = "AGENT_SCOPE_VIOLATION";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const FORBIDDEN_PREFIXES = [
  "supabase/migrations/",
  "drizzle/",
  ".github/workflows/",
];

const LOCKFILE_NAMES = new Set([
  "bun.lock",
  "bun.lockb",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
]);

/** Documented human escape path (must be added in the same PR as infra edits). */
export const INFRA_DOC = "docs/agent-scope-infra-approved.md";

function truthyEnv(name) {
  const v = process.env[name];
  return v === "1" || v === "true" || v === "yes";
}

function readGithubEventLabels() {
  const path = process.env.GITHUB_EVENT_PATH;
  if (!path || !existsSync(path)) return [];
  try {
    const event = JSON.parse(readFileSync(path, "utf8"));
    const labels = event.pull_request?.labels ?? [];
    return labels.map((l) => l.name).filter(Boolean);
  } catch {
    return [];
  }
}

export function hasInfraEscape(changedFiles = []) {
  if (truthyEnv("AGENT_SCOPE_INFRA_APPROVED")) return true;
  if (readGithubEventLabels().includes("infra-approved")) return true;
  if (changedFiles.includes(INFRA_DOC)) return true;
  return false;
}

function normalizeRepoPath(file) {
  return normalize(file).replace(/\\/g, "/").replace(/^\.\//, "");
}

export function forbiddenReasonForPath(file) {
  const p = normalizeRepoPath(file);
  for (const prefix of FORBIDDEN_PREFIXES) {
    if (p === prefix.slice(0, -1) || p.startsWith(prefix)) {
      return `forbidden path (${prefix}*)`;
    }
  }
  const base = basename(p);
  if (LOCKFILE_NAMES.has(base)) {
    return "lockfile change";
  }
  return null;
}

function parseSemver(version) {
  const cleaned = String(version).trim().replace(/^[\^~>=<]+/, "");
  const m = cleaned.match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]) };
}

function depSections(pkg) {
  const sections = ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"];
  const out = [];
  for (const key of sections) {
    const block = pkg[key];
    if (block && typeof block === "object") {
      for (const [name, range] of Object.entries(block)) {
        out.push({ name, range: String(range), section: key });
      }
    }
  }
  return out;
}

export function findMajorDependencyBumps(beforePkg, afterPkg) {
  const before = depSections(beforePkg);
  const after = depSections(afterPkg);
  const beforeMap = new Map(before.map((d) => [`${d.section}:${d.name}`, d]));
  const bumps = [];
  for (const next of after) {
    const prev = beforeMap.get(`${next.section}:${next.name}`);
    if (!prev) continue;
    const oldV = parseSemver(prev.range);
    const newV = parseSemver(next.range);
    if (!oldV || !newV) continue;
    if (newV.major > oldV.major) {
      bumps.push({
        name: next.name,
        section: next.section,
        from: prev.range,
        to: next.range,
      });
    }
  }
  return bumps;
}

export function evaluateScope({ changedFiles, infraApproved, majorBumps = [] }) {
  if (infraApproved) return [];

  const violations = [];
  for (const file of changedFiles) {
    const reason = forbiddenReasonForPath(file);
    if (reason) {
      violations.push({ file, reason });
    }
  }
  for (const bump of majorBumps) {
    violations.push({
      file: "package.json",
      reason: `major dependency bump (${bump.section} ${bump.name}: ${bump.from} → ${bump.to})`,
    });
  }
  return violations;
}

function runGit(args, cwd = repoRoot) {
  return execSync(["git", ...args].join(" "), {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function resolveBaseRef() {
  if (process.env.AGENT_SCOPE_BASE) {
    return process.env.AGENT_SCOPE_BASE.replace(/^origin\//, "");
  }
  if (process.env.GITHUB_BASE_REF) {
    return process.env.GITHUB_BASE_REF;
  }
  return "main";
}

export function listChangedFiles({ baseRef = "main", cwd = repoRoot } = {}) {
  try {
    runGit(["rev-parse", "--git-dir"], cwd);
  } catch {
    return [];
  }

  const remoteBase = `origin/${baseRef}`;
  let mergeBase;
  try {
    mergeBase = runGit(["merge-base", "HEAD", remoteBase], cwd);
  } catch {
    try {
      mergeBase = runGit(["merge-base", "HEAD", baseRef], cwd);
    } catch {
      return [];
    }
  }

  const out = runGit(["diff", "--name-only", `${mergeBase}...HEAD`], cwd);
  if (!out) return [];
  return out.split("\n").map((l) => l.trim()).filter(Boolean);
}

function readPackageJsonAtRef(ref, cwd) {
  try {
    const raw = runGit(["show", `${ref}:package.json`], cwd);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function collectMajorBumps(changedFiles, { baseRef = "main", cwd = repoRoot } = {}) {
  if (!changedFiles.includes("package.json")) return [];
  const remoteBase = `origin/${baseRef}`;
  let mergeBase;
  try {
    mergeBase = runGit(["merge-base", "HEAD", remoteBase], cwd);
  } catch {
    mergeBase = baseRef;
  }
  const before = readPackageJsonAtRef(mergeBase, cwd);
  const afterPath = join(cwd, "package.json");
  if (!before || !existsSync(afterPath)) return [];
  const after = JSON.parse(readFileSync(afterPath, "utf8"));
  return findMajorDependencyBumps(before, after);
}

export function checkAgentScope(options = {}) {
  const baseRef = options.baseRef ?? resolveBaseRef();
  const cwd = options.cwd ?? repoRoot;
  const changedFiles = options.changedFiles ?? listChangedFiles({ baseRef, cwd });
  const infraApproved =
    options.infraApproved ?? hasInfraEscape(changedFiles);
  const majorBumps =
    options.majorBumps ??
    collectMajorBumps(changedFiles, { baseRef, cwd });

  return evaluateScope({ changedFiles, infraApproved, majorBumps });
}

function formatViolation(v) {
  return `  ${v.file}: ${v.reason}`;
}

function main() {
  const violations = checkAgentScope();
  if (violations.length === 0) {
    console.log("check-agent-scope: ok");
    return;
  }

  console.error(`${ERROR}: agent PR touches infra without infra-approved escape.\n`);
  console.error("Forbidden unless the PR has GitHub label `infra-approved`, env AGENT_SCOPE_INFRA_APPROVED=1,");
  console.error(`or adds ${INFRA_DOC} documenting the change.\n`);
  console.error("Violations:\n");
  for (const v of violations) {
    console.error(formatViolation(v));
  }
  console.error("");
  process.exit(1);
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main();
}
