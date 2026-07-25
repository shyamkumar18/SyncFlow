import 'package:flutter/material.dart';
import 'package:syncflow/theme/app_theme.dart';
import 'package:syncflow/services/api_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _api = ApiService();
  Map<String, dynamic>? _data;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final res = await _api.get('/analytics/overview');
      setState(() => _data = res['data']);
    } catch (_) {} finally {
      setState(() => _loading = false);
    }
  }

  String _fmt(num amount) {
    return '₹${amount.toStringAsFixed(0)}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('\$yncFlow')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetchData,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _buildSummaryCards(),
                  const SizedBox(height: 16),
                  _buildRecentTransactions(),
                ],
              ),
            ),
    );
  }

  Widget _buildSummaryCards() {
    final income = (_data?['totalIncome'] ?? 0).toDouble();
    final expense = (_data?['totalExpense'] ?? 0).toDouble();
    final savings = (_data?['savings'] ?? 0).toDouble();

    return Column(
      children: [
        Row(
          children: [
            Expanded(child: _card('Income', _fmt(income), Colors.green)),
            const SizedBox(width: 12),
            Expanded(child: _card('Expense', _fmt(expense), Colors.red)),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _card('Savings', _fmt(savings.abs()), savings >= 0 ? Colors.green : Colors.red)),
            const SizedBox(width: 12),
            Expanded(child: _card('Year', _fmt((_data?['yearIncome'] ?? 0).toDouble() - (_data?['yearExpense'] ?? 0).toDouble()), Colors.blue)),
          ],
        ),
      ],
    );
  }

  Widget _card(String label, String value, Color color) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
            const SizedBox(height: 4),
            Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: color)),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentTransactions() {
    final txns = (_data?['recentTransactions'] as List?) ?? [];
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Recent Transactions', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                TextButton(onPressed: () {}, child: const Text('View all')),
              ],
            ),
            const SizedBox(height: 8),
            if (txns.isEmpty)
              const Padding(padding: EdgeInsets.all(24), child: Center(child: Text('No transactions', style: TextStyle(color: Colors.grey))))
            else
              ...txns.take(5).map((t) => _transactionItem(t)),
          ],
        ),
      ),
    );
  }

  Widget _transactionItem(Map<String, dynamic> t) {
    final isCredit = t['type'] == 'credit';
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        width: 40, height: 40,
        decoration: BoxDecoration(
          color: isCredit ? Colors.green.withOpacity(0.1) : Colors.red.withOpacity(0.1),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(isCredit ? Icons.arrow_downward : Icons.arrow_upward, color: isCredit ? Colors.green : Colors.red, size: 18),
      ),
      title: Text(t['merchant'] ?? t['description'] ?? 'Transaction', style: const TextStyle(fontSize: 14)),
      subtitle: Text('${t['bank']} · ${t['date']?.toString().substring(0, 10) ?? ''}', style: const TextStyle(fontSize: 12)),
      trailing: Text(
        '${isCredit ? '+' : '-'}${_fmt((t['amount'] ?? 0).toDouble())}',
        style: TextStyle(fontWeight: FontWeight.w600, color: isCredit ? Colors.green : Colors.red),
      ),
    );
  }
}
