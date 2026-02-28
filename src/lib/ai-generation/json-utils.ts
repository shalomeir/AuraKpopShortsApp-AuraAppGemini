/**
 * 모델 응답 문자열에서 JSON 객체를 우선 추출한다.
 */
export function parseJsonObject(rawText: string): unknown {
  const trimmed = rawText.trim();
  const direct = safeJsonParse(trimmed);
  if (direct) return direct;

  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last !== -1 && first < last) {
    const extracted = trimmed.slice(first, last + 1);
    const parsed = safeJsonParse(extracted);
    if (parsed) return parsed;
  }

  throw new Error("Model response is not valid JSON");
}

function safeJsonParse(value: string): unknown | null {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
