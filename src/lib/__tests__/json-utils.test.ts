import { describe, it, expect } from "vitest";
import { parseJsonObject } from "@/lib/ai-generation/json-utils";

describe("parseJsonObject()", () => {
  it("유효한 JSON 문자열을 파싱한다", () => {
    const result = parseJsonObject('{"key": "value"}');
    expect(result).toEqual({ key: "value" });
  });

  it("앞뒤 공백을 제거하고 파싱한다", () => {
    const result = parseJsonObject('  {"a": 1}  ');
    expect(result).toEqual({ a: 1 });
  });

  it("텍스트로 감싸인 JSON을 추출해 파싱한다", () => {
    const raw = 'Sure! Here is the result: {"name": "Aura"} done.';
    const result = parseJsonObject(raw);
    expect(result).toEqual({ name: "Aura" });
  });

  it("마크다운 코드블록 안의 JSON도 추출한다", () => {
    const raw = "```json\n{\"status\": \"ok\"}\n```";
    const result = parseJsonObject(raw);
    expect(result).toEqual({ status: "ok" });
  });

  it("중첩된 JSON 객체를 올바르게 파싱한다", () => {
    const result = parseJsonObject('{"outer": {"inner": [1, 2, 3]}}');
    expect(result).toEqual({ outer: { inner: [1, 2, 3] } });
  });

  it("유효한 JSON이 없으면 Error를 throw한다", () => {
    expect(() => parseJsonObject("no json here")).toThrowError(
      "Model response is not valid JSON",
    );
  });

  it("빈 문자열이면 Error를 throw한다", () => {
    expect(() => parseJsonObject("")).toThrowError(
      "Model response is not valid JSON",
    );
  });

  it("{ 없이 중괄호 오른쪽만 있으면 Error를 throw한다", () => {
    expect(() => parseJsonObject("just some text }")).toThrowError(
      "Model response is not valid JSON",
    );
  });
});
