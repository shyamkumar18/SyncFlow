import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../models/transaction.dart';
import '../providers/analytics_provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_colors.dart';
import '../utils/formatters.dart';
import '../widgets/stat_card.dart';
import '../widgets/transaction_card.dart';
import '../widgets/loading_skeleton.dart';
import '../widgets/error_display.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    final overviewAsync = ref.watch(overviewProvider);
    final categoryAsync = ref.watch(spendingByCategoryProvider);
    final yearlyAsync = ref.watch(yearlyOverviewProvider);
    final bankAsync = ref.watch(bankDistributionProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          CircleAvatar(
            radius: 16,
            backgroundColor: AppColors.primary,
            child: Text(
              authState.user?.initials ?? '?',
              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600),
            ),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(overviewProvider);
          ref.invalidate(spendingByCategoryProvider);
          ref.invalidate(yearlyOverviewProvider);
          ref.invalidate(bankDistributionProvider);
        },
        child: ListView(
          padding: const EdgeInsets.only(bottom: 32),
          children: [
            yearlyAsync.when(
              data: (yearly) => _YearHeader(yearly: yearly),
              loading: () => const CardSkeleton(count: 1),
              error: (_, __) => const SizedBox.shrink(),
            ),
            overviewAsync.when(
              data: (summary) => _StatCards(summary: summary),
              loading: () => const CardSkeleton(count: 4),
              error: (_, __) => const SizedBox.shrink(),
            ),
            yearlyAsync.when(
              data: (yearly) => _IncomeExpenseChart(yearly: yearly),
              loading: () => const ChartSkeleton(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            categoryAsync.when(
              data: (categories) => _CategoryPieChart(categories: categories),
              loading: () => const ChartSkeleton(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            overviewAsync.when(
              data: (summary) => _SavingsTrend(summary: summary),
              loading: () => const ChartSkeleton(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            yearlyAsync.when(
              data: (yearly) => _YearHighlights(yearly: yearly),
              loading: () => const CardSkeleton(count: 1),
              error: (_, __) => const SizedBox.shrink(),
            ),
            overviewAsync.when(
              data: (summary) => _RecentTransactions(summary: summary),
              loading: () => const TableSkeleton(rows: 3),
              error: (_, __) => const SizedBox.shrink(),
            ),
            bankAsync.when(
              data: (banks) => _BankDistribution(banks: banks),
              loading: () => const CardSkeleton(count: 1),
              error: (_, __) => const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }
}

class _YearHeader extends StatelessWidget {
  final YearlyOverview yearly;
  const _YearHeader({required this.yearly});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1E3A5F), Color(0xFF0F2027)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  yearly.year.toString(),
                  style: const TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${yearly.monthsWithData} months of data',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.7),
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '${yearly.totalTransactions} transactions',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.7),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.trending_up, color: Colors.white, size: 32),
          ),
        ],
      ),
    );
  }
}

class _StatCards extends StatelessWidget {
  final TransactionSummary summary;
  const _StatCards({required this.summary});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        childAspectRatio: 1.7,
        children: [
          StatCard(
            label: 'Income',
            value: summary.totalIncome,
            valueColor: AppColors.income,
            icon: Icons.arrow_downward,
          ),
          StatCard(
            label: 'Expense',
            value: summary.totalExpense,
            valueColor: AppColors.expense,
            icon: Icons.arrow_upward,
          ),
          StatCard(
            label: 'Net Savings',
            value: summary.net,
            valueColor: summary.net >= 0 ? AppColors.income : AppColors.expense,
            icon: Icons.savings_outlined,
          ),
          StatCard(
            label: 'Avg Monthly',
            value: summary.totalExpense > 0 ? summary.totalExpense / (summary.cashFlow.length > 0 ? summary.cashFlow.length : 1) : 0,
            valueColor: AppColors.info,
            icon: Icons.calendar_month_outlined,
          ),
        ],
      ),
    );
  }
}

class _IncomeExpenseChart extends StatelessWidget {
  final YearlyOverview yearly;
  const _IncomeExpenseChart({required this.yearly});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final months = yearly.monthly;

    if (months.isEmpty) return const SizedBox.shrink();

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Monthly Income vs Expense',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 200,
              child: BarChart(
                BarChartData(
                  alignment: BarChartAlignment.spaceAround,
                  maxY: months.fold<double>(0, (max, m) => m.income > max ? m.income : m.expense > max ? m.expense : max) * 1.2,
                  barTouchData: BarTouchData(enabled: true),
                  titlesData: FlTitlesData(
                    show: true,
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, _) {
                          final idx = value.toInt();
                          if (idx < 0 || idx >= months.length) return const SizedBox.shrink();
                          return Text(
                            months[idx].month.toString(),
                            style: TextStyle(fontSize: 10, color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
                          );
                        },
                        reservedSize: 22,
                      ),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  ),
                  gridData: FlGridData(
                    show: true,
                    drawVerticalLine: false,
                    horizontalInterval: 10000,
                    getDrawingHorizontalLine: (_) => FlLine(
                      color: (isDark ? AppColors.borderDark : AppColors.borderLight).withValues(alpha: 0.5),
                      strokeWidth: 1,
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  barGroups: months.asMap().entries.map((entry) {
                    final idx = entry.key;
                    final m = entry.value;
                    return BarChartGroupData(
                      x: idx,
                      barRods: [
                        BarChartRodData(
                          toY: m.income,
                          color: AppColors.income,
                          width: 12,
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(4),
                            topRight: Radius.circular(4),
                          ),
                        ),
                        BarChartRodData(
                          toY: m.expense,
                          color: AppColors.expense,
                          width: 12,
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(4),
                            topRight: Radius.circular(4),
                          ),
                        ),
                      ],
                    );
                  }).toList(),
                ),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                _legendDot(AppColors.income, 'Income'),
                const SizedBox(width: 24),
                _legendDot(AppColors.expense, 'Expense'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _legendDot(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(fontSize: 12)),
      ],
    );
  }
}

