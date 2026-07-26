export { computeFingerprint, type FingerprintInput } from './duplicateDetection';
export { normalizeMerchant, addMerchantAlias, getMerchantRegistry, type NormalizationResult } from './merchantNormalizer';
export { categorize, CATEGORIES, type CategorizationResult, type TransactionCategory, type IncomeCategory, type ExpenseCategory } from './autoCategorizer';
export { detectPromotion, type PromotionResult } from './promotionDetector';
export { findDuplicates, findAndMergeDuplicate, mergeExistingDuplicates, type DedupCandidate, type MatchScore } from './dedupEngine';
