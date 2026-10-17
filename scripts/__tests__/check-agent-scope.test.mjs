import { describe, expect, it } from "vitest";
import {
  ERROR,
  INFRA_DOC,
  evaluateScope,
  findMajorDependencyBumps,
  forbiddenReasonForPath,
  hasInfraEscape,
  isDependabot,
  listChangedFiles,
  resolvePullRequestContext,
  checkAgentScope,
  BaseUnresolvedError,
} from "../check-agent-scope.mjs";
import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("check-agent-scope", () => {
  it("flags forbidden globs", () => {
    expect(forbiddenReasonForPath("supabase/migrations/20260101_x.sql")).toMatch(
      /forbidden path/,
    );
    expect(forbiddenReasonForPath("drizzle/schema.ts")).toMatch(/forbidden path/);
    expect(forbiddenReasonForPath(".github/workflows/ci.yml")).toMatch(/forbidden path/);
    expect(forbiddenReasonForPath("bun.lock")).toMatch(/lockfile/);
  });

  it("allows a lockfile that moves with package.json", () => {
    expect(
      evaluateScope({ changedFiles: ["package.json", "bun.lock"], infraApproved: false }),
    ).toEqual([]);
    expect(
      evaluateScope({ changedFiles: ["bun.lock"], infraApproved: false }),
    ).toHaveLength(1);
  });

  it("lets Dependabot change lockfiles and majors but not workflows", () => {
    expect(isDependabot({ author: "dependabot[bot]" })).toBe(true);
    expect(isDependabot({ actor: "dependabot[bot]" })).toBe(true);
    const bump = [{ name: "vite", section: "devDependencies", from: "^6.0.0", to: "^7.0.0" }];
    expect(
      evaluateScope({ changedFiles: ["bun.lock"], infraApproved: false, majorBumps: bump, dependabot: true }),
    ).toEqual([]);
    expect(
      evaluateScope({ changedFiles: [".github/workflows/ci.yml"], infraApproved: false, dependabot: true }),
    ).toHaveLength(1);
  });

  it("identifies Dependabot by PR author, not branch name", () => {
    // A human can push a branch named dependabot/...; only the author login counts.
    expect(isDependabot({ branch: "dependabot/npm_and_yarn/x", author: "someone" })).toBe(false);
    expect(isDependabot({ branch: "dependabot/npm_and_yarn/x" })).toBe(false);
    // A human re-running a Dependabot PR keeps the exemption (author wins over actor).
    expect(isDependabot({ author: "dependabot[bot]", actor: "someone" })).toBe(true);
    // A human-authored PR is not exempt even if Dependabot is the actor.
    expect(isDependabot({ author: "someone", actor: "dependabot[bot]" })).toBe(false);
    expect(
      checkAgentScope({
        changedFiles: ["bun.lock"],
        deletedFiles: [],
        majorBumps: [],
        pullRequest: { labels: [], author: "someone", actor: "someone" },
      }),
    ).toHaveLength(1);
  });

  it("reads labels fresh from the GitHub API on re-run", async () => {
    const env = { GITHUB_REPOSITORY: "o/r", GITHUB_TOKEN: "t", GITHUB_ACTOR: "someone" };
    const event = { pull_request: { number: 7, labels: [], user: { login: "someone" } } };
    const calls = [];
    const fetchImpl = async (url, init) => {
      calls.push({ url, auth: init.headers.Authorization });
      return { ok: true, json: async () => ({ labels: [{ name: "infra-approved" }], user: { login: "someone" } }) };
    };
    const pr = await resolvePullRequestContext({ env, event, fetchImpl });
    expect(calls[0].url).toBe("https://api.github.com/repos/o/r/pulls/7");
    expect(calls[0].auth).toBe("Bearer t");
    expect(pr.source).toBe("api");
    expect(pr.labels).toEqual(["infra-approved"]);
    expect(
      checkAgentScope({ changedFiles: [".github/workflows/ci.yml"], deletedFiles: [], majorBumps: [], pullRequest: pr }),
    ).toEqual([]);
  });

  it("drops a label removed since the run was triggered", async () => {
    const env = { GITHUB_REPOSITORY: "o/r" };
    const event = { pull_request: { number: 7, labels: [{ name: "infra-approved" }], user: { login: "someone" } } };
    const fetchImpl = async () => ({ ok: true, json: async () => ({ labels: [], user: { login: "someone" } }) });
    const pr = await resolvePullRequestContext({ env, event, fetchImpl });
    expect(pr.labels).toEqual([]);
    expect(hasInfraEscape([".github/workflows/ci.yml"], [], pr.labels)).toBe(false);
  });

  it("falls back to the event payload when the API fails", async () => {
    const env = { GITHUB_REPOSITORY: "o/r" };
    const event = { pull_request: { number: 7, labels: [{ name: "infra-approved" }], user: { login: "dependabot[bot]" } } };
    const fetchImpl = async () => ({ ok: false, status: 503 });
    const pr = await resolvePullRequestContext({ env, event, fetchImpl });
    expect(pr.source).toBe("event");
    expect(pr.labels).toEqual(["infra-approved"]);
    expect(isDependabot(pr)).toBe(true);
  });

  it("does not call the API outside a pull request", async () => {
    let called = false;
    const pr = await resolvePullRequestContext({
      env: { GITHUB_REPOSITORY: "o/r", GITHUB_ACTOR: "dependabot[bot]" },
      event: null,
      fetchImpl: async () => {
        called = true;
      },
    });
    expect(called).toBe(false);
    expect(pr.source).toBe("none");
    expect(isDependabot(pr)).toBe(true);
  });

  it("never passes a base ref through a shell", () => {
    const dir = mkdtempSync(join(tmpdir(), "agent-scope-inj-"));
    const marker = join(dir, "pwned");
    const git = (cmd) => execSync(`git ${cmd}`, { cwd: dir, stdio: "ignore" });
    git("init -q");
    writeFileSync(join(dir, "a.txt"), "a");
    git("add a.txt");
    git("-c user.name=t -c user.email=t@t commit -qm init");
    expect(() =>
      listChangedFiles({ baseRef: `main;touch\${IFS}${marker}`, cwd: dir }),
    ).toThrow(BaseUnresolvedError);
    expect(existsSync(marker)).toBe(false);
  });

  it("fails loudly when the base cannot be resolved", () => {
    const dir = mkdtempSync(join(tmpdir(), "agent-scope-"));
    const git = (cmd) => execSync(`git ${cmd}`, { cwd: dir, stdio: "ignore" });
    git("init -q");
    writeFileSync(join(dir, "a.txt"), "a");
    git("add a.txt");
    git("-c user.name=t -c user.email=t@t commit -qm init");
    expect(() => listChangedFiles({ baseRef: "main-missing", cwd: dir })).toThrow(BaseUnresolvedError);
  });

  it("allows normal app paths", () => {
    expect(forbiddenReasonForPath("src/pages/Index.tsx")).toBeNull();
    expect(forbiddenReasonForPath("scripts/check-agent-scope.mjs")).toBeNull();
  });

  it("detects major dependency bumps", () => {
    const bumps = findMajorDependencyBumps(
      { dependencies: { zod: "^3.24.0" } },
      { dependencies: { zod: "^4.0.0" } },
    );
    expect(bumps).toHaveLength(1);
    expect(bumps[0].name).toBe("zod");
  });

  it("does not treat a deleted approval doc as approval", () => {
    const saved = {
      approved: process.env.AGENT_SCOPE_INFRA_APPROVED,
      event: process.env.GITHUB_EVENT_PATH,
    };
    delete process.env.AGENT_SCOPE_INFRA_APPROVED;
    delete process.env.GITHUB_EVENT_PATH;
    try {
      expect(hasInfraEscape([INFRA_DOC, "drizzle/foo.ts"], [INFRA_DOC])).toBe(false);
    } finally {
      if (saved.approved !== undefined) process.env.AGENT_SCOPE_INFRA_APPROVED = saved.approved;
      if (saved.event !== undefined) process.env.GITHUB_EVENT_PATH = saved.event;
    }
  });

  it("treats major-only ranges as majors", () => {
    expect(
      findMajorDependencyBumps({ dependencies: { a: "^5" } }, { dependencies: { a: "^6" } }),
    ).toHaveLength(1);
  });

  it("sees the source path of a moved workflow", () => {
    const dir = mkdtempSync(join(tmpdir(), "agent-scope-mv-"));
    const git = (cmd) => execSync(`git ${cmd}`, { cwd: dir, stdio: "ignore" });
    git("init -q -b main");
    execSync("mkdir -p .github/workflows", { cwd: dir });
    writeFileSync(join(dir, ".github/workflows/ci.yml"), "name: ci\n");
    git("add .");
    git("-c user.name=t -c user.email=t@t commit -qm init");
    git("update-ref refs/remotes/origin/main HEAD");
    git("checkout -q -b feature");
    git("mv .github/workflows/ci.yml ci.yml");
    git("-c user.name=t -c user.email=t@t commit -qm move");
    expect(listChangedFiles({ baseRef: "main", cwd: dir })).toContain(".github/workflows/ci.yml");
  });

  it("passes when infra doc is in the same PR", () => {
    expect(hasInfraEscape([INFRA_DOC, "drizzle/foo.ts"])).toBe(true);
  });

  it("fails with AGENT_SCOPE_VIOLATION semantics when unescaped", () => {
    const violations = evaluateScope({
      changedFiles: ["drizzle/meta/_journal.json"],
      infraApproved: false,
      majorBumps: [],
    });
    expect(violations.length).toBeGreaterThan(0);
    expect(ERROR).toBe("AGENT_SCOPE_VIOLATION");
  });

  it("skips violations when infra-approved", () => {
    const violations = evaluateScope({
      changedFiles: [".github/workflows/ci.yml", "bun.lock"],
      infraApproved: true,
      majorBumps: [{ name: "react", section: "dependencies", from: "^18.0.0", to: "^19.0.0" }],
    });
    expect(violations).toEqual([]);
  });
});
