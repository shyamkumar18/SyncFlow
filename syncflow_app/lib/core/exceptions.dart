class AppException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic errors;

  AppException({
    required this.message,
    this.statusCode,
    this.errors,
  });

  @override
  String toString() => 'AppException: $message (status: $statusCode)';
}

class NetworkException extends AppException {
  NetworkException({String? message})
      : super(message: message ?? 'No internet connection');
}

class UnauthorizedException extends AppException {
  UnauthorizedException({String? message})
      : super(message: message ?? 'Session expired. Please login again.', statusCode: 401);
}

class ServerException extends AppException {
  ServerException({String? message, int? statusCode})
      : super(message: message ?? 'Server error', statusCode: statusCode);
}

class ValidationException extends AppException {
  ValidationException({String? message, dynamic errors})
      : super(message: message ?? 'Validation failed', statusCode: 400, errors: errors);
}

class NotFoundException extends AppException {
  NotFoundException({String? message})
      : super(message: message ?? 'Resource not found', statusCode: 404);
}

class RateLimitException extends AppException {
  RateLimitException({String? message})
      : super(message: message ?? 'Too many requests. Please try again later.', statusCode: 429);
}
