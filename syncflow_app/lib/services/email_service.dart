import '../models/api_response.dart';
import '../models/email.dart';
import 'api_client.dart';

class EmailService {
  final ApiClient _api;

  EmailService(this._api);

  Future<PaginatedResponse<Email>> getEmails({
    int page = 1,
    int limit = 20,
    String? category,
    String? bank,
    String? search,
    String? startDate,
    String? endDate,
  }) async {
    final params = <String, dynamic>{
      'page': page,
      'limit': limit,
    };
    if (category != null) params['category'] = category;
    if (bank != null) params['bank'] = bank;
    if (search != null) params['search'] = search;
    if (startDate != null) params['startDate'] = startDate;
    if (endDate != null) params['endDate'] = endDate;

    final response = await _api.get('/api/emails', queryParameters: params);
    return PaginatedResponse.fromJson(response, (e) => Email.fromJson(e as Map<String, dynamic>));
  }

  Future<Email> getEmail(String id) async {
    final response = await _api.get('/api/emails/$id');
    return Email.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<EmailStats> getEmailStats() async {
    final response = await _api.get('/api/emails/stats');
    return EmailStats.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<List<BankInfo>> getEmailBanks() async {
    final response = await _api.get('/api/emails/banks');
    return (response['data'] as List<dynamic>)
        .map((e) => BankInfo.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<SyncResult> syncEmails({int transactionLimit = 500}) async {
    final response = await _api.post('/api/emails/sync', data: {
      'transactionLimit': transactionLimit,
    });
    return SyncResult.fromJson(response['data'] as Map<String, dynamic>);
  }
}
