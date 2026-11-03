export function baseName(filename: string): string {
  return (filename.split('/').pop() ?? '').replace(/\.[^.]+$/, '');
}
