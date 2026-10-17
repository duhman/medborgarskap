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
  BaseUnresolvedError,
} from "../check-agent-scope.mjs";
import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
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
    expect(isDependabot({ branch: "dependabot/npm_and_yarn/x" })).toBe(true);
    expect(isDependabot({ author: "dependabot[bot]" })).toBe(true);
    const bump = [{ name: "vite", section: "devDependencies", from: "^6.0.0", to: "^7.0.0" }];
    expect(
      evaluateScope({ changedFiles: ["bun.lock"], infraApproved: false, majorBumps: bump, dependabot: true }),
    ).toEqual([]);
    expect(
      evaluateScope({ changedFiles: [".github/workflows/ci.yml"], infraApproved: false, dependabot: true }),
    ).toHaveLength(1);
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
