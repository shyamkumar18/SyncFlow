class Bank {
  final String id;
  final String name;
  final List<String> emailPatterns;
  final String? logo;
  final String color;
  final bool connected;
  final String? lastActivity;
  final String createdAt;

  Bank({
    required this.id,
    required this.name,
    this.emailPatterns = const [],
    this.logo,
    this.color = '#0D6B4F',
    this.connected = true,
    this.lastActivity,
    required this.createdAt,
  });

  factory Bank.fromJson(Map<String, dynamic> json) {
    return Bank(
      id: json['_id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      emailPatterns: (json['emailPatterns'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      logo: json['logo'] as String?,
      color: json['color'] as String? ?? '#0D6B4F',
      connected: json['connected'] as bool? ?? true,
      lastActivity: json['lastActivity'] as String?,
      createdAt: json['createdAt'] as String? ?? '',
    );
  }
}
