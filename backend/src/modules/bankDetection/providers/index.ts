import type { BankProvider } from '../types';
import * as bankProviders from './banks';
import * as upiProviders from './upi';
import { BankDetector } from '../services/BankDetector';

const allProviders: BankProvider[] = [
  ...Object.values(bankProviders),
  ...Object.values(upiProviders),
];

export function registerAllProviders(detector: BankDetector): void {
  for (const provider of allProviders) {
    detector.register(provider);
  }
}

export { allProviders };
