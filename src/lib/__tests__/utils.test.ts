import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn()", () => {
  it("단일 클래스 문자열을 그대로 반환한다", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("여러 클래스를 공백으로 합친다", () => {
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold");
  });

  it("falsy 값을 무시한다", () => {
    expect(cn("text-sm", false, undefined, null, "")).toBe("text-sm");
  });

  it("조건부 클래스를 처리한다", () => {
    const active = true;
    expect(cn("base", active && "active")).toBe("base active");
    expect(cn("base", !active && "inactive")).toBe("base");
  });

  it("Tailwind 충돌 클래스를 병합한다 (tailwind-merge)", () => {
    // 마지막 값이 우선
    expect(cn("p-4", "p-8")).toBe("p-8");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("인자 없이 호출하면 빈 문자열을 반환한다", () => {
    expect(cn()).toBe("");
  });
});
