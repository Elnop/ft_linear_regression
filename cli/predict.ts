import { createInterface } from 'node:readline';
import { estimatePrice } from '../core/estimatePrice.ts';
import { parseMileage } from '../core/parseMileage.ts';
import { readModel } from './model.ts';
import { fail } from './process.ts';

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

function readMileage(input: string): number {
  const text = input.trim();
  if (text === '') fail('no mileage given');
  const mileage = parseMileage(text);
  if (mileage === null) fail(`invalid mileage "${text}", expected a non-negative number of km`);
  return mileage;
}

const thetas = readModel() ?? { theta0: 0, theta1: 0 };
const answer = await ask('Mileage (km): ');
if (answer === null) {
  process.stdout.write('\n');
  fail('no mileage given');
}
const mileage = readMileage(answer);
console.log(`Estimated price: ${estimatePrice(thetas, mileage).toFixed(2)}`);
