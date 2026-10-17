import { describe, expect, it } from "vitest";
import {
  ERROR,
  INFRA_DOC,
  evaluateScope,
  findMajorDependencyBumps,
  forbiddenReasonForPath,
  hasInfraEscape,
} from "../check-agent-scope.mjs";

describe("check-agent-scope", () => {
  it("flags forbidden globs", () => {
    expect(forbiddenReasonForPath("supabase/migrations/20260101_x.sql")).toMatch(
      /forbidden path/,
    );
    expect(forbiddenReasonForPath("drizzle/schema.ts")).toMatch(/forbidden path/);
    expect(forbiddenReasonForPath(".github/workflows/ci.yml")).toMatch(/forbidden path/);
    expect(forbiddenReasonForPath("bun.lock")).toMatch(/lockfile/);
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
