part of '../search_screen.dart';

class _SearchBar extends StatelessWidget {
  const _SearchBar({
    required this.controller,
    required this.showFilters,
    required this.isDark,
    required this.onSearch,
    required this.onClearSearch,
    required this.onToggleFilters,
  });

  final TextEditingController controller;
  final bool showFilters;
  final bool isDark;
  final ValueChanged<String> onSearch;
  final VoidCallback onClearSearch;
  final VoidCallback onToggleFilters;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: _SearchScreenUi.horizontalPadding,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.white,
        borderRadius: AppRadii.lgRadius,
        boxShadow: AppShadows.md,
      ),
      child: ValueListenableBuilder<TextEditingValue>(
        valueListenable: controller,
        builder: (context, value, _) {
          return Row(
            children: [
              const Padding(
                padding: EdgeInsets.only(left: AppSpacing.lg),
                child: Icon(
                  LucideIcons.search,
                  size: 20,
                  color: AppColors.gray400,
                ),
              ),
              Expanded(
                child: TextField(
                  controller: controller,
                  onChanged: onSearch,
                  decoration: InputDecoration(
                    hintText: 'Stellen suchen...',
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    fillColor: Colors.transparent,
                    filled: true,
                    contentPadding: _SearchScreenUi.searchFieldPadding,
                    hintStyle: GoogleFonts.inter(
                      fontSize: 14,
                      color: AppColors.gray400,
                    ),
                  ),
                ),
              ),
              if (value.text.isNotEmpty)
                IconButton(
                  onPressed: onClearSearch,
                  icon: const Icon(
                    LucideIcons.x,
                    size: 18,
                    color: AppColors.gray400,
                  ),
                ),
              Container(
                width: 1,
                height: 24,
                color: isDark ? AppColors.darkBorder : AppColors.gray200,
              ),
              IconButton(
                onPressed: onToggleFilters,
                icon: Icon(
                  LucideIcons.slidersHorizontal,
                  size: 20,
                  color: showFilters ? AppColors.primary : AppColors.gray400,
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _ActiveFiltersBar extends StatelessWidget {
  const _ActiveFiltersBar({
    required this.resultCount,
    required this.isDark,
    required this.onClearAll,
  });

  final int resultCount;
  final bool isDark;
  final VoidCallback onClearAll;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: _SearchScreenUi.filterBarPadding,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            '$resultCount Ergebnisse',
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isDark ? AppColors.gray300 : AppColors.gray700,
            ),
          ),
          GestureDetector(
            onTap: onClearAll,
            child: Text(
              'Alle löschen',
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: AppColors.error,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterSection extends StatelessWidget {
  const _FilterSection({
    required this.filters,
    required this.locationController,
    required this.isDark,
    required this.onLocationChanged,
    required this.onToggleCategory,
    required this.onToggleType,
    required this.onToggleGermanLevel,
    required this.onToggleMinSalary,
  });

  final JobFilters filters;
  final TextEditingController locationController;
  final bool isDark;
  final ValueChanged<String> onLocationChanged;
  final ValueChanged<JobCategory> onToggleCategory;
  final ValueChanged<JobType> onToggleType;
  final ValueChanged<LanguageLevel> onToggleGermanLevel;
  final ValueChanged<int> onToggleMinSalary;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: _SearchScreenUi.filterSectionMargin,
      constraints: const BoxConstraints(
        maxHeight: _SearchScreenUi.maxFilterHeight,
      ),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.white,
        borderRadius: AppRadii.lgRadius,
        boxShadow: AppShadows.sm,
      ),
      child: SingleChildScrollView(
        padding: _SearchScreenUi.filterSectionPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const _FilterSectionHeader(title: 'KATEGORIE'),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: JobCategory.values
                  .map(
                    (category) => _FilterChip(
                      label: category.labelDe,
                      selected: filters.category == category,
                      onTap: () => onToggleCategory(category),
                    ),
                  )
                  .toList(),
            ),
            const SizedBox(height: 18),
            _FilterDivider(isDark: isDark),
            const SizedBox(height: 14),
            const _FilterSectionHeader(title: 'ART'),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: JobType.values
                  .map(
                    (type) => _FilterChip(
                      label: type.labelDe,
                      selected: filters.type == type,
                      onTap: () => onToggleType(type),
                    ),
                  )
                  .toList(),
            ),
            const SizedBox(height: 18),
            _FilterDivider(isDark: isDark),
            const SizedBox(height: 14),
            const _FilterSectionHeader(title: 'STANDORT'),
            const SizedBox(height: AppSpacing.sm),
            TextField(
              controller: locationController,
              onChanged: onLocationChanged,
              decoration: InputDecoration(
                hintText: 'Berlin, München...',
                prefixIcon: const Icon(
                  LucideIcons.mapPin,
                  size: 18,
                  color: AppColors.gray400,
                ),
                filled: true,
                fillColor: isDark ? AppColors.darkSurface : AppColors.gray50,
                contentPadding: _SearchScreenUi.locationInputPadding,
                border: _locationBorder(isDark),
                enabledBorder: _locationBorder(isDark),
                focusedBorder: _locationBorder(isDark, isFocused: true),
                hintStyle: GoogleFonts.inter(
                  fontSize: 13,
                  color: AppColors.gray400,
                ),
              ),
              style: GoogleFonts.inter(
                fontSize: 13,
                color: isDark ? AppColors.white : AppColors.gray800,
              ),
            ),
            const SizedBox(height: 18),
            _FilterDivider(isDark: isDark),
            const SizedBox(height: 14),
            const _FilterSectionHeader(title: 'DEUTSCHKENNTNISSE (MINDESTENS)'),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: LanguageLevel.values
                  .map(
                    (level) => _FilterChip(
                      label: level.labelDe,
                      selected: filters.germanLevel == level,
                      onTap: () => onToggleGermanLevel(level),
                    ),
                  )
                  .toList(),
            ),
            const SizedBox(height: 18),
            _FilterDivider(isDark: isDark),
            const SizedBox(height: 14),
            const _FilterSectionHeader(title: 'MINDESTGEHALT'),
            const SizedBox(height: AppSpacing.sm),
            Wrap(
              spacing: AppSpacing.sm,
              runSpacing: AppSpacing.sm,
              children: _SearchScreenUi.salaryThresholds
                  .map(
                    (salary) => _SalaryChip(
                      label: '${salary ~/ 1000}k+',
                      selected: filters.minSalary == salary,
                      onTap: () => onToggleMinSalary(salary),
                    ),
                  )
                  .toList(),
            ),
          ],
        ),
      ),
    );
  }

  OutlineInputBorder _locationBorder(bool isDark, {bool isFocused = false}) {
    return OutlineInputBorder(
      borderRadius: AppRadii.mdRadius,
      borderSide: BorderSide(
        color: isFocused
            ? AppColors.primary
            : (isDark ? AppColors.darkBorder : AppColors.gray200),
        width: isFocused ? 1.5 : 1,
      ),
    );
  }
}

