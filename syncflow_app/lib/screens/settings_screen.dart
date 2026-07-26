import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/setting.dart';
import '../providers/auth_provider.dart';
import '../providers/settings_provider.dart';
import '../providers/theme_provider.dart';
import '../theme/app_colors.dart';
import '../core/constants.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  final _nameCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    _nameCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final user = ref.watch(authProvider).user;
    final settingsAsync = ref.watch(settingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        bottom: TabBar(
          controller: _tabCtrl,
          tabs: const [
            Tab(text: 'Profile'),
            Tab(text: 'Preferences'),
            Tab(text: 'Account'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabCtrl,
        children: [
          _ProfileTab(user: user, nameCtrl: _nameCtrl),
          _PreferencesTab(ref: ref, settingsAsync: settingsAsync),
          _AccountTab(ref: ref),
        ],
      ),
    );
  }
}

class _ProfileTab extends StatelessWidget {
  final user;
  final TextEditingController nameCtrl;

  const _ProfileTab({required this.user, required this.nameCtrl});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const SizedBox(height: 20),
        Center(
          child: CircleAvatar(
            radius: 40,
            backgroundColor: AppColors.primary,
            child: Text(
              user?.initials ?? '?',
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
            ),
          ),
        ),
        const SizedBox(height: 24),
        TextField(
          controller: nameCtrl..text = user?.displayName ?? '',
          decoration: const InputDecoration(labelText: 'Display Name'),
        ),
        const SizedBox(height: 16),
        TextField(
          decoration: const InputDecoration(labelText: 'Email'),
          enabled: false,
          controller: TextEditingController(text: user?.email ?? ''),
        ),
        const SizedBox(height: 24),
        ElevatedButton(
          onPressed: () async {
            if (nameCtrl.text.trim().isNotEmpty) {
              // update profile
            }
          },
          child: const Text('Save'),
        ),
      ],
    );
  }
}

class _PreferencesTab extends ConsumerWidget {
  final WidgetRef ref;
  final AsyncValue<AppSettings> settingsAsync;

  const _PreferencesTab({required this.ref, required this.settingsAsync});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return settingsAsync.when(
      data: (settings) => ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _PrefTile(
            label: 'Monthly Income',
            value: settings.monthlyIncome.toString(),
            icon: Icons.trending_up,
          ),
          _PrefTile(
            label: 'Currency',
            value: settings.currency,
            icon: Icons.currency_rupee,
            onTap: () => _showPicker(context, AppConstants.currencies, (v) {
              ref.read(settingsServiceProvider).updateSettings({'currency': v});
              ref.invalidate(settingsProvider);
            }),
          ),
          _PrefTile(
            label: 'Theme',
            value: settings.theme,
            icon: Icons.dark_mode,
            onTap: () => _showPicker(context, AppConstants.themes, (v) {
              ref.read(settingsServiceProvider).updateSettings({'theme': v});
              ref.invalidate(settingsProvider);
              ref.read(themeProvider.notifier).setTheme(
                v == 'dark' ? ThemeMode.dark : v == 'light' ? ThemeMode.light : ThemeMode.system,
              );
            }),
          ),
          _PrefTile(
            label: 'Timezone',
            value: settings.timezone,
            icon: Icons.timezone,
            onTap: () => _showPicker(context, AppConstants.timezones, (v) {
              ref.read(settingsServiceProvider).updateSettings({'timezone': v});
              ref.invalidate(settingsProvider);
            }),
          ),
          const SizedBox(height: 24),
          const Text('Notification Preferences', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          _SwitchTile(label: 'Email Sync Alerts', value: settings.notificationPreferences.emailSync),
          _SwitchTile(label: 'Budget Alerts', value: settings.notificationPreferences.budgetAlerts),
          _SwitchTile(label: 'Goal Reminders', value: settings.notificationPreferences.goalReminders),
          _SwitchTile(label: 'Monthly Report', value: settings.notificationPreferences.monthlyReport),
        ],
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (e, __) => Center(child: Text('$e')),
    );
  }

  void _showPicker(BuildContext context, List<String> options, ValueChanged<String> onSelected) {
    showDialog(
      context: context,
      builder: (ctx) => SimpleDialog(
        children: options.map((o) => SimpleDialogOption(
          onPressed: () { onSelected(o); Navigator.pop(ctx); },
          child: Text(o),
        )).toList(),
      ),
    );
  }
}

class _AccountTab extends ConsumerWidget {
  final WidgetRef ref;

  const _AccountTab({required this.ref});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: AppColors.error.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
          ),
          child: Column(
            children: [
              const Icon(Icons.warning_amber_rounded, color: AppColors.error, size: 40),
              const SizedBox(height: 12),
              const Text('Danger Zone', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.error)),
              const SizedBox(height: 8),
              const Text('Deleting your account is permanent and cannot be undone.'),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: () => _confirmDelete(context),
                icon: const Icon(Icons.delete_forever),
                label: const Text('Delete My Account'),
                style: OutlinedButton.styleFrom(foregroundColor: AppColors.error, side: const BorderSide(color: AppColors.error)),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _confirmDelete(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Account'),
        content: const Text('Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            onPressed: () async {
              try {
                await ref.read(settingsServiceProvider).deleteAccount();
                await ref.read(authProvider.notifier).logout();
                if (ctx.mounted) Navigator.pop(ctx);
              } catch (_) {}
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Delete Everything'),
          ),
        ],
      ),
    );
  }
}

class _PrefTile extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final VoidCallback? onTap;

  const _PrefTile({required this.label, required this.value, required this.icon, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: ListTile(
        leading: Icon(icon, color: AppColors.primary),
        title: Text(label),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(value, style: const TextStyle(color: AppColors.textSecondaryLight)),
            const SizedBox(width: 4),
            if (onTap != null) const Icon(Icons.chevron_right, size: 20),
          ],
        ),
        onTap: onTap,
      ),
    );
  }
}

class _SwitchTile extends ConsumerWidget {
  final String label;
  final bool value;

  const _SwitchTile({required this.label, required this.value});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 2),
      child: SwitchListTile(
        title: Text(label, style: const TextStyle(fontSize: 14)),
        value: value,
        onChanged: (_) {},
      ),
    );
  }
}
