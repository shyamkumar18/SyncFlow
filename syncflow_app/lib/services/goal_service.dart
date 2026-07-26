import '../models/goal.dart';
import 'api_client.dart';

class GoalService {
  final ApiClient _api;

  GoalService(this._api);

  Future<List<Goal>> getGoals() async {
    final response = await _api.get('/api/goals');
    return (response['data'] as List<dynamic>)
        .map((e) => Goal.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Goal> createGoal(Map<String, dynamic> body) async {
    final response = await _api.post('/api/goals', data: body);
    return Goal.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<Goal> updateGoal(String id, Map<String, dynamic> body) async {
    final response = await _api.put('/api/goals/$id', data: body);
    return Goal.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<void> deleteGoal(String id) async {
    await _api.delete('/api/goals/$id');
  }

  Future<Goal> updateProgress(String id, double currentAmount) async {
    final response = await _api.patch('/api/goals/$id/progress', data: {
      'currentAmount': currentAmount,
    });
    return Goal.fromJson(response['data'] as Map<String, dynamic>);
  }
}
