class Goal {
  final String id;
  final String name;
  final double targetAmount;
  final double currentAmount;
  final String? targetDate;
  final String icon;
  final String color;
  final String category;
  final String priority;
  final String? notes;
  final bool isCompleted;
  final String? completedAt;
  final bool isActive;
  final String createdAt;

  Goal({
    required this.id,
    required this.name,
    required this.targetAmount,
    this.currentAmount = 0,
    this.targetDate,
    this.icon = 'flag',
    this.color = '#0D6B4F',
    this.category = 'savings',
    this.priority = 'medium',
    this.notes,
    this.isCompleted = false,
    this.completedAt,
    this.isActive = true,
    required this.createdAt,
  });

  factory Goal.fromJson(Map<String, dynamic> json) {
    return Goal(
      id: json['_id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      targetAmount: (json['targetAmount'] as num?)?.toDouble() ?? 0,
      currentAmount: (json['currentAmount'] as num?)?.toDouble() ?? 0,
      targetDate: json['targetDate'] as String?,
      icon: json['icon'] as String? ?? 'flag',
      color: json['color'] as String? ?? '#0D6B4F',
      category: json['category'] as String? ?? 'savings',
      priority: json['priority'] as String? ?? 'medium',
      notes: json['notes'] as String?,
      isCompleted: json['isCompleted'] as bool? ?? false,
      completedAt: json['completedAt'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: json['createdAt'] as String? ?? '',
    );
  }

  Map<String, dynamic> toCreateJson() {
    return {
      'name': name,
      'targetAmount': targetAmount,
      if (currentAmount != 0) 'currentAmount': currentAmount,
      if (targetDate != null) 'targetDate': targetDate,
      if (icon != 'flag') 'icon': icon,
      if (color != '#0D6B4F') 'color': color,
      if (category != 'savings') 'category': category,
      if (priority != 'medium') 'priority': priority,
      if (notes != null) 'notes': notes,
    };
  }

  double get percentage {
    if (targetAmount <= 0) return 0;
    return (currentAmount / targetAmount) * 100;
  }

  double get remaining => targetAmount - currentAmount;
}
