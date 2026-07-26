import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class PaginationWidget extends StatelessWidget {
  final int page;
  final int pages;
  final ValueChanged<int> onPageChanged;

  const PaginationWidget({
    super.key,
    required this.page,
    required this.pages,
    required this.onPageChanged,
  });

  @override
  Widget build(BuildContext context) {
    if (pages <= 1) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _PageButton(
            icon: Icons.chevron_left,
            onTap: page > 1 ? () => onPageChanged(page - 1) : null,
          ),
          const SizedBox(width: 4),
          ..._buildPageNumbers(),
          const SizedBox(width: 4),
          _PageButton(
            icon: Icons.chevron_right,
            onTap: page < pages ? () => onPageChanged(page + 1) : null,
          ),
        ],
      ),
    );
  }

  List<Widget> _buildPageNumbers() {
    final List<Widget> items = [];

    if (pages <= 7) {
      for (int i = 1; i <= pages; i++) {
        items.add(_PageNumber(
          number: i,
          active: i == page,
          onTap: () => onPageChanged(i),
        ));
      }
    } else {
      items.add(_PageNumber(number: 1, active: page == 1, onTap: () => onPageChanged(1)));
      if (page > 3) items.add(_Ellipsis());
      for (int i = page - 1; i <= page + 1; i++) {
        if (i > 1 && i < pages) {
          items.add(_PageNumber(number: i, active: i == page, onTap: () => onPageChanged(i)));
        }
      }
      if (page < pages - 2) items.add(_Ellipsis());
      items.add(_PageNumber(number: pages, active: page == pages, onTap: () => onPageChanged(pages)));
    }

    return items;
  }
}

class _PageButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onTap;

  const _PageButton({required this.icon, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: onTap,
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: onTap != null
                  ? AppColors.borderLight
                  : AppColors.borderLight.withValues(alpha: 0.5),
            ),
          ),
          child: Icon(
            icon,
            size: 20,
            color: onTap != null ? AppColors.textPrimaryLight : AppColors.textSecondaryLight,
          ),
        ),
      ),
    );
  }
}

class _PageNumber extends StatelessWidget {
  final int number;
  final bool active;
  final VoidCallback onTap;

  const _PageNumber({required this.number, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: active ? AppColors.primary : Colors.transparent,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: active ? null : onTap,
        child: Container(
          width: 36,
          height: 36,
          alignment: Alignment.center,
          child: Text(
            number.toString(),
            style: TextStyle(
              fontSize: 14,
              fontWeight: active ? FontWeight.w600 : FontWeight.normal,
              color: active ? Colors.white : AppColors.textSecondaryLight,
            ),
          ),
        ),
      ),
    );
  }
}

class _Ellipsis extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36,
      height: 36,
      alignment: Alignment.center,
      child: Text(
        '...',
        style: TextStyle(
          color: AppColors.textSecondaryLight,
          fontSize: 14,
        ),
      ),
    );
  }
}
