import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../core/constants.dart';
import '../core/exceptions.dart';

class ApiClient {
  late final Dio _dio;
  final FlutterSecureStorage _storage;
  bool _isRefreshing = false;
  String? _pendingToken;
  final List<({RequestOptions request, ErrorInterceptorHandler handler})> _pendingRequests = [];

  ApiClient({FlutterSecureStorage? storage})
      : _storage = storage ?? const FlutterSecureStorage() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: ApiConstants.connectTimeout,
        receiveTimeout: ApiConstants.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) => _onRequest(options, handler),
        onError: (error, handler) => _onError(error, handler),
      ),
    );
  }

  Dio get dio => _dio;

  void _onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _storage.read(key: StorageKeys.accessToken);
    if (token != null && token.isNotEmpty) {
      if (!options.path.contains('/api/')) {
        options.path = '/api${options.path}';
      }
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  Future<void> _onError(DioException error, ErrorInterceptorHandler handler) async {
    if (error.response?.statusCode == 401 && !_isRefreshing) {
      _isRefreshing = true;
      try {
        final refreshToken = await _storage.read(key: StorageKeys.refreshToken);
        if (refreshToken == null || refreshToken.isEmpty) {
          await _clearAuth();
          return handler.reject(error);
        }

        final response = await Dio(
          BaseOptions(
            baseUrl: ApiConstants.baseUrl,
            headers: {'Content-Type': 'application/json'},
          ),
        ).post(
          '/api/auth/refresh',
          data: {'refreshToken': refreshToken},
        );

        final data = response.data['data'] as Map<String, dynamic>;
        final newAccessToken = data['accessToken'] as String;
        final newRefreshToken = data['refreshToken'] as String;

        await _storage.write(key: StorageKeys.accessToken, value: newAccessToken);
        await _storage.write(key: StorageKeys.refreshToken, value: newRefreshToken);

        _pendingToken = newAccessToken;

        error.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';

        final retryResponse = await _dio.fetch(error.requestOptions);
        handler.resolve(retryResponse);
      } catch (_) {
        await _clearAuth();
        handler.reject(error);
      } finally {
        _isRefreshing = false;
        _pendingToken = null;
      }
    } else {
      handler.next(error);
    }
  }

  Future<void> _clearAuth() async {
    await _storage.delete(key: StorageKeys.accessToken);
    await _storage.delete(key: StorageKeys.refreshToken);
    await _storage.delete(key: StorageKeys.userData);
  }

  static AppException handleError(DioException error) {
    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return NetworkException(message: 'Connection timed out');
    }
    if (error.type == DioExceptionType.connectionError) {
      return NetworkException();
    }

    final statusCode = error.response?.statusCode;
    final data = error.response?.data;

    if (data is Map<String, dynamic>) {
      final message = data['message'] as String? ?? 'Something went wrong';
      if (statusCode == 401) {
        return UnauthorizedException(message: message);
      } else if (statusCode == 400) {
        return ValidationException(message: message, errors: data['errors']);
      } else if (statusCode == 404) {
        return NotFoundException(message: message);
      } else if (statusCode == 429) {
        return RateLimitException(message: message);
      }
      return ServerException(message: message, statusCode: statusCode);
    }

    return ServerException(
      message: error.message ?? 'Something went wrong',
      statusCode: statusCode,
    );
  }

  Future<Map<String, dynamic>> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: queryParameters,
      );
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw handleError(e);
    }
  }

  Future<Map<String, dynamic>> post(
    String path, {
    dynamic data,
  }) async {
    try {
      final response = await _dio.post(path, data: data);
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw handleError(e);
    }
  }

  Future<Map<String, dynamic>> put(
    String path, {
    dynamic data,
  }) async {
    try {
      final response = await _dio.put(path, data: data);
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw handleError(e);
    }
  }

  Future<Map<String, dynamic>> patch(
    String path, {
    dynamic data,
  }) async {
    try {
      final response = await _dio.patch(path, data: data);
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw handleError(e);
    }
  }

  Future<Map<String, dynamic>> delete(String path) async {
    try {
      final response = await _dio.delete(path);
      return response.data as Map<String, dynamic>;
    } on DioException catch (e) {
      throw handleError(e);
    }
  }

  Future<List<int>> download(String url) async {
    try {
      final response = await _dio.get<List<int>>(
        url,
        options: Options(responseType: ResponseType.bytes),
      );
      return response.data ?? [];
    } on DioException catch (e) {
      throw handleError(e);
    }
  }
}
