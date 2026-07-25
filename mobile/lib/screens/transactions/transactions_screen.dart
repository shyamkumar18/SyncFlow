import 'package:flutter/material.dart';
import 'package:syncflow/services/api_service.dart';

class TransactionsScreen extends StatefulWidget {
  const TransactionsScreen({super.key});

  @override
  State<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends State<TransactionsScreen> {
  final _api = ApiService();
  List _transactions = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    try {
      final res = await _api.get('/transactions', query: {'limit': '50'});
      setState(() => _transactions = res['data'] as List);
    } catch (_) {} finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Transactions')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetch,
              child: _transactions.isEmpty
                  ? const Center(child: Text('No transactions', style: TextStyle(color: Colors.grey)))
                  : ListView.separated(
                      padding: const EdgeInsets.all(16),
                      itemCount: _transactions.length,
                      separatorBuilder: (_, __) => const Divider(height: 1),
                      itemBuilder: (_, i) {
                        final t = _transactions[i] as Map<String, dynamic>;
                        final isCredit = t['type'] == 'credit';
                        final amt = (t['amount'] ?? 0).toDouble();
                        return ListTile(
                          title: Text(t['merchant'] ?? t['description'] ?? 'Transaction', style: const TextStyle(fontSize: 14)),
                          subtitle: Text('${t['bank']} · ${t['date']?.toString().substring(0, 10)}'),
                          trailing: Text(
                            '${isCredit ? '+' : '-'}₹${amt.toStringAsFixed(0)}',
                            style: TextStyle(fontWeight: FontWeight.w600, color: isCredit ? Colors.green : Colors.red),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
