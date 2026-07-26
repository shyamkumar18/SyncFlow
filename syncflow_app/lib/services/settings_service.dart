import '../models/setting.dart';
import '../models/user.dart';
import 'api_client.dart';

class SettingsService {
  final ApiClient _api;

  SettingsService(this._api);

  Future<AppSettings> getSettings() async {
    final response = await _api.get('/api/settings');
    return AppSettings.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<AppSettings> updateSettings(Map<String, dynamic> body) async {
    final response = await _api.put('/api/settings', data: body);
    return AppSettings.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<User> updateProfile(Map<String, dynamic> body) async {
    final response = await _api.put('/api/settings/profile', data: body);
    return User.fromJson(response['data'] as Map<String, dynamic>);
  }

  Future<void> deleteAccount() async {
    await _api.delete('/api/settings/account');
  }
}
