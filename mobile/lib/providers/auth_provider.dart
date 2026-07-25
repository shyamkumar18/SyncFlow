import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:syncflow/services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  bool _isAuthenticated = false;
  bool _isLoading = true;
  ThemeMode _themeMode = ThemeMode.system;
  Map<String, dynamic>? _user;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;
  ThemeMode get themeMode => _themeMode;
  Map<String, dynamic>? get user => _user;

  AuthProvider() {
    _init();
  }

  Future<void> _init() async {
    final token = await _storage.read(key: 'accessToken');
    if (token != null) {
      try {
        final res = await _api.get('/auth/me');
        _user = res['data'];
        _isAuthenticated = true;
      } catch {
        await _storage.deleteAll();
      }
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final res = await _api.post('/auth/login', body: {
      'email': email,
      'password': password,
    });
    final data = res['data'];
    await _storage.write(key: 'accessToken', value: data['accessToken']);
    await _storage.write(key: 'refreshToken', value: data['refreshToken']);
    _user = data['user'];
    _isAuthenticated = true;
    notifyListeners();
  }

  Future<void> register(String email, String password, String displayName) async {
    final res = await _api.post('/auth/register', body: {
      'email': email,
      'password': password,
      'displayName': displayName,
    });
    final data = res['data'];
    await _storage.write(key: 'accessToken', value: data['accessToken']);
    await _storage.write(key: 'refreshToken', value: data['refreshToken']);
    _user = data['user'];
    _isAuthenticated = true;
    notifyListeners();
  }

  Future<void> logout() async {
    final refreshToken = await _storage.read(key: 'refreshToken');
    if (refreshToken != null) {
      try {
        await _api.post('/auth/logout', body: {'refreshToken': refreshToken});
      } catch (_) {}
    }
    await _storage.deleteAll();
    _user = null;
    _isAuthenticated = false;
    notifyListeners();
  }

  void setThemeMode(ThemeMode mode) {
    _themeMode = mode;
    notifyListeners();
  }
}
