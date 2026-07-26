import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/budget_provider.dart';
import '../providers/category_provider.dart';
import '../models/category.dart';
import '../theme/app_colors.dart';
import '../widgets/budget_card.dart';
import '../widgets/gradient_button.dart';
import '../widgets/loading_skeleton.dart';
import '../widgets/empty_state.dart';
import '../widgets/error_display.dart';

class BudgetsScreen extends ConsumerStatefulWidget {
  const BudgetsScreen({super.key});

  @override
  ConsumerState<BudgetsScreen> createState() => _BudgetsScreenState();
}

class _BudgetsScreenState extends ConsumerState<BudgetsScreen> {
  bool _showForm = false;

  void _showCreateDialog() {
    double amount = 0;
    String? categoryId;
    int month = DateTime.now().month;
    int year = DateTime.now().year;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Create Budget'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                decoration: const InputDecoration(labelText: 'Monthly Limit'),
                keyboardType: TextInputType.number,
                onChanged: (v) => amount = double.tryParse(v) ?? 0,
              ),
              const SizedBox(height: 12),
              Consumer(builder: (_, ref, __) {
                final catsAsync = ref.watch(expenseCategoriesProvider);
                return catsAsync.when(
                  data: (cats) => DropdownButtonFormField<String>(
                    decoration: const InputDecoration(labelText: 'Category'),
                    items: cats.map((c) => DropdownMenuItem(value: c.id, child: Text(c.name.replaceAll('_', ' ')))).toList(),
                    onChanged: (v) => categoryId = v,
                  ),
                  loading: () => const CircularProgressIndicator(),
                  error: (_, __) => const Text('Failed to load categories'),
                );
              }),
              const SizedBox(height: 12),
              TextField(
                decoration: const InputDecoration(labelText: 'Month (1-12)'),
                keyboardType: TextInputType.number,
                initialValue: month.toString(),
                onChanged: (v) => month = int.tryParse(v) ?? month,
              ),
              const SizedBox(height: 12),
              TextField(
                decoration: const InputDecoration(labelText: 'Year'),
                keyboardType: TextInputType.number,
                initialValue: year.toString(),
                onChanged: (v) => year = int.tryParse(v) ?? year,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              if (categoryId == null) return;
              await ref.read(budgetServiceProvider).createBudget({
                'category': categoryId,
                'amount': amount,
                'month': month,
                'year': year,
              });
              ref.invalidate(budgetSummaryProvider);
              ref.invalidate(budgetsProvider);
              if (ctx.mounted) Navigator.pop(ctx);
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final budgetsAsync = ref.watch(budgetSummaryProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Budgets'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _showCreateDialog,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(budgetSummaryProvider);
          ref.invalidate(budgetsProvider);
        },
        child: budgetsAsync.when(
          data: (budgets) => budgets.isEmpty
              ? const EmptyState(title: 'No budgets set', description: 'Create a budget to track your spending')
              : ListView.builder(
                  itemCount: budgets.length,
                  itemBuilder: (_, i) => BudgetCard(
                    budget: budgets[i],
                    onDelete: () async {
                      await ref.read(budgetServiceProvider).deleteBudget(budgets[i].id);
                      ref.invalidate(budgetSummaryProvider);
                    },
                  ),
                ),
          loading: () => const CardSkeleton(),
          error: (e, __) => ErrorDisplay(message: e.toString()),
        ),
      ),
    );
  }
}
