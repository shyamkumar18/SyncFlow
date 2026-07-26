import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../providers/email_connection_provider.dart';
import '../theme/app_colors.dart';
import '../utils/formatters.dart';
import '../widgets/gradient_button.dart';
import '../widgets/loading_skeleton.dart';

class EmailConnectionScreen extends ConsumerStatefulWidget {
  const EmailConnectionScreen({super.key});

  @override
  ConsumerState<EmailConnectionScreen> createState() => _EmailConnectionScreenState();
}

class _EmailConnectionScreenState extends ConsumerState<EmailConnectionScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(gmailConnectionProvider.notifier).loadStatus();
      _checkCallbackParams();
    });
  }

  void _checkCallbackParams() {
    final uri = ModalRoute.of(context)?.settings.arguments;
    if (uri is Uri) {
      final emailConnected = uri.queryParameters['email_connected'];
      final emailError = uri.queryParameters['email_error'];
      if (emailConnected != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gmail connected: $emailConnected'), backgroundColor: AppColors.success),
        );
        ref.read(gmailConnectionProvider.notifier).loadStatus();
      } else if (emailError != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Connection failed: $emailError'), backgroundColor: AppColors.error),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final connState = ref.watch(gmailConnectionProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Gmail Connection'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const SizedBox(height: 20),
          Text(
            'Connect your Gmail account',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'SyncFlow reads your banking emails to automatically track transactions.',
            style: TextStyle(
              fontSize: 14,
              color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight,
            ),
          ),
          const SizedBox(height: 32),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: connState.loading
                  ? const Center(child: CircularProgressIndicator())
                  : connState.connected
                      ? _buildConnected(connState)
                      : _buildDisconnected(connState),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConnected(GmailConnectionState state) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.success.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.check_circle, color: AppColors.success, size: 48),
        ),
        const SizedBox(height: 16),
        const Text('Connected', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.success)),
        const SizedBox(height: 8),
        if (state.email != null) Text(state.email!, style: const TextStyle(fontSize: 14)),
        if (state.status != null) Text('Status: ${state.status!}', style: const TextStyle(fontSize: 13)),
        if (state.lastConnected != null)
          Text('Last connected: ${Formatters.timeAgo(state.lastConnected)}', style: const TextStyle(fontSize: 12)),
        const SizedBox(height: 24),
        OutlinedButton(
          onPressed: () => ref.read(gmailConnectionProvider.notifier).testConnection(),
          child: const Text('Test Connection'),
        ),
        const SizedBox(height: 8),
        TextButton.icon(
          onPressed: () => _confirmDisconnect(),
          icon: const Icon(Icons.link_off),
          label: const Text('Disconnect'),
          style: TextButton.styleFrom(foregroundColor: AppColors.error),
        ),
      ],
    );
  }

  Widget _buildDisconnected(GmailConnectionState state) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.textSecondaryLight.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(Icons.mail_outline, size: 48, color: AppColors.textSecondaryLight),
        ),
        const SizedBox(height: 16),
        const Text('No Gmail account connected', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        const Text('Connect to automatically sync your banking emails'),
        const SizedBox(height: 24),
        GradientButton(
          label: 'Connect Gmail',
          icon: Icons.mail_outline,
          onPressed: () async {
            final url = await ref.read(gmailConnectionProvider.notifier).getConnectUrl();
            if (url != null) {
              final uri = Uri.tryParse(url);
              if (uri != null && await canLaunchUrl(uri)) {
                await launchUrl(uri, mode: LaunchMode.externalApplication);
              }
            }
          },
        ),
        if (state.error != null) ...[
          const SizedBox(height: 16),
          Text(state.error!, style: const TextStyle(color: AppColors.error, fontSize: 13)),
        ],
      ],
    );
  }

  void _confirmDisconnect() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Disconnect Gmail'),
        content: const Text('Are you sure you want to disconnect your Gmail account?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          TextButton(
            onPressed: () {
              ref.read(gmailConnectionProvider.notifier).disconnect();
              Navigator.pop(ctx);
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Disconnect'),
          ),
        ],
      ),
    );
  }
}
