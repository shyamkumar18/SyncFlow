import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/setting.dart';
import '../services/api_client.dart';
import '../services/settings_service.dart';

final settingsServiceProvider = Provider<SettingsService>((ref) {
  return SettingsService(ref.read(apiClientProvider));
});

final settingsProvider = FutureProvider<AppSettings>((ref) async {
  return await ref.read(settingsServiceProvider).getSettings();
});
