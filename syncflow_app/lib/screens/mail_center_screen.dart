import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/email_provider.dart';
import '../theme/app_colors.dart';
import '../utils/formatters.dart';
import '../widgets/email_card.dart';
import '../widgets/gradient_button.dart';
import '../widgets/loading_skeleton.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_display.dart';

class MailCenterScreen extends ConsumerStatefulWidget {
  const MailCenterScreen({super.key});

  @override
  ConsumerState<MailCenterScreen> createState() => _MailCenterScreenState();
}

class _MailCenterScreenState extends ConsumerState<MailCenterScreen> {
  String? _categoryFilter;
  String? _searchQuery;
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(emailsProvider.notifier).loadEmails();
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(emailsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Mail Center'),
        actions: [
          GradientButton(
            label: 'Sync',
            expanded: false,
            height: 36,
            onPressed: () => ref.read(emailsProvider.notifier).syncEmails(),
            icon: Icons.sync,
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          if (state.stats != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
              child: Text(
                '${state.stats!.total} banking emails from ${state.stats!.banks.length} banks',
                style: TextStyle(
                  fontSize: 13,
                  color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
                ),
              ),
            ),
          if (state.syncResult != null)
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.success.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.success.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, color: AppColors.success, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      '${state.syncResult!.transactionsCreated ?? 0} new transactions, ${state.syncResult!.sentForReview ?? 0} for review',
                      style: const TextStyle(fontSize: 13, color: AppColors.success),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 16),
                    onPressed: () => ref.read(emailsProvider.notifier).refresh(),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                  ),
                ],
              ),
            ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 4),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchCtrl,
                    decoration: const InputDecoration(
                      hintText: 'Search emails...',
                      prefixIcon: Icon(Icons.search),
                      isDense: true,
                      border: OutlineInputBorder(),
                    ),
                    onSubmitted: (v) {
                      _searchQuery = v;
                      ref.read(emailsProvider.notifier).loadEmails(search: v);
                    },
                  ),
                ),
                const SizedBox(width: 8),
                DropdownButton<String>(
                  value: _categoryFilter,
                  hint: const Text('All', style: TextStyle(fontSize: 13)),
                  underline: const SizedBox(),
                  items: ['All', 'transaction', 'credit_card', 'debit_card', 'upi', 'emi', 'loan', 'refund', 'failed', 'statement']
                      .map((c) => DropdownMenuItem(value: c == 'All' ? null : c, child: Text(Formatters.capitalize(c.replaceAll('_', ' ')), style: const TextStyle(fontSize: 13))))
                      .toList(),
                  onChanged: (v) {
                    setState(() => _categoryFilter = v);
                    ref.read(emailsProvider.notifier).loadEmails(category: v);
                  },
                ),
              ],
            ),
          ),
          Expanded(
            child: state.loading && state.emails.isEmpty
                ? const TableSkeleton(rows: 6)
                : state.error != null
                    ? ErrorDisplay(message: state.error!, onRetry: () => ref.read(emailsProvider.notifier).refresh())
                    : state.emails.isEmpty
                        ? const EmptyState(title: 'No emails synced', description: 'Connect Gmail and sync your banking emails')
                        : ListView.builder(
                            itemCount: state.emails.length,
                            itemBuilder: (_, i) => EmailCard(email: state.emails[i]),
                          ),
          ),
        ],
      ),
    );
  }
}