class _CategoryPieChart extends StatelessWidget {
  final List<CategorySpending> categories;
  const _CategoryPieChart({required this.categories});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    if (categories.isEmpty) return const SizedBox.shrink();

    final top5 = categories.take(5).toList();

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Spending by Category',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
            ),
            const SizedBox(height: 20),
            Row(
              children: [
                SizedBox(
                  width: 140,
                  height: 140,
                  child: PieChart(
                    PieChartData(
                      sectionsSpace: 2,
                      centerSpaceRadius: 35,
                      sections: top5.asMap().entries.map((entry) {
                        final idx = entry.key;
                        final cat = entry.value;
                        return PieChartSectionData(
                          value: cat.total,
                          color: AppColors.chartColors[idx % AppColors.chartColors.length],
                          radius: 40,
                          title: '',
                        );
                      }).toList(),
                    ),
                  ),
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: top5.map((cat) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 3),
                      child: Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: AppColors.chartColors[top5.indexOf(cat) % AppColors.chartColors.length],
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              Formatters.capitalize(cat.categoryName),
                              style: TextStyle(
                                fontSize: 12,
                                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          Text(
                            '${cat.percentage.toStringAsFixed(0)}%',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
                            ),
                          ),
                        ],
                      ),
                    )).toList(),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SavingsTrend extends StatelessWidget {
  final TransactionSummary summary;
  const _SavingsTrend({required this.summary});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cashFlow = summary.cashFlow;

    if (cashFlow.isEmpty) return const SizedBox.shrink();

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Savings Trend',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 180,
              child: LineChart(
                LineChartData(
                  gridData: FlGridData(
                    show: true,
                    drawVerticalLine: false,
                    getDrawingHorizontalLine: (_) => FlLine(
                      color: (isDark ? AppColors.borderDark : AppColors.borderLight).withValues(alpha: 0.5),
                      strokeWidth: 1,
                    ),
                  ),
                  titlesData: FlTitlesData(
                    show: true,
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, _) {
                          final idx = value.toInt();
                          if (idx < 0 || idx >= cashFlow.length) return const SizedBox.shrink();
                          return Text(
                            cashFlow[idx].month.toString(),
                            style: TextStyle(fontSize: 10, color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight),
                          );
                        },
                        reservedSize: 22,
                      ),
                    ),
                    leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  ),
                  borderData: FlBorderData(show: false),
                  minY: cashFlow.fold<double>(0, (min, c) => c.net < min ? c.net : min) * 1.1,
                  maxY: cashFlow.fold<double>(0, (max, c) => c.net > max ? c.net : max) * 1.2,
                  lineBarsData: [
                    LineChartBarData(
                      spots: cashFlow.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value.net)).toList(),
                      isCurved: true,
                      color: AppColors.primary,
                      barWidth: 3,
                      dotData: FlDotData(show: false),
                      belowBarData: BarAreaData(
                        show: true,
                        color: AppColors.primary.withValues(alpha: 0.1),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _YearHighlights extends StatelessWidget {
  final YearlyOverview yearly;
  const _YearHighlights({required this.yearly});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Year Highlights',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                _highlightItem(
                  'Best Month',
                  yearly.bestMonth?['month']?.toString() ?? '-',
                  'Savings',
                  isDark,
                ),
                _highlightItem(
                  'Worst Month',
                  yearly.worstMonth?['month']?.toString() ?? '-',
                  'Savings',
                  isDark,
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _highlightItem(
                  'Avg Monthly',
                  Formatters.formatCompact(yearly.avgMonthlySpend),
                  'Spend',
                  isDark,
                ),
                _highlightItem(
                  'Avg Daily',
                  Formatters.formatCompact(yearly.avgDaily),
                  'Spend',
                  isDark,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _highlightItem(String label, String value, String sub, bool isDark) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 12, color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight)),
          Text(sub, style: TextStyle(fontSize: 10, color: isDark ? AppColors.textSecondaryDark : AppColors.textSecondaryLight)),
        ],
      ),
    );
  }
}

class _RecentTransactions extends StatelessWidget {
  final TransactionSummary summary;
  const _RecentTransactions({required this.summary});

  @override
  Widget build(BuildContext context) {
    final transactions = summary.recentTransactions;
    if (transactions.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Recent Transactions', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              TextButton(
                onPressed: () {},
                child: const Text('View All'),
              ),
            ],
          ),
        ),
        ...transactions.take(5).map((t) => TransactionCard(
          transaction: t,
          onTap: () => _showDetail(context, t),
        )),
      ],
    );
  }

  void _showDetail(BuildContext context, Transaction t) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => TransactionDetailSheet(transaction: t),
    );
  }
}

class _BankDistribution extends StatelessWidget {
  final List<BankDistribution> banks;
  const _BankDistribution({required this.banks});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    if (banks.isEmpty) return const SizedBox.shrink();

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Bank Distribution',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight,
              ),
            ),
            const SizedBox(height: 16),
            ...banks.map((b) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(b.name, style: TextStyle(fontSize: 13, color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight)),
                      Text(Formatters.formatCompact(b.total), style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: b.percentage / 100,
                      minHeight: 6,
                      backgroundColor: (isDark ? AppColors.borderDark : AppColors.borderLight),
                      valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                    ),
                  ),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }
}
