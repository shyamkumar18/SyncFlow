import 'package:flutter/material.dart';
import 'package:syncflow/services/api_service.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  final _api = ApiService();
  List _categories = [];
  Map<String, dynamic>? _overview;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    try {
      final results = await Future.wait([
        _api.get('/analytics/spending-by-category'),
        _api.get('/analytics/overview'),
      ]);
      setState(() {
        _categories = (results[0]['data'] as List?) ?? [];
        _overview = results[1]['data'] as Map<String, dynamic>?;
      });
    } catch (_) {} finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Analytics')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetch,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Monthly Summary', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 16),
                          _statRow('Income', (_overview?['totalIncome'] ?? 0).toDouble(), Colors.green),
                          const Divider(),
                          _statRow('Expense', (_overview?['totalExpense'] ?? 0).toDouble(), Colors.red),
                          const Divider(),
                          _statRow('Savings', (_overview?['savings'] ?? 0).toDouble(), (_overview?['savings'] ?? 0) >= 0 ? Colors.green : Colors.red),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Spending by Category', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600)),
                          const SizedBox(height: 12),
                          if (_categories.isEmpty)
                            const Padding(padding: EdgeInsets.all(16), child: Center(child: Text('No data', style: TextStyle(color: Colors.grey))))
                          else
                            ...(_categories as List).map((c) {
                              final m = c as Map<String, dynamic>;
                              return Padding(
                                padding: const EdgeInsets.symmetric(vertical: 4),
                                child: Row(
                                  children: [
                                    SizedBox(width: 80, child: Text('${m['percentage']}%', style: const TextStyle(fontWeight: FontWeight.w600))),
                                    Expanded(child: Text('Category ${m['categoryId']?.toString().substring(0, 6) ?? ''}')),
                                    Text('₹${(m['total'] as num?)?.toStringAsFixed(0) ?? '0'}'),
                                  ],
                                ),
                              );
                            }),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _statRow(String label, double value, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label),
        Text('₹${value.toStringAsFixed(0)}', style: TextStyle(fontWeight: FontWeight.w600, color: color)),
      ],
    );
  }
}
