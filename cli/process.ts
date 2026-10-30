export function fail(message: string): never {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
}

export function errorCode(error: unknown): string {
  return (error as NodeJS.ErrnoException).code ?? (error as Error).message;
}
