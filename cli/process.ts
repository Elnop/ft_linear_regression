export function fail(message: string): never {
  process.stderr.write(`Error: ${message}\n`);
  process.exit(1);
}

export function errorMessage(error: unknown): string {
  return (error as Error).message;
}

export function errorCode(error: unknown): string {
  return (error as NodeJS.ErrnoException).code ?? errorMessage(error);
}
