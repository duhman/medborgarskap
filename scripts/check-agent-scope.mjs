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

export const SHALLOW_ERROR = "AGENT_SCOPE_BASE_UNRESOLVED";

/** Documented human escape path (must be added in the same PR as infra edits). */
export const INFRA_DOC = "docs/agent-scope-infra-approved.md";

function truthyEnv(name) {
  const v = process.env[name];
  return v === "1" || v === "true" || v === "yes";
}

function readGithubEvent() {
  const path = process.env.GITHUB_EVENT_PATH;
  if (!path || !existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function readGithubEventLabels() {
  const labels = readGithubEvent()?.pull_request?.labels ?? [];
  return labels.map((l) => l.name).filter(Boolean);
}

/** Dependabot PRs legitimately bump manifests, lockfiles and majors. */
export function isDependabot({ branch = "", author = "" } = {}) {
  return author === "dependabot[bot]" || branch.startsWith("dependabot/");
}

function currentDependabotContext(cwd = repoRoot) {
  const event = readGithubEvent();
  const author = event?.pull_request?.user?.login ?? process.env.GITHUB_ACTOR ?? "";
  let branch = process.env.GITHUB_HEAD_REF ?? "";
  if (!branch) {
    try {
      branch = runGit(["rev-parse", "--abbrev-ref", "HEAD"], cwd);
    } catch {
      branch = "";
    }
  }
  return { branch, author };
}

export function hasInfraEscape(changedFiles = [], deletedFiles = []) {
  if (truthyEnv("AGENT_SCOPE_INFRA_APPROVED")) return true;
  if (readGithubEventLabels().includes("infra-approved")) return true;
  // Deleting the approval doc is not an approval; it must be added or edited in this PR.
  if (changedFiles.includes(INFRA_DOC) && !deletedFiles.includes(INFRA_DOC)) return true;
  return false;
}

function normalizeRepoPath(file) {
  return normalize(file).replace(/\\/g, "/").replace(/^\.\//, "");
}

export function forbiddenReasonForPath(file, { manifestChanged = false, dependabot = false } = {}) {
  const p = normalizeRepoPath(file);
  for (const prefix of FORBIDDEN_PREFIXES) {
    if (p === prefix.slice(0, -1) || p.startsWith(prefix)) {
      return `forbidden path (${prefix}*)`;
    }
  }
  const base = basename(p);
  if (LOCKFILE_NAMES.has(base)) {
    // A lockfile that moves with its package.json is a normal dependency change.
    const dir = p.slice(0, p.length - base.length);
    if (dependabot || manifestChanged === true || (manifestChanged instanceof Set && manifestChanged.has(dir))) {
      return null;
    }
    return "lockfile change without package.json change";
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

function manifestDirs(changedFiles) {
  const dirs = new Set();
  for (const file of changedFiles) {
    const p = normalizeRepoPath(file);
    if (basename(p) === "package.json") dirs.add(p.slice(0, p.length - "package.json".length));
  }
  return dirs;
}

export function evaluateScope({ changedFiles, infraApproved, majorBumps = [], dependabot = false }) {
  if (infraApproved) return [];

  const violations = [];
  const manifestChanged = manifestDirs(changedFiles);
  for (const file of changedFiles) {
    const reason = forbiddenReasonForPath(file, { manifestChanged, dependabot });
    if (reason) {
      violations.push({ file, reason });
    }
  }
  for (const bump of dependabot ? [] : majorBumps) {
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

export class BaseUnresolvedError extends Error {}

function isShallow(cwd) {
  try {
    return runGit(["rev-parse", "--is-shallow-repository"], cwd) === "true";
  } catch {
    return false;
  }
}

export function listChangedFiles({ baseRef = "main", cwd = repoRoot } = {}) {
  try {
    runGit(["rev-parse", "--git-dir"], cwd);
  } catch {
    // No git metadata (for example a hosted builder export): nothing to diff.
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
      // Never pass silently: an unresolvable base means the diff was not checked.
      const hint = isShallow(cwd)
        ? "shallow checkout; use actions/checkout fetch-depth: 0 or git fetch --unshallow origin"
        : `base ${remoteBase} not found; run git fetch origin ${baseRef}`;
      throw new BaseUnresolvedError(`${SHALLOW_ERROR}: cannot compute PR diff (${hint}).`);
    }
  }

  // --no-renames reports a move as delete + add, so moving a protected file out of
  // its folder still shows the protected source path.
  const out = runGit(["diff", "--name-only", "--no-renames", `${mergeBase}...HEAD`], cwd);
  if (!out) return [];
  return out.split("\n").map((l) => l.trim()).filter(Boolean);
}

export function listDeletedFiles({ baseRef = "main", cwd = repoRoot } = {}) {
  try {
    const mergeBase = runGit(["merge-base", "HEAD", `origin/${baseRef}`], cwd);
    const out = runGit(
      ["diff", "--name-only", "--no-renames", "--diff-filter=D", `${mergeBase}...HEAD`],
      cwd,
    );
    return out ? out.split("\n").map((l) => l.trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
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
  const deletedFiles = options.deletedFiles ?? (options.changedFiles ? [] : listDeletedFiles({ baseRef, cwd }));
  const infraApproved =
    options.infraApproved ?? hasInfraEscape(changedFiles, deletedFiles);
  const majorBumps =
    options.majorBumps ??
    collectMajorBumps(changedFiles, { baseRef, cwd });

  const dependabot = options.dependabot ?? isDependabot(currentDependabotContext(cwd));

  return evaluateScope({ changedFiles, infraApproved, majorBumps, dependabot });
}

function isPullRequestContext() {
  const event = process.env.GITHUB_EVENT_NAME;
  // Outside Actions (local verify) we always check. In Actions only PR events have a PR diff.
  return !event || event === "pull_request" || event === "pull_request_target";
}

function formatViolation(v) {
  return `  ${v.file}: ${v.reason}`;
}

function main() {
  if (!isPullRequestContext()) {
    console.log(`check-agent-scope: skipped (${process.env.GITHUB_EVENT_NAME} event has no PR diff)`);
    return;
  }
  let violations;
  try {
    violations = checkAgentScope();
  } catch (err) {
    if (err instanceof BaseUnresolvedError) {
      console.error(err.message);
      process.exit(2);
    }
    throw err;
  }
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
