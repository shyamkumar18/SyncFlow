class ApiConstants {
  static const String baseUrl = 'https://syncflow-api-mem4.onrender.com';
  static const String apiPrefix = '/api';
  static String get apiBaseUrl => '$baseUrl$apiPrefix';

  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}

class StorageKeys {
  static const String accessToken = 'access_token';
  static const String refreshToken = 'refresh_token';
  static const String userData = 'user_data';
  static const String themeMode = 'theme_mode';
}

class AppConstants {
  static const String appName = 'SyncFlow';
  static const String appTagline = 'Track your bank transactions directly from Gmail';
  static const int transactionPageSize = 20;
  static const int emailPageSize = 20;
  static const int notificationPageSize = 20;
  static const int syncTransactionLimit = 500;

  static const List<String> currencies = ['INR', 'USD', 'EUR', 'GBP'];
  static const List<String> timezones = [
    'Asia/Kolkata',
    'America/New_York',
    'Europe/London',
    'Asia/Dubai',
  ];

  static const List<String> themes = ['light', 'dark', 'system'];
}

class CategoryNames {
  static const List<String> expenseCategories = [
    'food_dining', 'groceries', 'transport', 'shopping', 'entertainment',
    'bills_utilities', 'healthcare', 'education', 'housing', 'travel',
    'insurance', 'investment', 'subscriptions', 'emi', 'loan_repayment',
    'atm_withdrawal', 'transfer', 'tax', 'charity', 'others_expense',
  ];

  static const List<String> incomeCategories = [
    'salary', 'freelance', 'refund', 'cashback', 'interest', 'dividend', 'others_income',
  ];
}

class EmailCategoryValues {
  static const String transaction = 'transaction';
  static const String creditCard = 'credit_card';
  static const String debitCard = 'debit_card';
  static const String upi = 'upi';
  static const String emi = 'emi';
  static const String loan = 'loan';
  static const String refund = 'refund';
  static const String failed = 'failed';
  static const String statement = 'statement';
  static const String unknown = 'unknown';
}

class TransactionStatus {
  static const String success = 'success';
  static const String failed = 'failed';
  static const String pending = 'pending';
  static const String refunded = 'refunded';
}

class TransactionType {
  static const String debit = 'debit';
  static const String credit = 'credit';
}
