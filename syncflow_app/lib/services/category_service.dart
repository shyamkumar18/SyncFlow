import '../models/category.dart';
import 'api_client.dart';

class CategoryService {
  final ApiClient _api;

  CategoryService(this._api);

  Future<List<Category>> getCategories() async {
    final response = await _api.get('/api/categories');
    return (response['data'] as List<dynamic>)
        .map((e) => Category.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Category> createCategory(Map<String, dynamic> body) async {
    final response = await _api.post('/api/categories', data: body);
    return Category.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<Category> updateCategory(String id, Map<String, dynamic> body) async {
    final response = await _api.put('/api/categories/$id', data: body);
    return Category.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<void> deleteCategory(String id) async {
    await _api.delete('/api/categories/$id');
  }

  Future<void> resetCategories() async {
    await _api.post('/api/categories/reset');
  }
}
