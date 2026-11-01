export function fail(message: string): never {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function errorCode(error: unknown): string {
  if (error instanceof Error && 'code' in error && typeof error.code === 'string') return error.code;
  return errorMessage(error);
}
