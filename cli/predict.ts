// Loads model.json (thetas = 0 if missing), prompts for a mileage, prints the estimated price.
import { createInterface } from 'node:readline';
import { estimatePrice } from '../core/hypothesis.ts';
import type { Thetas } from '../core/types.ts';
import { fail, readModel } from './model.ts';

function loadThetas(): Thetas {
  return readModel() ?? { theta0: 0, theta1: 0 };
}

// Resolves with the line typed, or null if input ends (Ctrl+D) before an answer.
function ask(question: string): Promise<string | null> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    let answered = false;
    rl.on('SIGINT', () => {
      process.stderr.write('\nInterrupted\n');
      process.exit(130);
    });
    rl.on('close', () => {
      if (!answered) resolve(null);
    });
    rl.question(question, (answer) => {
      answered = true;
      rl.close();
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

const thetas = loadThetas();
const answer = await ask('Mileage (km): ');
if (answer === null) {
  process.stdout.write('\n');
  fail('no mileage given');
}
const mileage = parseMileage(answer);
console.log(`Estimated price: ${estimatePrice(thetas, mileage).toFixed(2)}`);
