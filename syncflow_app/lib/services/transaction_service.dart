import '../models/api_response.dart';
import '../models/transaction.dart';
import 'api_client.dart';

class TransactionService {
  final ApiClient _api;

  TransactionService(this._api);

  Future<PaginatedResponse<Transaction>> getTransactions({
    int page = 1,
    int limit = 20,
    String sort = '-date',
    String? type,
    String? bank,
    String? category,
    String? status,
    String? startDate,
    String? endDate,
    String? search,
    double? minAmount,
    double? maxAmount,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
      'sort': sort,
    };
    if (type != null) params['type'] = type;
    if (bank != null) params['bank'] = bank;
    if (category != null) params['category'] = category;
    if (status != null) params['status'] = status;
    if (startDate != null) params['startDate'] = startDate;
    if (endDate != null) params['endDate'] = endDate;
    if (search != null) params['search'] = search;
    if (minAmount != null) params['minAmount'] = minAmount;
    if (maxAmount != null) params['maxAmount'] = maxAmount;

    final response = await _api.get('/api/transactions', queryParameters: params);
    return PaginatedResponse.fromJson(response, (e) => Transaction.fromJson(e as Map<String, dynamic>));
  }

  Future<Transaction> getTransaction(String id) async {
    final response = await _api.get('/api/transactions/$id');
    return Transaction.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<Transaction> createTransaction(Map<String, dynamic> body) async {
    final response = await _api.post('/api/transactions', data: body);
    return Transaction.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<Transaction> createManualTransaction(Map<String, dynamic> body) async {
    final response = await _api.post('/api/transactions/manual', data: body);
    return Transaction.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<Transaction> updateTransaction(String id, Map<String, dynamic> body) async {
    final response = await _api.patch('/api/transactions/$id', data: body);
    return Transaction.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<void> deleteTransaction(String id) async {
    await _api.delete('/api/transactions/$id');
  }

  Future<TransactionSummary> getTransactionSummary({
    String? startDate,
    String? endDate,
  }) async {
    final params = <String, dynamic>{};
    if (startDate != null) params['startDate'] = startDate;
    if (endDate != null) params['endDate'] = endDate;
    final response = await _api.get('/api/transactions/summary', queryParameters: params);
    return TransactionSummary.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<PaginatedResponse<dynamic>> getReviewQueue({
    int page = 1,
    int limit = 20,
    String status = 'pending',
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
      'status': status,
      'sort': '-date',
    };
    final response = await _api.get('/api/transactions/review', queryParameters: params);
    return PaginatedResponse.fromJson(response, (e) => e);
  }

  Future<int> getReviewQueueCount() async {
    final response = await _api.get('/api/transactions/review/count');
    return (response['data'] as Map<String, dynamic>)['count'] as int? ?? 0;
  }

  Future<void> approveReviewItem(String id) async {
    await _api.post('/api/transactions/review/$id/approve');
  }

  Future<void> rejectReviewItem(String id, {String? notes}) async {
    await _api.post('/api/transactions/review/$id/reject', data: {
      if (notes != null) 'notes': notes,
    });
  }

  Future<void> assignCategory(String id, String categoryId) async {
    await _api.patch('/api/transactions/$id/category', data: {
      'categoryId': categoryId,
    });
  }
}
