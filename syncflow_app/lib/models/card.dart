class CardModel {
  final String id;
  final String type;
  final String bank;
  final String cardNetwork;
  final String cardNumber;
  final String cardHolderName;
  final int expiryMonth;
  final int expiryYear;
  final double? creditLimit;
  final double? availableBalance;
  final int? billingDate;
  final bool isActive;
  final String createdAt;

  CardModel({
    required this.id,
    required this.type,
    required this.bank,
    required this.cardNetwork,
    required this.cardNumber,
    required this.cardHolderName,
    required this.expiryMonth,
    required this.expiryYear,
    this.creditLimit,
    this.availableBalance,
    this.billingDate,
    this.isActive = true,
    required this.createdAt,
  });

  factory CardModel.fromJson(Map<String, dynamic> json) {
    return CardModel(
      id: json['_id'] as String? ?? '',
      type: json['type'] as String? ?? 'debit',
      bank: json['bank'] as String? ?? '',
      cardNetwork: json['cardNetwork'] as String? ?? '',
      cardNumber: json['cardNumber'] as String? ?? '',
      cardHolderName: json['cardHolderName'] as String? ?? '',
      expiryMonth: json['expiryMonth'] as int? ?? 1,
      expiryYear: json['expiryYear'] as int? ?? 2025,
      creditLimit: (json['creditLimit'] as num?)?.toDouble(),
      availableBalance: (json['availableBalance'] as num?)?.toDouble(),
      billingDate: json['billingDate'] as int?,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: json['createdAt'] as String? ?? '',
    );
  }

  Map<String, dynamic> toCreateJson() {
    return {
      'type': type,
      'bank': bank,
      'cardNetwork': cardNetwork,
      'cardNumber': cardNumber,
      'cardHolderName': cardHolderName,
      'expiryMonth': expiryMonth,
      'expiryYear': expiryYear,
      if (creditLimit != null) 'creditLimit': creditLimit,
      if (billingDate != null) 'billingDate': billingDate,
    };
  }

  String get maskedNumber {
    if (cardNumber.length < 4) return cardNumber;
    return '${'*' * (cardNumber.length - 4)}${cardNumber.substring(cardNumber.length - 4)}';
  }
}
