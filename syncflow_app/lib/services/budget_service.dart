import '../models/budget.dart';
import 'api_client.dart';

class BudgetService {
  final ApiClient _api;

  BudgetService(this._api);

  Future<List<Budget>> getBudgets() async {
    final response = await _api.get('/api/budgets');
    return (response['data'] as List<dynamic>)
        .map((e) => Budget.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<BudgetSummary>> getBudgetSummary() async {
    final response = await _api.get('/api/budgets/summary');
    return (response['data'] as List<dynamic>)
        .map((e) => BudgetSummary.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Budget> createBudget(Map<String, dynamic> body) async {
    final response = await _api.post('/api/budgets', data: body);
    return Budget.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<Budget> updateBudget(String id, Map<String, dynamic> body) async {
    final response = await _api.put('/api/budgets/$id', data: body);
    return Budget.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<void> deleteBudget(String id) async {
    await _api.delete('/api/budgets/$id');
  }
}
