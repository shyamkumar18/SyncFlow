import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../core/constants.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

class AuthRepository {
  final AuthService _authService;
  final FlutterSecureStorage _storage;

  AuthRepository(this._authService, {FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage();

  Future<AuthResponse> register({
    required String email,
    required String password,
    required String displayName,
  }) async {
    final response = await _authService.register(
      email: email,
      password: password,
      displayName: displayName,
    );
    await _saveTokens(response.accessToken, response.refreshToken);
    return response;
  }

  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    final response = await _authService.login(email: email, password: password);
    await _saveTokens(response.accessToken, response.refreshToken);
    return response;
  }

  Future<AuthResponse> googleAuth({required String code}) async {
    final response = await _authService.googleAuth(code: code);
    await _saveTokens(response.accessToken, response.refreshToken);
    return response;
  }

  Future<User> getProfile() async {
    return await _authService.getProfile();
  }

  Future<void> logout() async {
    final refreshToken = await _storage.read(key: StorageKeys.refreshToken);
    try {
      await _authService.logout(refreshToken);
    } catch (_) {}
    await _clearAuth();
  }

  Future<String?> getAccessToken() async {
    return await _storage.read(key: StorageKeys.accessToken);
  }

  Future<bool> hasValidToken() async {
    final token = await _storage.read(key: StorageKeys.accessToken);
    return token != null && token.isNotEmpty;
  }

  Future<void> _saveTokens(String accessToken, String refreshToken) async {
    await _storage.write(key: StorageKeys.accessToken, value: accessToken);
    await _storage.write(key: StorageKeys.refreshToken, value: refreshToken);
  }

  Future<void> _clearAuth() async {
    await _storage.delete(key: StorageKeys.accessToken);
    await _storage.delete(key: StorageKeys.refreshToken);
    await _storage.delete(key: StorageKeys.userData);
  }
}
