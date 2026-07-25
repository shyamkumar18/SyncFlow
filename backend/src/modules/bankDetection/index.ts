import { BankDetector } from './services/BankDetector';
import { registerAllProviders } from './providers';

let instance: BankDetector | null = null;

export function getBankDetector(): BankDetector {
  if (!instance) {
    instance = new BankDetector();
    registerAllProviders(instance);
  }
  return instance;
}

export * from './types';
export { BankDetector } from './services/BankDetector';
export { parseGeneric } from './services/GenericParser';

export function detectBank(from: string, subject: string, snippet?: string) {
  const detector = getBankDetector();
  return detector.detect({ from, subject, body: snippet || '', snippet });
}

export function getKnownBanks() {
  return getBankDetector().getKnownBanks();
}

export function getKnownUPIApps() {
  return getBankDetector().getKnownUPIApps();
}
