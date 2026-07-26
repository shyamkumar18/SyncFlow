import '../models/bank.dart';
import 'api_client.dart';

class BankService {
  final ApiClient _api;

  BankService(this._api);

  Future<List<Bank>> getBanks() async {
    final response = await _api.get('/api/banks');
    return (response['data'] as List<dynamic>)
        .map((e) => Bank.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Bank> updateBank(String id, Map<String, dynamic> body) async {
    final response = await _api.patch('/api/banks/$id', data: body);
    return Bank.fromJson(response['data'] as Map<String, dynamic>);
  }
}
