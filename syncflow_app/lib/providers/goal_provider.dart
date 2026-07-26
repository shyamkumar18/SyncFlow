import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/goal.dart';
import '../services/api_client.dart';
import '../services/goal_service.dart';

final goalServiceProvider = Provider<GoalService>((ref) {
  return GoalService(ref.read(apiClientProvider));
});

final goalsProvider = FutureProvider<List<Goal>>((ref) async {
  return await ref.read(goalServiceProvider).getGoals();
});
