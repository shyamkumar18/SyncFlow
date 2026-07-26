import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const Color primary = Color(0xFF3B82F6);
  static const Color primaryLight = Color(0xFF60A5FA);
  static const Color primaryDark = Color(0xFF2563EB);

  static const Color secondary = Color(0xFF8B5CF6);
  static const Color accent = Color(0xFF06B6D4);

  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);

  static const Color income = Color(0xFF10B981);
  static const Color expense = Color(0xFFEF4444);

  static const Color surfaceLight = Color(0xFFF8FAFC);
  static const Color surfaceDark = Color(0xFF0F172A);

  static const Color cardLight = Color(0xFFFFFFFF);
  static const Color cardDark = Color(0xFF1E293B);

  static const Color textPrimaryLight = Color(0xFF1E293B);
  static const Color textSecondaryLight = Color(0xFF64748B);
  static const Color textPrimaryDark = Color(0xFFF1F5F9);
  static const Color textSecondaryDark = Color(0xFF94A3B8);

  static const Color borderLight = Color(0xFFE2E8F0);
  static const Color borderDark = Color(0xFF334155);

  static const Color shimmerBaseLight = Color(0xFFE2E8F0);
  static const Color shimmerHighlightLight = Color(0xFFF1F5F9);
  static const Color shimmerBaseDark = Color(0xFF334155);
  static const Color shimmerHighlightDark = Color(0xFF475569);

  static const List<Color> chartColors = [
    Color(0xFF3B82F6),
    Color(0xFF10B981),
    Color(0xFFF59E0B),
    Color(0xFFEF4444),
    Color(0xFF8B5CF6),
    Color(0xFF06B6D4),
    Color(0xFFEC4899),
    Color(0xFF14B8A6),
  ];

  static const Map<String, Color> categoryColors = {
    'food_dining': Color(0xFFEF4444),
    'groceries': Color(0xFF10B981),
    'transport': Color(0xFF3B82F6),
    'shopping': Color(0xFFEC4899),
    'entertainment': Color(0xFF8B5CF6),
    'bills_utilities': Color(0xFFF59E0B),
    'healthcare': Color(0xFF06B6D4),
    'education': Color(0xFF6366F1),
    'housing': Color(0xFF14B8A6),
    'travel': Color(0xFFF97316),
    'insurance': Color(0xFF64748B),
    'investment': Color(0xFF0D9488),
    'subscriptions': Color(0xFFA855F7),
    'emi': Color(0xFFDC2626),
    'loan_repayment': Color(0xFFB91C1C),
    'atm_withdrawal': Color(0xFF78716C),
    'transfer': Color(0xFF2DD4BF),
    'tax': Color(0xFF92400E),
    'charity': Color(0xFFF472B6),
    'salary': Color(0xFF10B981),
    'freelance': Color(0xFF3B82F6),
    'refund': Color(0xFF06B6D4),
    'cashback': Color(0xFFF59E0B),
    'interest': Color(0xFF8B5CF6),
    'dividend': Color(0xFF6366F1),
    'others_income': Color(0xFF94A3B8),
    'others_expense': Color(0xFF94A3B8),
  };

  static Color getCategoryColor(String category) {
    return categoryColors[category] ?? const Color(0xFF94A3B8);
  }

  static Color getStatusColor(String status) {
    switch (status) {
      case 'success':
        return success;
      case 'failed':
        return error;
      case 'pending':
        return warning;
      case 'refunded':
        return info;
      default:
        return warning;
    }
  }
}
