import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class ShimmerWidget extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;

  const ShimmerWidget({
    super.key,
    this.width = double.infinity,
    required this.height,
    this.borderRadius = 8,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: isDark ? AppColors.shimmerBaseDark : AppColors.shimmerBaseLight,
        borderRadius: BorderRadius.circular(borderRadius),
      ),
    );
  }
}

class TableSkeleton extends StatelessWidget {
  final int rows;
  final int cols;

  const TableSkeleton({
    super.key,
    this.rows = 5,
    this.cols = 5,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(
        rows,
        (i) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
          child: Row(
            children: List.generate(
              cols,
              (j) => Expanded(
                child: Padding(
                  padding: EdgeInsets.only(right: j < cols - 1 ? 12 : 0),
                  child: ShimmerWidget(
                    height: 16,
                    borderRadius: 4,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class CardSkeleton extends StatelessWidget {
  final int count;

  const CardSkeleton({super.key, this.count = 4});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 1.6,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: count,
      itemBuilder: (_, __) => Card(
        margin: EdgeInsets.zero,
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ShimmerWidget(height: 12, width: 80, borderRadius: 4),
              const SizedBox(height: 12),
              ShimmerWidget(height: 24, width: 120, borderRadius: 4),
              const SizedBox(height: 8),
              ShimmerWidget(height: 10, width: 60, borderRadius: 4),
            ],
          ),
        ),
      ),
    );
  }
}

class ChartSkeleton extends StatelessWidget {
  const ChartSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ShimmerWidget(height: 16, width: 140, borderRadius: 4),
            const SizedBox(height: 20),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: List.generate(
                12,
                (i) => Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 3),
                    child: ShimmerWidget(
                      height: 20.0 + (i % 5) * 20,
                      borderRadius: 4,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
