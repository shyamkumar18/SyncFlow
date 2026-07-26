class Email {
  final String id;
  final String? gmailMessageId;
  final String? threadId;
  final String from;
  final String? to;
  final String subject;
  final String? snippet;
  final String? body;
  final String? bodyText;
  final String receivedAt;
  final String category;
  final String bank;
  final bool isProcessed;
  final bool hasTransaction;
  final String? transactionId;
  final List<String> labels;
  final String createdAt;

  Email({
    required this.id,
    this.gmailMessageId,
    this.threadId,
    required this.from,
    this.to,
    required this.subject,
    this.snippet,
    this.body,
    this.bodyText,
    required this.receivedAt,
    this.category = 'unknown',
    this.bank = 'Unknown',
    this.isProcessed = false,
    this.hasTransaction = false,
    this.transactionId,
    this.labels = const [],
    required this.createdAt,
  });

  factory Email.fromJson(Map<String, dynamic> json) {
    return Email(
      id: json['_id'] as String? ?? '',
      gmailMessageId: json['gmailMessageId'] as String?,
      threadId: json['threadId'] as String?,
      from: json['from'] as String? ?? '',
      to: json['to'] as String?,
      subject: json['subject'] as String? ?? '',
      snippet: json['snippet'] as String?,
      body: json['body'] as String?,
      bodyText: json['bodyText'] as String?,
      receivedAt: json['receivedAt'] as String? ?? '',
      category: json['category'] as String? ?? 'unknown',
      bank: json['bank'] as String? ?? 'Unknown',
      isProcessed: json['isProcessed'] as bool? ?? false,
      hasTransaction: json['hasTransaction'] as bool? ?? false,
      transactionId: json['transactionId'] as String?,
      labels: (json['labels'] as List<dynamic>?)?.map((e) => e as String).toList() ?? [],
      createdAt: json['createdAt'] as String? ?? '',
    );
  }
}

class EmailStats {
  final int total;
  final int unprocessed;
  final Map<String, int> categories;
  final Map<String, int> banks;

  EmailStats({
    this.total = 0,
    this.unprocessed = 0,
    this.categories = const {},
    this.banks = const {},
  });

  factory EmailStats.fromJson(Map<String, dynamic> json) {
    return EmailStats(
      total: json['total'] as int? ?? 0,
      unprocessed: json['unprocessed'] as int? ?? 0,
      categories: (json['categories'] as Map<String, dynamic>?)
              ?.map((k, v) => MapEntry(k, v as int)) ??
          {},
      banks: (json['banks'] as Map<String, dynamic>?)
              ?.map((k, v) => MapEntry(k, v as int)) ??
          {},
    );
  }
}

class BankInfo {
  final String name;
  final int count;
  final String? lastEmail;

  BankInfo({
    required this.name,
    this.count = 0,
    this.lastEmail,
  });

  factory BankInfo.fromJson(Map<String, dynamic> json) {
    return BankInfo(
      name: json['name'] as String? ?? '',
      count: json['count'] as int? ?? 0,
      lastEmail: json['lastEmail'] as String?,
    );
  }
}

class SyncResult {
  final int? transactionsCreated;
  final int? duplicatesFound;
  final int? sentForReview;
  final List<String>? parseErrors;
  final Map<String, dynamic>? syncResult;

  SyncResult({
    this.transactionsCreated,
    this.duplicatesFound,
    this.sentForReview,
    this.parseErrors,
    this.syncResult,
  });

  factory SyncResult.fromJson(Map<String, dynamic> json) {
    return SyncResult(
      transactionsCreated: json['transactionsCreated'] as int?,
      duplicatesFound: json['duplicatesFound'] as int?,
      sentForReview: json['sentForReview'] as int?,
      parseErrors: (json['parseErrors'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      syncResult: json['syncResult'] as Map<String, dynamic>?,
    );
  }
}
