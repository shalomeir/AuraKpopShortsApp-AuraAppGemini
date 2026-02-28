/**
 * 서버/클라이언트 공통 환경변수를 안전하게 읽기 위한 헬퍼.
 * 누락된 값을 조기에 실패시켜 배포 환경에서의 런타임 오류를 줄인다.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

