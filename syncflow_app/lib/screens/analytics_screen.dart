import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import '../providers/analytics_provider.dart';
import '../theme/app_colors.dart';
import '../utils/formatters.dart';
import '../widgets/loading_skeleton.dart';
import '../widgets/empty_state.dart';
import '../widgets/stat_card.dart';

class AnalyticsScreen extends ConsumerWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final yearlyAsync = ref.watch(yearlyOverviewProvider);
    final categoryAsync = ref.watch(spendingByCategoryProvider);
    final trendAsync = ref.watch(monthlyTrendProvider);
    final bankAsync = ref.watch(bankDistributionProvider);
    final cashAsync = ref.watch(cashFlowProvider);
    final overviewAsync = ref.watch(overviewProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Analytics'),
        actions: [
          IconButton(
            icon: const Icon(Icons.download_outlined),
            onPressed: () => _exportCSV(ref),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(yearlyOverviewProvider);
          ref.invalidate(spendingByCategoryProvider);
          ref.invalidate(monthlyTrendProvider);
          ref.invalidate(bankDistributionProvider);
          ref.invalidate(cashFlowProvider);
        },
        child: ListView(
          padding: const EdgeInsets.only(bottom: 32),
          children: [
            yearlyAsync.when(
              data: (yearly) => _YearlyStats(yearly: yearly),
              loading: () => const CardSkeleton(count: 3),
              error: (_, __) => const SizedBox.shrink(),
            ),
            overviewAsync.when(
              data: (summary) => Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Row(
                  children: [
                    Expanded(
                      child: StatCard(
                        label: 'Savings Rate',
                        value: summary.totalIncome > 0 ? (summary.net / summary.totalIncome) * 100 : 0,
                        valueColor: AppColors.income,
                        subtitle: '% of income',
                      ),
                    ),
                    Expanded(
                      child: StatCard(
                        label: 'Avg Monthly',
                        value: summary.totalExpense > 0 ? summary.totalExpense / (summary.cashFlow.length > 0 ? summary.cashFlow.length : 1) : 0,
                        valueColor: AppColors.info,
                        subtitle: 'Expense',
                      ),
                    ),
                  ],
                ),
              ),
              loading: () => const CardSkeleton(count: 2),
              error: (_, __) => const SizedBox.shrink(),
            ),
            _sectionHeader('Monthly Income vs Expense'),
            trendAsync.when(
              data: (trend) => _buildBarChart(context, trend),
              loading: () => const ChartSkeleton(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            _sectionHeader('Cash Flow'),
            cashAsync.when(
              data: (cash) => _buildLineChart(context, cash),
              loading: () => const ChartSkeleton(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            _sectionHeader('Spending by Category'),
            categoryAsync.when(
              data: (cats) => _buildCategoryChart(context, cats),
              loading: () => const ChartSkeleton(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            _sectionHeader('Bank Distribution'),
            bankAsync.when(
              data: (banks) => _buildBankChart(context, banks),
              loading: () => const ChartSkeleton(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            if (yearlyAsync.valueOrNull != null) _sectionHeader('Yearly Overview'),
            yearlyAsync.when(
              data: (yearly) => _YearlyTable(yearly: yearly),
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }

  void _exportCSV(WidgetRef ref) async {
    try {
      final bytes = await ref.read(analyticsServiceProvider).exportData();
      ScaffoldMessenger.of(context as BuildContext).showSnackBar(
        SnackBar(content: Text('Downloaded ${bytes.length} bytes')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context as BuildContext).showSnackBar(
        SnackBar(content: Text('Export failed: $e')),
      );
    }
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
      child: Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
    );
  }

  Widget _buildBarChart(BuildContext context, List<CashFlowItem> data) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: SizedBox(
          height: 200,
          child: BarChart(
            BarChartData(
              alignment: BarChartAlignment.spaceAround,
              maxY: data.fold<double>(0, (m, d) => d.income > m ? d.income : d.expense > m ? d.expense : m) * 1.2,
              barTouchData: BarTouchData(enabled: true),
              titlesData: FlTitlesData(
                show: true,
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    getTitlesWidget: (v, _) {
                      final i = v.toInt();
                      if (i < 0 || i >= data.length) return const SizedBox.shrink();
                      return Text('${data[i].month}', style: TextStyle(fontSize: 10, color: AppColors.textSecondaryLight));
                    },
                    reservedSize: 22,
                  ),
                ),
                leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
              ),
              gridData: FlGridData(show: true, drawVerticalLine: false),
              borderData: FlBorderData(show: false),
              barGroups: data.asMap().entries.map((e) {
                final i = e.key;
                final d = e.value;
                return BarChartGroupData(x: i, barRods: [
                  BarChartRodData(toY: d.income, color: AppColors.income, width: 10, borderRadius: const BorderRadius.vertical(top: Radius.circular(4))),
                  BarChartRodData(toY: d.expense, color: AppColors.expense, width: 10, borderRadius: const BorderRadius.vertical(top: Radius.circular(4))),
                ]);
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLineChart(BuildContext context, List<CashFlowItem> data) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: SizedBox(
          height: 200,
          child: LineChart(
            LineChartData(
              gridData: FlGridData(show: true, drawVerticalLine: false),
              titlesData: FlTitlesData(
                show: true,
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    getTitlesWidget: (v, _) {
                      final i = v.toInt();
                      if (i < 0 || i >= data.length) return const SizedBox.shrink();
                      return Text('${data[i].month}', style: TextStyle(fontSize: 10, color: AppColors.textSecondaryLight));
                    },
                    reservedSize: 22,
                  ),
                ),
                leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
                rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
              ),
              borderData: FlBorderData(show: false),
              lineBarsData: [
                LineChartBarData(
                  spots: data.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value.income)).toList(),
                  isCurved: true, color: AppColors.income, barWidth: 2,
                  dotData: FlDotData(show: false),
                  belowBarData: BarAreaData(show: true, color: AppColors.income.withValues(alpha: 0.1)),
                ),
                LineChartBarData(
                  spots: data.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value.expense)).toList(),
                  isCurved: true, color: AppColors.expense, barWidth: 2,
                  dotData: FlDotData(show: false),
                  belowBarData: BarAreaData(show: true, color: AppColors.expense.withValues(alpha: 0.1)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryChart(BuildContext context, List<CategorySpending> categories) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    if (categories.isEmpty) return const EmptyState(title: 'No category data');

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: categories.map((c) {
            final idx = categories.indexOf(c);
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                children: [
                  Container(width: 10, height: 10, decoration: BoxDecoration(color: AppColors.chartColors[idx % AppColors.chartColors.length], shape: BoxShape.circle)),
                  const SizedBox(width: 8),
                  SizedBox(width: 100, child: Text(Formatters.capitalize(c.categoryName), style: TextStyle(fontSize: 12, color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight))),
                  Expanded(child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(value: c.percentage / 100, minHeight: 8, backgroundColor: isDark ? AppColors.borderDark : AppColors.borderLight, valueColor: AlwaysStoppedAnimation(AppColors.chartColors[idx % AppColors.chartColors.length])),
                  )),
                  const SizedBox(width: 8),
                  SizedBox(width: 50, child: Text('${c.percentage.toStringAsFixed(0)}%', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight), textAlign: TextAlign.right)),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildBankChart(BuildContext context, List<BankDistribution> banks) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    if (banks.isEmpty) return const SizedBox.shrink();

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: SizedBox(
          height: 140,
          child: PieChart(
            PieChartData(
              sectionsSpace: 2,
              centerSpaceRadius: 30,
              sections: banks.map((b) {
                final idx = banks.indexOf(b);
                return PieChartSectionData(
                  value: b.total,
                  color: AppColors.chartColors[idx % AppColors.chartColors.length],
                  radius: 50,
                  title: '${b.percentage.toStringAsFixed(0)}%',
                  titleStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.white),
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }
}

class _YearlyStats extends StatelessWidget {
  final YearlyOverview yearly;
  const _YearlyStats({required this.yearly});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
      child: Row(
        children: [
          Expanded(child: StatCard(label: 'Income', value: yearly.totalIncome, valueColor: AppColors.income, compact: true)),
          Expanded(child: StatCard(label: 'Expense', value: yearly.totalExpense, valueColor: AppColors.expense, compact: true)),
          Expanded(child: StatCard(label: 'Net', value: yearly.netSavings, valueColor: yearly.netSavings >= 0 ? AppColors.income : AppColors.expense, compact: true)),
        ],
      ),
    );
  }
}

class _YearlyTable extends StatelessWidget {
  final YearlyOverview yearly;
  const _YearlyTable({required this.yearly});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final months = ['', 'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Table(
              columnWidths: const {0: FlexColumnWidth(1), 1: FlexColumnWidth(2), 2: FlexColumnWidth(2), 3: FlexColumnWidth(2)},
              children: [
                TableRow(
                  children: ['Month','Income','Expense','Net'].map((h) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Text(h, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight)),
                  )).toList(),
                ),
                ...yearly.monthly.map((m) => TableRow(
                  children: [
                    Text(months[m.month], style: TextStyle(fontSize: 12, color: isDark ? AppColors.textPrimaryDark : AppColors.textPrimaryLight)),
                    Text(Formatters.formatCompact(m.income), style: TextStyle(fontSize: 12, color: AppColors.income)),
                    Text(Formatters.formatCompact(m.expense), style: TextStyle(fontSize: 12, color: AppColors.expense)),
                    Text(Formatters.formatCompact(m.income - m.expense), style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: (m.income - m.expense) >= 0 ? AppColors.income : AppColors.expense)),
                  ],
                )),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
