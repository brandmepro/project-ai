import * as fs from 'fs';
import * as path from 'path';

let envLoaded = false;

function stripWrappingQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseEnvFile(rawContent: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = rawContent.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const normalized = line.startsWith('export ') ? line.slice(7).trim() : line;
    const eqIndex = normalized.indexOf('=');
    if (eqIndex <= 0) continue;

    const key = normalized.slice(0, eqIndex).trim();
    const rawValue = normalized.slice(eqIndex + 1);
    if (!key) continue;

    const value = stripWrappingQuotes(rawValue)
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r');

    result[key] = value;
  }

  return result;
}

/**
 * Ensures api/.env wins over inherited parent process vars.
 * This avoids monorepo root env values silently overriding API flags.
 */
export function loadApiEnv(): string | undefined {
  if (envLoaded) return undefined;

  const candidates = [
    path.resolve(__dirname, '../../.env'), // api/.env from src/ and dist/
    path.resolve(process.cwd(), 'api/.env'),
    path.resolve(process.cwd(), '.env'),
  ];

  for (const envPath of candidates) {
    if (!fs.existsSync(envPath)) continue;

    const content = fs.readFileSync(envPath, 'utf8');
    const parsed = parseEnvFile(content);
    for (const [key, value] of Object.entries(parsed)) {
      // Override inherited parent env vars by design.
      process.env[key] = value;
    }

    envLoaded = true;
    return envPath;
  }

  return undefined;
}
