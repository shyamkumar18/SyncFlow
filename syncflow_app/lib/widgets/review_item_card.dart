import 'package:flutter/material.dart';
import '../models/review_item.dart';
import '../theme/app_colors.dart';
import '../utils/formatters.dart';
import 'badge_widget.dart';

class ReviewItemCard extends StatelessWidget {
  final ReviewItem item;
  final VoidCallback? onApprove;
  final VoidCallback? onEdit;
  final VoidCallback? onReject;

  const ReviewItemCard({
    super.key,
    required this.item,
    this.onApprove,
    this.onEdit,
    this.onReject,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isCredit = item.type == 'credit';
    final isLow = item.confidence < 30;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    Formatters.formatCurrency(item.amount),
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: isCredit ? AppColors.income : AppColors.expense,
                    ),
                  ),
                ),
                BadgeWidget(
                  label: '${item.confidence.toStringAsFixed(0)}% confidence',
                  color: isLow ? AppColors.error : AppColors.warning,
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (item.merchant != null)
              Text(
                item.merchant!,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                ),
              ),
            if (item.description != null)
              Text(
                item.description!,
                style: TextStyle(
                  fontSize: 13,
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 4,
              children: [
                BadgeWidget(label: item.bank, color: AppColors.primary),
                BadgeWidget(
                  label: isCredit ? 'Credit' : 'Debit',
                  color: isCredit ? AppColors.income : AppColors.expense,
                ),
                BadgeWidget(label: Formatters.formatDate(item.date), color: AppColors.info),
                if (item.referenceNumber != null)
                  BadgeWidget(label: 'Ref: ${item.referenceNumber}', color: AppColors.secondary),
              ],
            ),
            if (item.detectionDetails != null) ...[
              const SizedBox(height: 8),
              Text(
                item.detectionDetails!,
                style: TextStyle(
                  fontSize: 11,
                  fontStyle: FontStyle.italic,
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ),
              ),
            ],
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (onReject != null)
                  TextButton.icon(
                    onPressed: onReject,
                    icon: const Icon(Icons.close, size: 18),
                    label: const Text('Reject'),
                    style: TextButton.styleFrom(foregroundColor: AppColors.textSecondaryLight),
                  ),
                const SizedBox(width: 4),
                if (onEdit != null)
                  TextButton.icon(
                    onPressed: onEdit,
                    icon: const Icon(Icons.edit, size: 18),
                    label: const Text('Edit'),
                  ),
                const SizedBox(width: 4),
                if (onApprove != null)
                  ElevatedButton.icon(
                    onPressed: onApprove,
                    icon: const Icon(Icons.check, size: 18),
                    label: const Text('Approve'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
