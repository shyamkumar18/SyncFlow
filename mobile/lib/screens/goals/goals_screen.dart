import 'package:flutter/material.dart';
import 'package:syncflow/services/api_service.dart';

class GoalsScreen extends StatefulWidget {
  const GoalsScreen({super.key});

  @override
  State<GoalsScreen> createState() => _GoalsScreenState();
}

class _GoalsScreenState extends State<GoalsScreen> {
  final _api = ApiService();
  List _goals = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    try {
      final res = await _api.get('/goals');
      setState(() => _goals = (res['data'] as List?) ?? []);
    } catch (_) {} finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Goals')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetch,
              child: _goals.isEmpty
                  ? const Center(child: Text('No goals set', style: TextStyle(color: Colors.grey)))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _goals.length,
                      itemBuilder: (_, i) {
                        final g = _goals[i] as Map<String, dynamic>;
                        final target = (g['targetAmount'] ?? 0).toDouble();
                        final current = (g['currentAmount'] ?? 0).toDouble();
                        final pct = target > 0 ? (current / target * 100) : 0.0;
                        final completed = g['isCompleted'] == true;

                        return Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(g['name'] ?? 'Goal', style: const TextStyle(fontWeight: FontWeight.w600)),
                                    _statusChip(completed),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text('${g['category'] ?? ''} · ${g['priority'] ?? ''}', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                                const SizedBox(height: 12),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('₹${current.toStringAsFixed(0)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                                    Text('of ₹${target.toStringAsFixed(0)}', style: TextStyle(color: Colors.grey[600])),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(4),
                                  child: LinearProgressIndicator(
                                    value: (pct / 100).clamp(0.0, 1.0),
                                    backgroundColor: Colors.grey[200],
                                    color: Colors.green,
                                    minHeight: 8,
                                  ),
                                ),
                                Text('${pct.toStringAsFixed(0)}%', style: const TextStyle(fontSize: 12)),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }

  Widget _statusChip(bool completed) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: completed ? Colors.green.withOpacity(0.1) : Colors.blue.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(completed ? 'Completed' : 'In Progress', style: TextStyle(fontSize: 11, color: completed ? Colors.green : Colors.blue)),
    );
  }
}
