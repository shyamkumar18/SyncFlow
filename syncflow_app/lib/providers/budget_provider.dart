import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/budget.dart';
import '../services/api_client.dart';
import '../services/budget_service.dart';

final budgetServiceProvider = Provider<BudgetService>((ref) {
  return BudgetService(ref.read(apiClientProvider));
});

final budgetsProvider = FutureProvider<List<Budget>>((ref) async {
  return await ref.read(budgetServiceProvider).getBudgets();
});

final budgetSummaryProvider = FutureProvider<List<BudgetSummary>>((ref) async {
  return await ref.read(budgetServiceProvider).getBudgetSummary();
});
