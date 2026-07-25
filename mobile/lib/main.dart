import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:syncflow/providers/auth_provider.dart';
import 'package:syncflow/theme/app_theme.dart';
import 'package:syncflow/screens/auth/login_screen.dart';
import 'package:syncflow/screens/home/home_screen.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => AuthProvider(),
      child: const SyncFlowApp(),
    ),
  );
}

class SyncFlowApp extends StatelessWidget {
  const SyncFlowApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        return MaterialApp(
          title: '\$yncFlow',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: auth.themeMode,
          home: auth.isAuthenticated ? const HomeScreen() : const LoginScreen(),
        );
      },
    );
  }
}
