import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class BadgeWidget extends StatelessWidget {
  final String label;
  final Color? color;
  final double fontSize;
  final EdgeInsets padding;

  const BadgeWidget({
    super.key,
    required this.label,
    this.color,
    this.fontSize = 11,
    this.padding = const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
  });

  factory BadgeWidget.success(String label) {
    return BadgeWidget(
      label: label,
      color: AppColors.success,
    );
  }

  factory BadgeWidget.warning(String label) {
    return BadgeWidget(
      label: label,
      color: AppColors.warning,
    );
  }

  factory BadgeWidget.error(String label) {
    return BadgeWidget(
      label: label,
      color: AppColors.error,
    );
  }

  factory BadgeWidget.info(String label) {
    return BadgeWidget(
      label: label,
      color: AppColors.info,
    );
  }

  @override
  Widget build(BuildContext context) {
    final bgColor = color ?? AppColors.primary;
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: bgColor.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: FontWeight.w600,
          color: bgColor,
        ),
      ),
    );
  }
}

class CategoryBadge extends StatelessWidget {
  final String name;
  final String? colorHex;

  const CategoryBadge({
    super.key,
    required this.name,
    this.colorHex,
  });

  @override
  Widget build(BuildContext context) {
    final color = colorHex != null
        ? Color(int.parse(colorHex!.replaceFirst('#', '0xFF')))
        : AppColors.getCategoryColor(name);

    return BadgeWidget(
      label: name.replaceAll('_', ' '),
      color: color,
    );
  }
}

class StatusBadge extends StatelessWidget {
  final String status;

  const StatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    final color = AppColors.getStatusColor(status);
    return BadgeWidget(
      label: status[0].toUpperCase() + status.substring(1),
      color: color,
    );
  }
}
