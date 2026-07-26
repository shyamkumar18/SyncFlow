class User {
  final String id;
  final String email;
  final String displayName;
  final String? avatar;
  final String provider;
  final String? googleId;
  final bool gmailSyncEnabled;
  final String? lastSyncAt;
  final double monthlyIncome;
  final String currency;
  final String timezone;
  final bool emailVerified;
  final String role;
  final bool isActive;
  final String createdAt;
  final String updatedAt;

  User({
    required this.id,
    required this.email,
    required this.displayName,
    this.avatar,
    this.provider = 'local',
    this.googleId,
    this.gmailSyncEnabled = false,
    this.lastSyncAt,
    this.monthlyIncome = 0,
    this.currency = 'INR',
    this.timezone = 'Asia/Kolkata',
    this.emailVerified = false,
    this.role = 'user',
    this.isActive = true,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] as String? ?? json['id'] as String? ?? '',
      email: json['email'] as String? ?? '',
      displayName: json['displayName'] as String? ?? '',
      avatar: json['avatar'] as String?,
      provider: json['provider'] as String? ?? 'local',
      googleId: json['googleId'] as String?,
      gmailSyncEnabled: json['gmailSyncEnabled'] as bool? ?? false,
      lastSyncAt: json['lastSyncAt'] as String?,
      monthlyIncome: (json['monthlyIncome'] as num?)?.toDouble() ?? 0,
      currency: json['currency'] as String? ?? 'INR',
      timezone: json['timezone'] as String? ?? 'Asia/Kolkata',
      emailVerified: json['emailVerified'] as bool? ?? false,
      role: json['role'] as String? ?? 'user',
      isActive: json['isActive'] as bool? ?? true,
      createdAt: json['createdAt'] as String? ?? '',
      updatedAt: json['updatedAt'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'email': email,
      'displayName': displayName,
      'avatar': avatar,
      'provider': provider,
      'googleId': googleId,
      'gmailSyncEnabled': gmailSyncEnabled,
      'lastSyncAt': lastSyncAt,
      'monthlyIncome': monthlyIncome,
      'currency': currency,
      'timezone': timezone,
      'emailVerified': emailVerified,
      'role': role,
      'isActive': isActive,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  String get initials {
    final parts = displayName.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return displayName.isNotEmpty ? displayName[0].toUpperCase() : '?';
  }
}

class AuthResponse {
  final User user;
  final String accessToken;
  final String refreshToken;

  AuthResponse({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      user: User.fromJson(json['user'] as Map<String, dynamic>),
      accessToken: json['accessToken'] as String? ?? '',
      refreshToken: json['refreshToken'] as String? ?? '',
    );
  }
}

class RefreshTokenResponse {
  final String accessToken;
  final String refreshToken;

  RefreshTokenResponse({
    required this.accessToken,
    required this.refreshToken,
  });

  factory RefreshTokenResponse.fromJson(Map<String, dynamic> json) {
    return RefreshTokenResponse(
      accessToken: json['accessToken'] as String? ?? '',
      refreshToken: json['refreshToken'] as String? ?? '',
    );
  }
}
