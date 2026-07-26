class Wallet {
  final String id;
  final String name;
  final String type;
  final String bank;
  final String? accountNumber;
  final double balance;
  final String currency;
  final String color;
  final String icon;
  final bool isActive;
  final String createdAt;

  Wallet({
    required this.id,
    required this.name,
    required this.type,
    this.bank = '',
    this.accountNumber,
    this.balance = 0,
    this.currency = 'INR',
    this.color = '#0D6B4F',
    this.icon = 'account_balance',
    this.isActive = true,
    required this.createdAt,
  });

  factory Wallet.fromJson(Map<String, dynamic> json) {
    return Wallet(
      id: json['_id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      type: json['type'] as String? ?? 'savings',
      bank: json['bank'] as String? ?? '',
      accountNumber: json['accountNumber'] as String?,
      balance: (json['balance'] as num?)?.toDouble() ?? 0,
      currency: json['currency'] as String? ?? 'INR',
      color: json['color'] as String? ?? '#0D6B4F',
      icon: json['icon'] as String? ?? 'account_balance',
      isActive: json['isActive'] as bool? ?? true,
      createdAt: json['createdAt'] as String? ?? '',
    );
  }

  Map<String, dynamic> toCreateJson() {
    return {
      'name': name,
      'type': type,
      if (bank.isNotEmpty) 'bank': bank,
      if (balance != 0) 'balance': balance,
      if (color != '#0D6B4F') 'color': color,
      if (icon != 'account_balance') 'icon': icon,
    };
  }
}
