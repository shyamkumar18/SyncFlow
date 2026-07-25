import type {
  BankProvider,
  DetectionResult,
  EmailInput,
  ParsedTransaction,
} from '../types';
import { parseGeneric } from './GenericParser';

export class BankDetector {
  private providers: Map<string, BankProvider> = new Map();

  register(provider: BankProvider): void {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): BankProvider | undefined {
    return this.providers.get(id);
  }

  getAllProviders(): BankProvider[] {
    return Array.from(this.providers.values());
  }

  getKnownBanks(): { id: string; name: string; aliases: string[] }[] {
    return this.getAllProviders()
      .filter((p) => p.type === 'bank')
      .map((p) => ({ id: p.id, name: p.name, aliases: p.aliases }));
  }

  getKnownUPIApps(): { id: string; name: string }[] {
    return this.getAllProviders()
      .filter((p) => p.type === 'upi')
      .map((p) => ({ id: p.id, name: p.name }));
  }

  detect(email: EmailInput): DetectionResult {
    let best: DetectionResult | null = null;

    for (const provider of this.providers.values()) {
      const result = provider.detect(email);
      if (result && (!best || result.confidence > best.confidence)) {
        best = result;
      }
    }

    return best || {
      providerId: 'unknown',
      providerName: 'Unknown',
      confidence: 0,
      matchedPattern: 'none',
      type: 'bank',
    };
  }

  parse(text: string, providerId?: string): ParsedTransaction {
    if (providerId) {
      const provider = this.providers.get(providerId);
      if (provider) {
        const result = provider.parse(text);
        if (result) return result;
      }
    }
    return parseGeneric(text);
  }

  detectAndParse(email: EmailInput): {
    detection: DetectionResult;
    transaction: ParsedTransaction;
  } {
    const detection = this.detect(email);
    const text = `${email.subject} ${email.body} ${email.snippet || ''}`;
    const transaction = this.parse(text, detection.providerId);
    if (!transaction.bank && detection.providerId !== 'unknown') {
      transaction.bank = detection.providerName;
    }
    return { detection, transaction };
  }
}
