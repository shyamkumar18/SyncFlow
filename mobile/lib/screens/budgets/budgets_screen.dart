import 'package:flutter/material.dart';
import 'package:syncflow/services/api_service.dart';

class BudgetsScreen extends StatefulWidget {
  const BudgetsScreen({super.key});

  @override
  State<BudgetsScreen> createState() => _BudgetsScreenState();
}

class _BudgetsScreenState extends State<BudgetsScreen> {
  final _api = ApiService();
  List _budgets = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    try {
      final res = await _api.get('/budgets/summary');
      setState(() => _budgets = (res['data'] as List?) ?? []);
    } catch (_) {} finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Budgets')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetch,
              child: _budgets.isEmpty
                  ? const Center(child: Text('No budgets set', style: TextStyle(color: Colors.grey)))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _budgets.length,
                      itemBuilder: (_, i) {
                        final b = _budgets[i] as Map<String, dynamic>;
                        final cat = b['category'] as Map<String, dynamic>?;
                        final amount = (b['amount'] ?? 0).toDouble();
                        final spent = (b['spent'] ?? 0).toDouble();
                        final pct = amount > 0 ? (spent / amount * 100) : 0.0;
                        final over = pct >= 100;

                        return Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(cat?['name'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.w600)),
                                    Text('₹${spent.toStringAsFixed(0)} / ₹${amount.toStringAsFixed(0)}'),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(4),
                                  child: LinearProgressIndicator(
                                    value: (pct / 100).clamp(0.0, 1.0),
                                    backgroundColor: Colors.grey[200],
                                    color: over ? Colors.red : Colors.green,
                                    minHeight: 8,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text('${pct.toStringAsFixed(0)}% used', style: TextStyle(fontSize: 12, color: over ? Colors.red : Colors.grey)),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
