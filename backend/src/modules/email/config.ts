export const SYNC_CONFIG = {
  DEFAULT_TRANSACTION_LIMIT: 500,
  DEFAULT_BANKING_EMAIL_LIMIT: 200,
  FETCH_BATCH_SIZE: 100,
  MAX_TRANSACTION_LIMIT: 5000,
  MAX_BANKING_EMAIL_LIMIT: 2000,
};

export type SyncConfigOverrides = {
  transactionLimit?: number;
  bankingEmailLimit?: number;
  fetchBatchSize?: number;
};

export function resolveConfig(overrides?: SyncConfigOverrides) {
  return {
    transactionLimit: Math.min(
      overrides?.transactionLimit ?? SYNC_CONFIG.DEFAULT_TRANSACTION_LIMIT,
      SYNC_CONFIG.MAX_TRANSACTION_LIMIT,
    ),
    bankingEmailLimit: Math.min(
      overrides?.bankingEmailLimit ?? SYNC_CONFIG.DEFAULT_BANKING_EMAIL_LIMIT,
      SYNC_CONFIG.MAX_BANKING_EMAIL_LIMIT,
    ),
    fetchBatchSize: Math.min(
      overrides?.fetchBatchSize ?? SYNC_CONFIG.FETCH_BATCH_SIZE,
      500,
    ),
  };
}
