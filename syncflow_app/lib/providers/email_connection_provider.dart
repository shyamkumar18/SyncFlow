import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/api_client.dart';
import '../services/email_connection_service.dart';

final emailConnectionServiceProvider = Provider<EmailConnectionService>((ref) {
  return EmailConnectionService(ref.read(apiClientProvider));
});

class GmailConnectionState {
  final bool loading;
  final bool connected;
  final String? email;
  final String? status;
  final String? lastConnected;
  final String? error;
  final Map<String, dynamic>? testResult;

  const GmailConnectionState({
    this.loading = false,
    this.connected = false,
    this.email,
    this.status,
    this.lastConnected,
    this.error,
    this.testResult,
  });

  GmailConnectionState copyWith({
    bool? loading,
    bool? connected,
    String? email,
    String? status,
    String? lastConnected,
    String? error,
    Map<String, dynamic>? testResult,
  }) {
    return GmailConnectionState(
      loading: loading ?? this.loading,
      connected: connected ?? this.connected,
      email: email ?? this.email,
      status: status ?? this.status,
      lastConnected: lastConnected ?? this.lastConnected,
      error: error,
      testResult: testResult ?? this.testResult,
    );
  }
}

class GmailConnectionNotifier extends StateNotifier<GmailConnectionState> {
  final EmailConnectionService _service;

  GmailConnectionNotifier(this._service) : super(const GmailConnectionState());

  Future<void> loadStatus() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final status = await _service.getConnectionStatus();
      state = GmailConnectionState(
        connected: status.connected,
        email: status.email,
        status: status.status,
        lastConnected: status.lastConnected,
      );
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<String?> getConnectUrl() async {
    try {
      return await _service.getConnectUrl();
    } catch (e) {
      state = state.copyWith(error: e.toString());
      return null;
    }
  }

  Future<void> disconnect() async {
    try {
      await _service.disconnectGmail();
      state = const GmailConnectionState();
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> testConnection() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final result = await _service.testConnection();
      state = state.copyWith(testResult: result, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }
}

final gmailConnectionProvider = StateNotifierProvider<GmailConnectionNotifier, GmailConnectionState>((ref) {
  return GmailConnectionNotifier(ref.read(emailConnectionServiceProvider));
});