class _FilterSectionHeader extends StatelessWidget {
  const _FilterSectionHeader({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: GoogleFonts.inter(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        letterSpacing: 1.2,
        color: AppColors.gray400,
      ),
    );
  }
}

class _FilterDivider extends StatelessWidget {
  const _FilterDivider({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 1,
      color: isDark ? AppColors.darkBorder : AppColors.gray100,
    );
  }
}

class _SearchEmptyState extends StatelessWidget {
  const _SearchEmptyState({required this.isDark});

  final bool isDark;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            LucideIcons.searchX,
            size: 48,
            color: isDark ? AppColors.gray600 : AppColors.gray300,
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'Keine Ergebnisse gefunden',
            style: GoogleFonts.inter(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: isDark ? AppColors.gray400 : AppColors.gray500,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Versuchen Sie andere Suchbegriffe oder Filter',
            style: GoogleFonts.inter(fontSize: 13, color: AppColors.gray400),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected
              ? AppColors.primary.withValues(alpha: 0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? AppColors.primary : AppColors.gray300,
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
            color: selected ? AppColors.primary : AppColors.gray600,
          ),
        ),
      ),
    );
  }
}

class _SalaryChip extends StatelessWidget {
  const _SalaryChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected
              ? AppColors.success.withValues(alpha: 0.1)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? AppColors.success : AppColors.gray300,
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (selected)
              const Padding(
                padding: EdgeInsets.only(right: AppSpacing.xs),
                child: Icon(
                  LucideIcons.banknote,
                  size: 12,
                  color: AppColors.success,
                ),
              ),
            Text(
              label,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                color: selected ? AppColors.success : AppColors.gray600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
