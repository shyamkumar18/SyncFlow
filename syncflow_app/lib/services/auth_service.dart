import '../core/exceptions.dart';
import '../models/user.dart';
import 'api_client.dart';

class AuthService {
  final ApiClient _api;

  AuthService(this._api);

  Future<AuthResponse> register({
    required String email,
    required String password,
    required String displayName,
  }) async {
    final response = await _api.post('/api/auth/register', data: {
      'email': email,
      'password': password,
      'displayName': displayName,
    });
    if (response['success'] == true && response['data'] != null) {
      return AuthResponse.fromJson(response['data'] as Map<String, dynamic>);
    }
    throw AppException(message: response['message'] as String? ?? 'Registration failed');
  }

  Future<AuthResponse> login({
    required String email,
    required String password,
  }) async {
    final response = await _api.post('/api/auth/login', data: {
      'email': email,
      'password': password,
    });
    if (response['success'] == true && response['data'] != null) {
      return AuthResponse.fromJson(response['data'] as Map<String, dynamic>);
    }
    throw AppException(message: response['message'] as String? ?? 'Login failed');
  }

  Future<AuthResponse> googleAuth({required String code}) async {
    final response = await _api.post('/api/auth/google', data: {
      'code': code,
    });
    if (response['success'] == true && response['data'] != null) {
      return AuthResponse.fromJson(response['data'] as Map<String, dynamic>);
    }
    throw AppException(message: response['message'] as String? ?? 'Google auth failed');
  }

  Future<RefreshTokenResponse> refreshToken(String refreshToken) async {
    final response = await _api.post('/api/auth/refresh', data: {
      'refreshToken': refreshToken,
    });
    if (response['success'] == true && response['data'] != null) {
      return RefreshTokenResponse.fromJson(response['data'] as Map<String, dynamic>);
    }
    throw UnauthorizedException(message: 'Token refresh failed');
  }

  Future<void> logout(String? refreshToken) async {
    await _api.post('/api/auth/logout', data: {
      if (refreshToken != null) 'refreshToken': refreshToken,
    });
  }

  Future<User> getProfile() async {
    final response = await _api.get('/api/auth/me');
    if (response['success'] == true && response['data'] != null) {
      return User.fromJson(response['data'] as Map<String, dynamic>);
    }
    throw AppException(message: response['message'] as String? ?? 'Failed to get profile');
  }
}
