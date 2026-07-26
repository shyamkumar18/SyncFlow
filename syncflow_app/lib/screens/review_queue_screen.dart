import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/review_item.dart';
import '../services/transaction_service.dart';
import '../services/api_client.dart';
import '../theme/app_colors.dart';
import '../widgets/review_item_card.dart';
import '../widgets/loading_skeleton.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_display.dart';

final reviewQueueProvider = FutureProvider<List<ReviewItem>>((ref) async {
  final service = TransactionService(ref.read(apiClientProvider));
  final result = await service.getReviewQueue(limit: 50);
  return result.data.map((e) => ReviewItem.fromJson(e as Map<String, dynamic>)).toList();
});

class ReviewQueueScreen extends ConsumerWidget {
  const ReviewQueueScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final queueAsync = ref.watch(reviewQueueProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Review Queue'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(reviewQueueProvider),
          ),
        ],
      ),
      body: queueAsync.when(
        data: (items) => items.isEmpty
            ? const EmptyState(title: 'No items to review', description: 'All transactions have been reviewed')
            : RefreshIndicator(
                onRefresh: () async => ref.invalidate(reviewQueueProvider),
                child: ListView.builder(
                  itemCount: items.length,
                  itemBuilder: (_, i) => ReviewItemCard(
                    item: items[i],
                    onApprove: () async {
                      try {
                        final service = TransactionService(ref.read(apiClientProvider));
                        await service.approveReviewItem(items[i].id);
                        ref.invalidate(reviewQueueProvider);
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Transaction approved')),
                          );
                        }
                      } catch (e) {
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Failed: $e')),
                          );
                        }
                      }
                    },
                    onReject: () async {
                      try {
                        final service = TransactionService(ref.read(apiClientProvider));
                        await service.rejectReviewItem(items[i].id);
                        ref.invalidate(reviewQueueProvider);
                      } catch (_) {}
                    },
                    onEdit: () => _showEditDialog(context, ref, items[i]),
                  ),
                ),
              ),
        loading: () => const TableSkeleton(),
        error: (e, __) => ErrorDisplay(message: e.toString()),
      ),
    );
  }

  void _showEditDialog(BuildContext context, WidgetRef ref, ReviewItem item) {
    final amountCtrl = TextEditingController(text: item.amount.toString());
    final merchantCtrl = TextEditingController(text: item.merchant ?? '');
    final descCtrl = TextEditingController(text: item.description ?? '');
    String type = item.type;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Edit Transaction'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'debit', label: Text('Debit')),
                  ButtonSegment(value: 'credit', label: Text('Credit')),
                ],
                selected: {type},
                onSelectionChanged: (v) => type = v.first,
              ),
              const SizedBox(height: 12),
              TextField(controller: amountCtrl, decoration: const InputDecoration(labelText: 'Amount'), keyboardType: TextInputType.number),
              TextField(controller: merchantCtrl, decoration: const InputDecoration(labelText: 'Merchant')),
              TextField(controller: descCtrl, decoration: const InputDecoration(labelText: 'Description'), maxLines: 3),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              try {
                final service = TransactionService(ref.read(apiClientProvider));
                await service.updateReviewItem(item.id, {
                  'amount': double.tryParse(amountCtrl.text) ?? item.amount,
                  'type': type,
                  if (merchantCtrl.text.isNotEmpty) 'merchant': merchantCtrl.text,
                  if (descCtrl.text.isNotEmpty) 'description': descCtrl.text,
                });
                ref.invalidate(reviewQueueProvider);
                if (ctx.mounted) Navigator.pop(ctx);
              } catch (_) {}
            },
            child: const Text('Save & Create'),
          ),
        ],
      ),
    );
  }
}
