import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/transaction.dart';
import '../providers/transaction_provider.dart';
import '../theme/app_colors.dart';
import '../utils/formatters.dart';
import '../widgets/transaction_card.dart';
import '../widgets/stat_card.dart';
import '../widgets/loading_skeleton.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_display.dart';
import '../widgets/pagination_widget.dart';
import '../widgets/gradient_button.dart';

class TransactionsScreen extends ConsumerStatefulWidget {
  const TransactionsScreen({super.key});

  @override
  ConsumerState<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends ConsumerState<TransactionsScreen> {
  String? _typeFilter;
  String? _statusFilter;
  String? _categoryFilter;
  String? _searchQuery;
  DateTime? _startDate;
  DateTime? _endDate;
  bool _showFilters = false;
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(transactionsProvider.notifier).loadTransactions();
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _applyFilters() {
    ref.read(transactionsProvider.notifier).loadTransactions(
      type: _typeFilter,
      status: _statusFilter,
      category: _categoryFilter,
      search: _searchQuery,
      startDate: _startDate?.toIso8601String().split('T').first,
      endDate: _endDate?.toIso8601String().split('T').first,
    );
  }

  void _showAddTransactionDialog() {
    final amountCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final merchantCtrl = TextEditingController();
    String type = 'debit';
    DateTime date = DateTime.now();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Transaction'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SegmentedButton<String>(
                segments: const [
                  ButtonSegment(value: 'debit', label: Text('Spent')),
                  ButtonSegment(value: 'credit', label: Text('Gained')),
                ],
                selected: {type},
                onSelectionChanged: (v) => type = v.first,
              ),
              const SizedBox(height: 12),
              TextField(controller: amountCtrl, decoration: const InputDecoration(labelText: 'Amount'), keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              TextField(controller: merchantCtrl, decoration: const InputDecoration(labelText: 'Merchant')),
              const SizedBox(height: 12),
              TextField(controller: descCtrl, decoration: const InputDecoration(labelText: 'Description')),
              const SizedBox(height: 12),
              ListTile(
                title: Text(Formatters.formatDate(date.toIso8601String())),
                trailing: const Icon(Icons.calendar_today),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: ctx,
                    initialDate: date,
                    firstDate: DateTime(2020),
                    lastDate: DateTime.now(),
                  );
                  if (picked != null) date = picked;
                },
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              ref.read(transactionsProvider.notifier).createManualTransaction({
                'amount': double.tryParse(amountCtrl.text) ?? 0,
                'type': type,
                'date': date.toIso8601String().split('T').first,
                if (merchantCtrl.text.isNotEmpty) 'merchant': merchantCtrl.text,
                if (descCtrl.text.isNotEmpty) 'description': descCtrl.text,
                'bank': 'Manual',
              });
              Navigator.pop(ctx);
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(transactionsProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final summaryAsync = ref.watch(transactionSummaryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Transactions'),
        actions: [
          IconButton(
            icon: Icon(_showFilters ? Icons.filter_list_off : Icons.filter_list),
            onPressed: () => setState(() => _showFilters = !_showFilters),
          ),
          IconButton(
            icon: const Icon(Icons.add_circle_outline),
            onPressed: _showAddTransactionDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          summaryAsync.when(
            data: (summary) => Padding(
              padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
              child: Row(
                children: [
                  Expanded(child: StatCard(label: 'Income', value: summary.totalIncome, valueColor: AppColors.income, compact: true)),
                  Expanded(child: StatCard(label: 'Expense', value: summary.totalExpense, valueColor: AppColors.expense, compact: true)),
                  Expanded(child: StatCard(label: 'Net', value: summary.net, valueColor: summary.net >= 0 ? AppColors.income : AppColors.expense, compact: true)),
                ],
              ),
            ),
            loading: () => const SizedBox(height: 80),
            error: (_, __) => const SizedBox.shrink(),
          ),
          if (_showFilters) _buildFilterPanel(isDark),
          Expanded(
            child: state.loading && state.transactions.isEmpty
                ? const TableSkeleton()
                : state.error != null
                    ? ErrorDisplay(message: state.error!, onRetry: () => ref.read(transactionsProvider.notifier).refresh())
                    : state.transactions.isEmpty
                        ? const EmptyState(title: 'No transactions yet', description: 'Sync your Gmail or add a manual transaction')
                        : ListView.builder(
                            itemCount: state.transactions.length + (state.pagination != null && state.pagination!.hasMore ? 1 : 0),
                            itemBuilder: (_, i) {
                              if (i >= state.transactions.length) {
                                ref.read(transactionsProvider.notifier).loadMore();
                                return const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()));
                              }
                              final t = state.transactions[i];
                              return TransactionCard(
                                transaction: t,
                                onTap: () => _showDetail(t),
                                onDelete: () => _confirmDelete(t.id),
                              );
                            },
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterPanel(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.cardDark : AppColors.cardLight,
        border: Border(bottom: BorderSide(color: isDark ? AppColors.borderDark : AppColors.borderLight)),
      ),
      child: Column(
        children: [
          TextField(
            controller: _searchCtrl,
            decoration: const InputDecoration(
              hintText: 'Search merchant or bank',
              prefixIcon: Icon(Icons.search),
              isDense: true,
            ),
            onSubmitted: (v) {
              _searchQuery = v;
              _applyFilters();
            },
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _filterChip('All', _typeFilter == null, () => setState(() { _typeFilter = null; _applyFilters(); })),
                _filterChip('Income', _typeFilter == 'credit', () => setState(() { _typeFilter = 'credit'; _applyFilters(); })),
                _filterChip('Expense', _typeFilter == 'debit', () => setState(() { _typeFilter = 'debit'; _applyFilters(); })),
                const SizedBox(width: 8),
                _filterChip('Success', _statusFilter == 'success', () => setState(() { _statusFilter = 'success'; _applyFilters(); })),
                _filterChip('Pending', _statusFilter == 'pending', () => setState(() { _statusFilter = 'pending'; _applyFilters(); })),
                _filterChip('Failed', _statusFilter == 'failed', () => setState(() { _statusFilter = 'failed'; _applyFilters(); })),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip(String label, bool selected, VoidCallback onTap) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: FilterChip(
        label: Text(label, style: TextStyle(fontSize: 12, color: selected ? Colors.white : null)),
        selected: selected,
        onSelected: (_) => onTap(),
        selectedColor: AppColors.primary,
        checkmarkColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 4),
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
    );
  }

  void _showDetail(Transaction t) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => TransactionDetailSheet(transaction: t),
    );
  }

  void _confirmDelete(String id) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Transaction'),
        content: const Text('Are you sure you want to delete this transaction?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              ref.read(transactionsProvider.notifier).deleteTransaction(id);
              Navigator.pop(ctx);
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
