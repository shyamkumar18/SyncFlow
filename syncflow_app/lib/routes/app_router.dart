import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/auth_provider.dart';
import '../screens/splash_screen.dart';
import '../screens/home_screen.dart';
import '../screens/login_screen.dart';
import '../screens/register_screen.dart';
import '../screens/dashboard_screen.dart';
import '../screens/transactions_screen.dart';
import '../screens/analytics_screen.dart';
import '../screens/mail_center_screen.dart';
import '../screens/budgets_screen.dart';
import '../screens/review_queue_screen.dart';
import '../screens/email_connection_screen.dart';
import '../screens/settings_screen.dart';
import '../screens/help_center_screen.dart';
import '../widgets/app_layout.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/splash',
    redirect: (BuildContext context, GoRouterState state) {
      final isAuth = authState.status == AuthStatus.authenticated;
      final isInitial = authState.status == AuthStatus.initial;
      final isSplash = state.matchedLocation == '/splash';

      if (isInitial && !isSplash) {
        return '/splash';
      }

      final publicRoutes = ['/login', '/register', '/'];
      final isPublic = publicRoutes.contains(state.matchedLocation);

      if (!isAuth && !isPublic && !isSplash) {
        return '/login';
      }

      if (isAuth && isPublic) {
        return '/dashboard';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (_, __) => const SplashScreen(),
      ),
      GoRoute(
        path: '/',
        builder: (_, __) => const HomeScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (_, __) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (_, __) => const RegisterScreen(),
      ),
      ShellRoute(
        builder: (_, __, child) => AppLayout(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (_, __) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/transactions',
            builder: (_, __) => const TransactionsScreen(),
          ),
          GoRoute(
            path: '/analytics',
            builder: (_, __) => const AnalyticsScreen(),
          ),
          GoRoute(
            path: '/mail',
            builder: (_, __) => const MailCenterScreen(),
          ),
          GoRoute(
            path: '/budgets',
            builder: (_, __) => const BudgetsScreen(),
          ),
          GoRoute(
            path: '/review',
            builder: (_, __) => const ReviewQueueScreen(),
          ),
          GoRoute(
            path: '/email-connection',
            builder: (_, __) => const EmailConnectionScreen(),
          ),
          GoRoute(
            path: '/settings',
            builder: (_, __) => const SettingsScreen(),
          ),
          GoRoute(
            path: '/help',
            builder: (_, __) => const HelpCenterScreen(),
          ),
        ],
      ),
    ],
  );
});
