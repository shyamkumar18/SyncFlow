class Category {
  final String id;
  final String? userId;
  final String name;
  final String type;
  final String icon;
  final String color;
  final bool isDefault;
  final String? parent;
  final int sortOrder;
  final bool isActive;
  final String createdAt;
  final String updatedAt;

  Category({
    required this.id,
    this.userId,
    required this.name,
    required this.type,
    this.icon = 'category',
    this.color = '#6C757D',
    this.isDefault = false,
    this.parent,
    this.sortOrder = 0,
    this.isActive = true,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['_id'] as String? ?? '',
      userId: json['userId'] as String?,
      name: json['name'] as String? ?? '',
      type: json['type'] as String? ?? 'expense',
      icon: json['icon'] as String? ?? 'category',
      color: json['color'] as String? ?? '#6C757D',
      isDefault: json['isDefault'] as bool? ?? false,
      parent: json['parent'] as String?,
      sortOrder: json['sortOrder'] as int? ?? 0,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: json['createdAt'] as String? ?? '',
      updatedAt: json['updatedAt'] as String? ?? '',
    );
  }

  Map<String, dynamic> toCreateJson() {
    return {
      'name': name,
      'type': type,
      if (icon != 'category') 'icon': icon,
      if (color != '#6C757D') 'color': color,
      if (parent != null) 'parent': parent,
    };
  }
}
