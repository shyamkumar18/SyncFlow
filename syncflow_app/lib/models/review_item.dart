class ReviewItem {
  final String id;
  final String? emailId;
  final double amount;
  final String type;
  final String date;
  final String? time;
  final String? description;
  final String? merchant;
  final String? sender;
  final String? receiver;
  final double? balance;
  final String? upiId;
  final String? referenceNumber;
  final String bank;
  final String status;
  final String? reviewNotes;
  final double confidence;
  final String? detectionDetails;
  final String? transactionId;
  final String? reviewedAt;
  final String createdAt;
  final String updatedAt;

  ReviewItem({
    required this.id,
    this.emailId,
    required this.amount,
    required this.type,
    required this.date,
    this.time,
    this.description,
    this.merchant,
    this.sender,
    this.receiver,
    this.balance,
    this.upiId,
    this.referenceNumber,
    required this.bank,
    this.status = 'pending',
    this.reviewNotes,
    required this.confidence,
    this.detectionDetails,
    this.transactionId,
    this.reviewedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ReviewItem.fromJson(Map<String, dynamic> json) {
    return ReviewItem(
      id: json['_id'] as String? ?? '',
      emailId: json['emailId'] as String?,
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      type: json['type'] as String? ?? 'debit',
      date: json['date'] as String? ?? '',
      time: json['time'] as String?,
      description: json['description'] as String?,
      merchant: json['merchant'] as String?,
      sender: json['sender'] as String?,
      receiver: json['receiver'] as String?,
      balance: (json['balance'] as num?)?.toDouble(),
      upiId: json['upiId'] as String?,
      referenceNumber: json['referenceNumber'] as String?,
      bank: json['bank'] as String? ?? '',
      status: json['status'] as String? ?? 'pending',
      reviewNotes: json['reviewNotes'] as String?,
      confidence: (json['confidence'] as num?)?.toDouble() ?? 0,
      detectionDetails: json['detectionDetails'] as String?,
      transactionId: json['transactionId'] as String?,
      reviewedAt: json['reviewedAt'] as String?,
      createdAt: json['createdAt'] as String? ?? '',
      updatedAt: json['updatedAt'] as String? ?? '',
    );
  }

  bool get isLowConfidence => confidence < 50;
}
