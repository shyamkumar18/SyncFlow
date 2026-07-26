import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/api_response.dart';
import '../models/email.dart';
import '../services/api_client.dart';
import '../services/email_service.dart';

final emailServiceProvider = Provider<EmailService>((ref) {
  return EmailService(ref.read(apiClientProvider));
});

class EmailsState {
  final List<Email> emails;
  final bool loading;
  final String? error;
  final Pagination? pagination;
  final EmailStats? stats;
  final SyncResult? syncResult;

  const EmailsState({
    this.emails = const [],
    this.loading = false,
    this.error,
    this.pagination,
    this.stats,
    this.syncResult,
  });

  EmailsState copyWith({
    List<Email>? emails,
    bool? loading,
    String? error,
    Pagination? pagination,
    EmailStats? stats,
    SyncResult? syncResult,
  }) {
    return EmailsState(
      emails: emails ?? this.emails,
      loading: loading ?? this.loading,
      error: error,
      pagination: pagination ?? this.pagination,
      stats: stats ?? this.stats,
      syncResult: syncResult ?? this.syncResult,
    );
  }
}

class EmailNotifier extends StateNotifier<EmailsState> {
  final EmailService _service;

  EmailNotifier(this._service) : super(const EmailsState());

  Future<void> loadEmails({
    int page = 1,
    String? category,
    String? bank,
    String? search,
  }) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final result = await _service.getEmails(
        page: page,
        category: category,
        bank: bank,
        search: search,
      );
      final stats = await _service.getEmailStats();
      state = EmailsState(
        emails: page == 1 ? result.data : [...state.emails, ...result.data],
        pagination: result.pagination,
        stats: stats,
      );
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> refresh() async {
    await loadEmails();
  }

  Future<void> syncEmails() async {
    state = state.copyWith(loading: true, error: null);
    try {
      final result = await _service.syncEmails();
      state = state.copyWith(syncResult: result, loading: false);
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }
}

final emailsProvider = StateNotifierProvider<EmailNotifier, EmailsState>((ref) {
  return EmailNotifier(ref.read(emailServiceProvider));
});
