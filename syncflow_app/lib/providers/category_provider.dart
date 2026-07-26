import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/category.dart';
import '../services/api_client.dart';
import '../services/category_service.dart';

final categoryServiceProvider = Provider<CategoryService>((ref) {
  return CategoryService(ref.read(apiClientProvider));
});

final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  return await ref.read(categoryServiceProvider).getCategories();
});

final expenseCategoriesProvider = FutureProvider<List<Category>>((ref) async {
  final categories = await ref.read(categoryServiceProvider).getCategories();
  return categories.where((c) => c.type == 'expense').toList();
});

final incomeCategoriesProvider = FutureProvider<List<Category>>((ref) async {
  final categories = await ref.read(categoryServiceProvider).getCategories();
  return categories.where((c) => c.type == 'income').toList();
});
