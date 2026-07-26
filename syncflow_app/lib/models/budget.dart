class Budget {
  final String id;
  final String categoryId;
  final String? categoryName;
  final String? categoryIcon;
  final String? categoryColor;
  final double amount;
  final String period;
  final int month;
  final int year;
  final double spent;
  final bool rollover;
  final int notifyAt;
  final bool isActive;
  final String createdAt;

  Budget({
    required this.id,
    required this.categoryId,
    this.categoryName,
    this.categoryIcon,
    this.categoryColor,
    required this.amount,
    this.period = 'monthly',
    required this.month,
    required this.year,
    this.spent = 0,
    this.rollover = false,
    this.notifyAt = 80,
    this.isActive = true,
    required this.createdAt,
  });

  factory Budget.fromJson(Map<String, dynamic> json) {
    dynamic category = json['category'];
    String catId = '';
    String? catName;
    String? catIcon;
    String? catColor;

    if (category is Map<String, dynamic>) {
      catId = category['_id'] as String? ?? '';
      catName = category['name'] as String?;
      catIcon = category['icon'] as String?;
      catColor = category['color'] as String?;
    } else {
      catId = category as String? ?? '';
    }

    return Budget(
      id: json['_id'] as String? ?? '',
      categoryId: catId,
      categoryName: catName,
      categoryIcon: catIcon,
      categoryColor: catColor,
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      period: json['period'] as String? ?? 'monthly',
      month: json['month'] as int? ?? DateTime.now().month,
      year: json['year'] as int? ?? DateTime.now().year,
      spent: (json['spent'] as num?)?.toDouble() ?? 0,
      rollover: json['rollover'] as bool? ?? false,
      notifyAt: json['notifyAt'] as int? ?? 80,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: json['createdAt'] as String? ?? '',
    );
  }

  Map<String, dynamic> toCreateJson() {
    return {
      'category': categoryId,
      'amount': amount,
      'month': month,
      'year': year,
      if (period != 'monthly') 'period': period,
      if (rollover) 'rollover': rollover,
      if (notifyAt != 80) 'notifyAt': notifyAt,
    };
  }

  double get remaining => amount - spent;
  double get percentage => amount > 0 ? (spent / amount) * 100 : 0;
  bool get isOverBudget => spent > amount;
}

class BudgetSummary {
  final String id;
  final String categoryId;
  final String? categoryName;
  final String? categoryIcon;
  final String? categoryColor;
  final double amount;
  final double spent;
  final double remaining;
  final double percentage;
  final String period;
  final int month;
  final int year;

  BudgetSummary({
    required this.id,
    required this.categoryId,
    this.categoryName,
    this.categoryIcon,
    this.categoryColor,
    required this.amount,
    required this.spent,
    required this.remaining,
    required this.percentage,
    required this.period,
    required this.month,
    required this.year,
  });

  factory BudgetSummary.fromJson(Map<String, dynamic> json) {
    dynamic category = json['category'];
    String catId = '';
    String? catName;
    String? catIcon;
    String? catColor;

    if (category is Map<String, dynamic>) {
      catId = category['_id'] as String? ?? '';
      catName = category['name'] as String?;
      catIcon = category['icon'] as String?;
      catColor = category['color'] as String?;
    }

    return BudgetSummary(
      id: json['_id'] as String? ?? '',
      categoryId: catId,
      categoryName: catName,
      categoryIcon: catIcon,
      categoryColor: catColor,
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      spent: (json['spent'] as num?)?.toDouble() ?? 0,
      remaining: (json['remaining'] as num?)?.toDouble() ?? 0,
      percentage: (json['percentage'] as num?)?.toDouble() ?? 0,
      period: json['period'] as String? ?? 'monthly',
      month: json['month'] as int? ?? DateTime.now().month,
      year: json['year'] as int? ?? DateTime.now().year,
    );
  }
}
