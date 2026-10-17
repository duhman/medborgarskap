#!/usr/bin/env node
/**
 * Class 4 PR diff guard: agents must not touch infra paths without an escape.
 * Fails with stable prefix AGENT_SCOPE_VIOLATION (grep-friendly).
 */
import { execFileSync } from "node:child_process";
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

function labelNames(labels) {
  return (labels ?? []).map((l) => (typeof l === "string" ? l : l?.name)).filter(Boolean);
}

export const DEPENDABOT_LOGIN = "dependabot[bot]";

/**
 * Dependabot PRs legitimately bump manifests, lockfiles and majors.
 * Identity is the PR author login (from the GitHub API or event payload), falling back to
 * GITHUB_ACTOR when there is no PR author. Branch names are never trusted: anyone can push
 * a `dependabot/...` branch.
 */
export function isDependabot({ author = "", actor = "" } = {}) {
  if (author) return author === DEPENDABOT_LOGIN;
  return actor === DEPENDABOT_LOGIN;
}

/**
 * Read the PR's current labels and author from the GitHub API. On a re-run the event
 * payload still holds the labels from when the run was first triggered, so a label added
 * or removed since then would be missed. Falls back to the payload (with a warning) when
 * the API is unreachable.
 */
export async function resolvePullRequestContext({
  env = process.env,
  event = readGithubEvent(),
  fetchImpl = globalThis.fetch,
} = {}) {
  const pr = event?.pull_request;
  const payload = {
    labels: labelNames(pr?.labels),
    author: pr?.user?.login ?? "",
    actor: env.GITHUB_ACTOR ?? "",
    source: pr ? "event" : "none",
  };
  const repo = env.GITHUB_REPOSITORY;
  if (!pr?.number || !repo || typeof fetchImpl !== "function") return payload;
  const api = (env.GITHUB_API_URL || "https://api.github.com").replace(/\/+$/, "");
  const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
  if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  try {
    const res = await fetchImpl(`${api}/repos/${repo}/pulls/${pr.number}`, {
      headers,
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const fresh = await res.json();
    return {
      labels: labelNames(fresh.labels),
      author: fresh.user?.login ?? payload.author,
      actor: payload.actor,
      source: "api",
    };
  } catch (err) {
    console.warn(
      `check-agent-scope: could not read PR #${pr.number} from the GitHub API (${err?.message ?? err}); using event payload labels`,
    );
    return payload;
  }
}

export function hasInfraEscape(changedFiles = [], deletedFiles = [], labels = []) {
  if (truthyEnv("AGENT_SCOPE_INFRA_APPROVED")) return true;
  if (labelNames(labels).includes("infra-approved")) return true;
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
  const m = cleaned.match(/^(\d+)(?:\.(\d+|x|\*))?(?:\.(\d+|x|\*))?/);
  if (!m) return null;
  return { major: Number(m[1]), minor: Number(m[2]) || 0, patch: Number(m[3]) || 0 };
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
  // execFileSync: refs from GITHUB_BASE_REF / AGENT_SCOPE_BASE never reach a shell.
  return execFileSync("git", args, {
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

function tryMergeBase(baseRef, cwd) {
  for (const ref of [`origin/${baseRef}`, baseRef]) {
    try {
      return runGit(["merge-base", "HEAD", ref], cwd);
    } catch {
      // try next candidate
    }
  }
  return null;
}

/**
 * Resolve the PR merge base. In GitHub Actions the default checkout is shallow
 * (fetch-depth 1), so fetch the base branch with full history first. Never fall
 * back to "no diff": an unresolved base throws BaseUnresolvedError.
 */
export function resolveMergeBase({ baseRef = "main", cwd = repoRoot } = {}) {
  let mergeBase = tryMergeBase(baseRef, cwd);
  if (!mergeBase && process.env.GITHUB_ACTIONS === "true") {
    const refspec = `+refs/heads/${baseRef}:refs/remotes/origin/${baseRef}`;
    try {
      const unshallow = isShallow(cwd) ? ["--unshallow"] : [];
      runGit(["fetch", "--no-tags", "--quiet", ...unshallow, "origin", refspec], cwd);
    } catch {
      // reported below
    }
    mergeBase = tryMergeBase(baseRef, cwd);
  }
  if (!mergeBase) {
    const hint = isShallow(cwd)
      ? "shallow checkout; use actions/checkout fetch-depth: 0 or git fetch --unshallow origin"
      : `base origin/${baseRef} not found; run git fetch origin ${baseRef}`;
    throw new BaseUnresolvedError(`${SHALLOW_ERROR}: cannot compute PR diff (${hint}).`);
  }
  return mergeBase;
}

function hasGit(cwd) {
  try {
    runGit(["rev-parse", "--git-dir"], cwd);
    return true;
  } catch {
    return false;
  }
}

function diffNames(mergeBase, extra, cwd) {
  // -z: NUL-delimited so unusual file names cannot split or merge entries.
  // --no-renames: a move shows as delete + add, so a protected source path is still seen.
  const out = execFileSync(
    "git",
    ["diff", "--name-only", "-z", "--no-renames", ...extra, `${mergeBase}...HEAD`],
    { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  return out.split("\0").filter(Boolean);
}

export function listChangedFiles({ baseRef = "main", cwd = repoRoot } = {}) {
  // No git metadata (for example a hosted builder export): nothing to diff.
  if (!hasGit(cwd)) return [];
  return diffNames(resolveMergeBase({ baseRef, cwd }), [], cwd);
}

export function listDeletedFiles({ baseRef = "main", cwd = repoRoot } = {}) {
  if (!hasGit(cwd)) return [];
  return diffNames(resolveMergeBase({ baseRef, cwd }), ["--diff-filter=D"], cwd);
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
  const before = readPackageJsonAtRef(resolveMergeBase({ baseRef, cwd }), cwd);
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
  const pr = options.pullRequest ?? { labels: [], author: "", actor: process.env.GITHUB_ACTOR ?? "" };
  const infraApproved =
    options.infraApproved ?? hasInfraEscape(changedFiles, deletedFiles, pr.labels);
  const majorBumps =
    options.majorBumps ??
    collectMajorBumps(changedFiles, { baseRef, cwd });

  const dependabot = options.dependabot ?? isDependabot(pr);

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

async function main() {
  if (!isPullRequestContext()) {
    console.log(`check-agent-scope: skipped (${process.env.GITHUB_EVENT_NAME} event has no PR diff)`);
    return;
  }
  const pullRequest = await resolvePullRequestContext();
  let violations;
  try {
    violations = checkAgentScope({ pullRequest });
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
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
