/**
 * Helper to safely read server/client common environment variables.
 * Fails early on missing values to reduce runtime errors in deployment.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

