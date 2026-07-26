import '../models/transaction.dart';
import 'api_client.dart';

class AnalyticsService {
  final ApiClient _api;

  AnalyticsService(this._api);

  Future<TransactionSummary> getOverview({
    String? startDate,
    String? endDate,
  }) async {
    final params = <String, dynamic>{};
    if (startDate != null) params['startDate'] = startDate;
    if (endDate != null) params['endDate'] = endDate;
    final response = await _api.get('/api/analytics/overview', queryParameters: params);
    return TransactionSummary.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<List<CategorySpending>> getSpendingByCategory({
    String? startDate,
    String? endDate,
  }) async {
    final params = <String, dynamic>{};
    if (startDate != null) params['startDate'] = startDate;
    if (endDate != null) params['endDate'] = endDate;
    final response = await _api.get('/api/analytics/spending-by-category', queryParameters: params);
    return (response['data'] as List<dynamic>)
        .map((e) => CategorySpending.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<MerchantSpending>> getSpendingByMerchant({
    String? startDate,
    String? endDate,
    int limit = 10,
  }) async {
    final params = <String, dynamic>{'limit': limit};
    if (startDate != null) params['startDate'] = startDate;
    if (endDate != null) params['endDate'] = endDate;
    final response = await _api.get('/api/analytics/spending-by-merchant', queryParameters: params);
    return (response['data'] as List<dynamic>)
        .map((e) => MerchantSpending.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<CashFlowItem>> getMonthlyTrend({int months = 12}) async {
    final response = await _api.get('/api/analytics/monthly-trend', queryParameters: {'months': months});
    return (response['data'] as List<dynamic>)
        .map((e) => CashFlowItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<BankDistribution>> getBankDistribution({
    String? startDate,
    String? endDate,
  }) async {
    final params = <String, dynamic>{};
    if (startDate != null) params['startDate'] = startDate;
    if (endDate != null) params['endDate'] = endDate;
    final response = await _api.get('/api/analytics/bank-distribution', queryParameters: params);
    return (response['data'] as List<dynamic>)
        .map((e) => BankDistribution.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<CardSpending>> getCardSpending({
    String? startDate,
    String? endDate,
  }) async {
    final params = <String, dynamic>{};
    if (startDate != null) params['startDate'] = startDate;
    if (endDate != null) params['endDate'] = endDate;
    final response = await _api.get('/api/analytics/card-spending', queryParameters: params);
    return (response['data'] as List<dynamic>)
        .map((e) => CardSpending.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<List<CashFlowItem>> getCashFlow({int months = 6}) async {
    final response = await _api.get('/api/analytics/cash-flow', queryParameters: {'months': months});
    return (response['data'] as List<dynamic>)
        .map((e) => CashFlowItem.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<YearlyOverview> getYearlyOverview({int? year}) async {
    final params = <String, dynamic>{};
    if (year != null) params['year'] = year;
    final response = await _api.get('/api/analytics/yearly-overview', queryParameters: params);
    return YearlyOverview.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<List<int>> exportData({
    String? startDate,
    String? endDate,
  }) async {
    final params = <String, dynamic>{};
    if (startDate != null) params['startDate'] = startDate;
    if (endDate != null) params['endDate'] = endDate;
    return await _api.download('/api/analytics/export?${Uri(queryParameters: params).query}');
  }
}
