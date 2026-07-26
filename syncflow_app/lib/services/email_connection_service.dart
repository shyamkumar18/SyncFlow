import '../core/exceptions.dart';
import 'api_client.dart';

class GmailConnectionStatus {
  final bool connected;
  final String? email;
  final String? provider;
  final String? status;
  final String? lastConnected;
  final String? lastSync;
  final String? syncMode;

  GmailConnectionStatus({
    required this.connected,
    this.email,
    this.provider,
    this.status,
    this.lastConnected,
    this.lastSync,
    this.syncMode,
  });

  factory GmailConnectionStatus.fromJson(Map<String, dynamic> json) {
    return GmailConnectionStatus(
      connected: json['connected'] as bool? ?? false,
      email: json['email'] as String? ?? json['gmailEmail'] as String?,
      provider: json['provider'] as String?,
      status: json['status'] as String?,
      lastConnected: json['lastConnected'] as String?,
      lastSync: json['lastSync'] as String?,
      syncMode: json['syncMode'] as String?,
    );
  }
}

class GmailProfile {
  final String email;
  final String? name;
  final String? avatar;

  GmailProfile({
    required this.email,
    this.name,
    this.avatar,
  });

  factory GmailProfile.fromJson(Map<String, dynamic> json) {
    return GmailProfile(
      email: json['email'] as String? ?? json['gmailEmail'] as String? ?? '',
      name: json['name'] as String?,
      avatar: json['avatar'] as String?,
    );
  }
}

class EmailConnectionService {
  final ApiClient _api;

  EmailConnectionService(this._api);

  Future<GmailConnectionStatus> getConnectionStatus() async {
    final response = await _api.get('/api/email/status');
    if (response['success'] == true && response['data'] != null) {
      return GmailConnectionStatus.fromJson(response['data'] as Map<String, dynamic>);
    }
    throw AppException(message: response['message'] as String? ?? 'Failed to get status');
  }

  Future<String> getConnectUrl() async {
    final response = await _api.get('/api/email/connect');
    if (response['success'] == true && response['data'] != null) {
      final data = response['data'] as Map<String, dynamic>;
      return data['url'] as String? ?? '';
    }
    throw AppException(message: response['message'] as String? ?? 'Failed to get connect URL');
  }

  Future<void> disconnectGmail() async {
    await _api.post('/api/email/disconnect');
  }

  Future<GmailProfile> getProfile() async {
    final response = await _api.get('/api/email/profile');
    if (response['success'] == true && response['data'] != null) {
      return GmailProfile.fromJson(response['data'] as Map<String, dynamic>);
    }
    throw AppException(message: response['message'] as String? ?? 'Failed to get profile');
  }

  Future<Map<String, dynamic>> testConnection() async {
    final response = await _api.post('/api/email/test-connection');
    if (response['success'] == true && response['data'] != null) {
      return response['data'] as Map<String, dynamic>;
    }
    throw AppException(message: response['message'] as String? ?? 'Connection test failed');
  }
}
