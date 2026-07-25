import 'package:flutter/material.dart';
import 'package:syncflow/services/api_service.dart';

class MailCenterScreen extends StatefulWidget {
  const MailCenterScreen({super.key});

  @override
  State<MailCenterScreen> createState() => _MailCenterScreenState();
}

class _MailCenterScreenState extends State<MailCenterScreen> {
  final _api = ApiService();
  List _emails = [];
  bool _loading = true;
  bool _syncing = false;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    try {
      final res = await _api.get('/emails', query: {'limit': '20'});
      setState(() => _emails = res['data'] as List);
    } catch (_) {} finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _sync() async {
    setState(() => _syncing = true);
    try {
      await _api.post('/emails/sync', body: {'maxResults': 50});
      await _fetch();
    } catch (_) {} finally {
      setState(() => _syncing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mail Center'),
        actions: [
          IconButton(
            onPressed: _syncing ? null : _sync,
            icon: _syncing
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.sync),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _emails.isEmpty
              ? const Center(child: Text('No banking emails', style: TextStyle(color: Colors.grey)))
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: _emails.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (_, i) {
                    final e = _emails[i] as Map<String, dynamic>;
                    return Card(
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                _chip(e['bank'] ?? 'Unknown', Colors.green),
                                const SizedBox(width: 6),
                                _chip(e['category'] ?? 'unknown', Colors.grey),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(e['subject'] ?? '', style: const TextStyle(fontWeight: FontWeight.w500), maxLines: 1, overflow: TextOverflow.ellipsis),
                            const SizedBox(height: 4),
                            Text(e['snippet'] ?? '', style: TextStyle(color: Colors.grey[600], fontSize: 13), maxLines: 2, overflow: TextOverflow.ellipsis),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }

  Widget _chip(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(text, style: TextStyle(fontSize: 11, color: color)),
    );
  }
}
