import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { requireEnv } from "@/lib/env";

describe("requireEnv()", () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    // 환경변수 원상 복구
    process.env = { ...ORIGINAL_ENV };
  });

  it("존재하는 환경변수 값을 반환한다", () => {
    process.env.TEST_VAR = "hello";
    expect(requireEnv("TEST_VAR")).toBe("hello");
  });

  it("환경변수가 없으면 Error를 throw한다", () => {
    delete process.env.MISSING_VAR;
    expect(() => requireEnv("MISSING_VAR")).toThrowError(
      "Missing required environment variable: MISSING_VAR",
    );
  });

  it("환경변수가 빈 문자열이면 Error를 throw한다", () => {
    process.env.EMPTY_VAR = "";
    expect(() => requireEnv("EMPTY_VAR")).toThrowError(
      "Missing required environment variable: EMPTY_VAR",
    );
  });
});
