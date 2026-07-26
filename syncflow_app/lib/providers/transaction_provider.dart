import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/api_response.dart';
import '../models/transaction.dart';
import '../services/api_client.dart';
import '../services/transaction_service.dart';

final transactionServiceProvider = Provider<TransactionService>((ref) {
  return TransactionService(ref.read(apiClientProvider));
});

class TransactionsState {
  final List<Transaction> transactions;
  final bool loading;
  final String? error;
  final Pagination? pagination;
  final int reviewCount;

  const TransactionsState({
    this.transactions = const [],
    this.loading = false,
    this.error,
    this.pagination,
    this.reviewCount = 0,
  });

  TransactionsState copyWith({
    List<Transaction>? transactions,
    bool? loading,
    String? error,
    Pagination? pagination,
    int? reviewCount,
  }) {
    return TransactionsState(
      transactions: transactions ?? this.transactions,
      loading: loading ?? this.loading,
      error: error,
      pagination: pagination ?? this.pagination,
      reviewCount: reviewCount ?? this.reviewCount,
    );
  }
}

class TransactionNotifier extends StateNotifier<TransactionsState> {
  final TransactionService _service;
  int _currentPage = 1;

  TransactionNotifier(this._service) : super(const TransactionsState());

  Future<void> loadTransactions({
    int page = 1,
    String? type,
    String? bank,
    String? category,
    String? status,
    String? startDate,
    String? endDate,
    String? search,
  }) async {
    state = state.copyWith(loading: true, error: null);
    _currentPage = page;
    try {
      final result = await _service.getTransactions(
        page: page,
        type: type,
        bank: bank,
        category: category,
        status: status,
        startDate: startDate,
        endDate: endDate,
        search: search,
      );
      final transactions = page == 1
          ? result.data
          : [...state.transactions, ...result.data];
      state = TransactionsState(
        transactions: transactions,
        pagination: result.pagination,
        reviewCount: state.reviewCount,
      );
    } catch (e) {
      state = state.copyWith(loading: false, error: e.toString());
    }
  }

  Future<void> loadMore({
    String? type, String? bank, String? category,
    String? status, String? startDate, String? endDate, String? search,
  }) async {
    if (state.pagination != null && !state.pagination!.hasMore) return;
    if (state.loading) return;
    await loadTransactions(
      page: _currentPage + 1,
      type: type, bank: bank, category: category,
      status: status, startDate: startDate, endDate: endDate, search: search,
    );
  }

  Future<void> refresh() async {
    _currentPage = 1;
    await loadTransactions();
  }

  Future<void> createManualTransaction(Map<String, dynamic> body) async {
    try {
      await _service.createManualTransaction(body);
      await refresh();
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> deleteTransaction(String id) async {
    try {
      await _service.deleteTransaction(id);
      state = state.copyWith(
        transactions: state.transactions.where((t) => t.id != id).toList(),
      );
    } catch (e) {
      state = state.copyWith(error: e.toString());
    }
  }

  void clearError() => state = state.copyWith(error: null);
}

final transactionsProvider = StateNotifierProvider<TransactionNotifier, TransactionsState>((ref) {
  return TransactionNotifier(ref.read(transactionServiceProvider));
});

final transactionSummaryProvider = FutureProvider<TransactionSummary>((ref) async {
  final service = ref.read(transactionServiceProvider);
  return await service.getTransactionSummary();
});
