import '../models/wallet.dart';
import 'api_client.dart';

class WalletService {
  final ApiClient _api;

  WalletService(this._api);

  Future<List<Wallet>> getWallets() async {
    final response = await _api.get('/api/wallets');
    return (response['data'] as List<dynamic>)
        .map((e) => Wallet.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<Wallet> createWallet(Map<String, dynamic> body) async {
    final response = await _api.post('/api/wallets', data: body);
    return Wallet.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<Wallet> updateWallet(String id, Map<String, dynamic> body) async {
    final response = await _api.put('/api/wallets/$id', data: body);
    return Wallet.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<void> deleteWallet(String id) async {
    await _api.delete('/api/wallets/$id');
  }

  Future<Wallet> updateBalance(String id, double balance) async {
    final response = await _api.patch('/api/wallets/$id/balance', data: {
      'balance': balance,
    });
    return Wallet.fromJson(response['data'] as Map<String, dynamic>);
  }
}
