class AppSettings {
  final String theme;
  final String language;
  final String currency;
  final String timezone;
  final double monthlyIncome;
  final NotificationPreferences notificationPreferences;
  final PrivacySettings privacy;
  final String createdAt;

  AppSettings({
    this.theme = 'system',
    this.language = 'en',
    this.currency = 'INR',
    this.timezone = 'Asia/Kolkata',
    this.monthlyIncome = 0,
    NotificationPreferences? notificationPreferences,
    PrivacySettings? privacy,
    this.createdAt = '',
  })  : notificationPreferences = notificationPreferences ?? NotificationPreferences(),
        privacy = privacy ?? PrivacySettings();

  factory AppSettings.fromJson(Map<String, dynamic> json) {
    return AppSettings(
      theme: json['theme'] as String? ?? 'system',
      language: json['language'] as String? ?? 'en',
      currency: json['currency'] as String? ?? 'INR',
      timezone: json['timezone'] as String? ?? 'Asia/Kolkata',
      monthlyIncome: (json['monthlyIncome'] as num?)?.toDouble() ?? 0,
      notificationPreferences: json['notificationPreferences'] != null
          ? NotificationPreferences.fromJson(
              json['notificationPreferences'] as Map<String, dynamic>)
          : null,
      privacy: json['privacy'] != null
          ? PrivacySettings.fromJson(json['privacy'] as Map<String, dynamic>)
          : null,
      createdAt: json['createdAt'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (theme != 'system') 'theme': theme,
      if (language != 'en') 'language': language,
      if (currency != 'INR') 'currency': currency,
      if (timezone != 'Asia/Kolkata') 'timezone': timezone,
      if (monthlyIncome != 0) 'monthlyIncome': monthlyIncome,
      'notificationPreferences': notificationPreferences.toJson(),
      'privacy': privacy.toJson(),
    };
  }
}

class NotificationPreferences {
  final bool emailSync;
  final bool budgetAlerts;
  final bool goalReminders;
  final bool monthlyReport;
  final bool pushNotifications;

  NotificationPreferences({
    this.emailSync = true,
    this.budgetAlerts = true,
    this.goalReminders = true,
    this.monthlyReport = true,
    this.pushNotifications = true,
  });

  factory NotificationPreferences.fromJson(Map<String, dynamic> json) {
    return NotificationPreferences(
      emailSync: json['emailSync'] as bool? ?? true,
      budgetAlerts: json['budgetAlerts'] as bool? ?? true,
      goalReminders: json['goalReminders'] as bool? ?? true,
      monthlyReport: json['monthlyReport'] as bool? ?? true,
      pushNotifications: json['pushNotifications'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'emailSync': emailSync,
      'budgetAlerts': budgetAlerts,
      'goalReminders': goalReminders,
      'monthlyReport': monthlyReport,
      'pushNotifications': pushNotifications,
    };
  }
}

class PrivacySettings {
  final bool showAmountsInDashboard;
  final bool showRecentTransactions;

  PrivacySettings({
    this.showAmountsInDashboard = true,
    this.showRecentTransactions = true,
  });

  factory PrivacySettings.fromJson(Map<String, dynamic> json) {
    return PrivacySettings(
      showAmountsInDashboard: json['showAmountsInDashboard'] as bool? ?? true,
      showRecentTransactions: json['showRecentTransactions'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'showAmountsInDashboard': showAmountsInDashboard,
      'showRecentTransactions': showRecentTransactions,
    };
  }
}
