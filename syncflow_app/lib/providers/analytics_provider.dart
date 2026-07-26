import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/transaction.dart';
import '../services/api_client.dart';
import '../services/analytics_service.dart';

final analyticsServiceProvider = Provider<AnalyticsService>((ref) {
  return AnalyticsService(ref.read(apiClientProvider));
});

final overviewProvider = FutureProvider<TransactionSummary>((ref) async {
  return await ref.read(analyticsServiceProvider).getOverview();
});

final spendingByCategoryProvider = FutureProvider<List<CategorySpending>>((ref) async {
  return await ref.read(analyticsServiceProvider).getSpendingByCategory();
});

final monthlyTrendProvider = FutureProvider<List<CashFlowItem>>((ref) async {
  return await ref.read(analyticsServiceProvider).getMonthlyTrend();
});

final yearlyOverviewProvider = FutureProvider<YearlyOverview>((ref) async {
  return await ref.read(analyticsServiceProvider).getYearlyOverview();
});

final bankDistributionProvider = FutureProvider<List<BankDistribution>>((ref) async {
  return await ref.read(analyticsServiceProvider).getBankDistribution();
});

final cashFlowProvider = FutureProvider<List<CashFlowItem>>((ref) async {
  return await ref.read(analyticsServiceProvider).getCashFlow();
});
