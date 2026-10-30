import { createInterface } from 'node:readline';
import { estimatePrice } from '../core/hypothesis.ts';
import { fail, readModel } from './model.ts';

function ask(question: string): Promise<string | null> {
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    let answered = false;
    readline.on('SIGINT', () => {
      process.stderr.write('\nInterrupted\n');
      process.exit(130);
    });
    readline.on('close', () => {
      if (!answered) resolve(null);
    });
    readline.question(question, (answer) => {
      answered = true;
      readline.close();
      resolve(answer);
    });
  });
}

function parseMileage(input: string): number {
  const text = input.trim();
  if (text === '') fail('no mileage given');
  if (!/^\d+(\.\d+)?$/.test(text)) {
    fail(`invalid mileage "${text}", expected a non-negative number of km`);
  }
  const value = Number(text);
  if (!Number.isFinite(value)) fail(`mileage is too large: "${text}"`);
  return value;
}

const thetas = readModel() ?? { theta0: 0, theta1: 0 };
const answer = await ask('Mileage (km): ');
if (answer === null) {
  process.stdout.write('\n');
  fail('no mileage given');
}
const mileage = parseMileage(answer);
console.log(`Estimated price: ${estimatePrice(thetas, mileage).toFixed(2)}`);
