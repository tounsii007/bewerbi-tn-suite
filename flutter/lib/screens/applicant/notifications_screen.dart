import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/job.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/providers/job_provider.dart';
import 'package:bewerbi_tn_flutter/services/notification_service.dart';

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen> {
  late List<JobAlert> _alerts;
  final _searchController = TextEditingController();
  final _locationController = TextEditingController();
  JobCategory? _selectedCategory;

  @override
  void initState() {
    super.initState();
    _loadAlerts();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  void _loadAlerts() {
    final userId = ref.read(authProvider).profile?.userId ?? 'user-1';
    _alerts = NotificationService.getAlerts(userId);
  }

  String _categoryLabel(JobCategory c) {
    switch (c) {
      case JobCategory.it:
        return 'IT';
      case JobCategory.pflege:
        return 'Pflege';
      case JobCategory.transport:
        return 'Transport';
      case JobCategory.sonstige:
        return 'Sonstige';
    }
  }

  void _createAlert() {
    final query = _searchController.text.trim();
    if (query.isEmpty) return;

    final userId = ref.read(authProvider).profile?.userId ?? 'user-1';
    final location = _locationController.text.trim();

    NotificationService.createAlert(
      userId: userId,
      searchQuery: query,
      category: _selectedCategory,
      location: location.isNotEmpty ? location : null,
    );

    setState(() {
      _loadAlerts();
      _searchController.clear();
      _locationController.clear();
      _selectedCategory = null;
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Alert erstellt: "$query"', style: GoogleFonts.inter()),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  void _showEmailPreview(BuildContext context, String searchQuery) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final profile = ref.read(authProvider).profile;
    final userName = profile?.firstName ?? 'Benutzer';
    final jobs = ref.read(jobProvider).jobs.take(3).toList();

    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        backgroundColor: isDark ? AppColors.darkCard : AppColors.white,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxHeight: 600, maxWidth: 400),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Dialog header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: isDark ? AppColors.darkBorder : AppColors.gray200,
                    ),
                  ),
                ),
                child: Row(
                  children: [
                    Icon(LucideIcons.mail, size: 20, color: AppColors.primary),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'E-Mail Vorschau',
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: isDark ? AppColors.white : AppColors.gray900,
                        ),
                      ),
                    ),
                    IconButton(
                      icon: Icon(LucideIcons.x, size: 20, color: isDark ? AppColors.gray400 : AppColors.gray500),
                      onPressed: () => Navigator.of(ctx).pop(),
                    ),
                  ],
                ),
              ),
              // Email preview content
              Flexible(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: _buildEmailPreviewWidgets(
                    context,
                    userName: userName,
                    searchQuery: searchQuery,
                    jobs: jobs,
                    isDark: isDark,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmailPreviewWidgets(
    BuildContext context, {
    required String userName,
    required String searchQuery,
    required List<Job> jobs,
    required bool isDark,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Email header
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF3B82F6), Color(0xFF1E40AF)],
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text('B', style: GoogleFonts.inter(fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.primary)),
                ),
              ),
              const SizedBox(height: 8),
              Text('bewerbi.tn', style: GoogleFonts.inter(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.white)),
              const SizedBox(height: 4),
              Text('Neue Stellenangebote f\u00fcr dich!', style: GoogleFonts.inter(fontSize: 12, color: AppColors.white.withValues(alpha: 0.8))),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Greeting
        Text(
          'Hallo $userName,',
          style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: isDark ? AppColors.white : AppColors.gray900),
        ),
        const SizedBox(height: 8),
        RichText(
          text: TextSpan(
            style: GoogleFonts.inter(fontSize: 13, color: isDark ? AppColors.gray300 : AppColors.gray600),
            children: [
              const TextSpan(text: 'wir haben '),
              TextSpan(text: '${jobs.length} neue Stellen', style: const TextStyle(fontWeight: FontWeight.w700)),
              const TextSpan(text: ' gefunden, die zu deiner Suche "'),
              TextSpan(text: searchQuery, style: const TextStyle(fontWeight: FontWeight.w700)),
              const TextSpan(text: '" passen:'),
            ],
          ),
        ),
        const SizedBox(height: 16),
        // Job cards
        ...jobs.map((job) => Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.gray200),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Wrap(
                    spacing: 6,
                    children: [
                      _emailBadge(_typeLabel(job.type), AppColors.primary),
                      _emailBadge(_catLabel(job.category), AppColors.success),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(job.title, style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w700, color: isDark ? AppColors.white : AppColors.gray900)),
                  const SizedBox(height: 4),
                  Text(
                    '${job.employer?.fullName ?? ''} \u00b7 ${job.location}${job.salaryRange != null ? ' \u00b7 ${job.salaryRange}' : ''}',
                    style: GoogleFonts.inter(fontSize: 12, color: AppColors.gray500),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text('Details ansehen', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.white)),
                  ),
                ],
              ),
            )),
        // Footer
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : const Color(0xFFF8FAFC),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            children: [
              Text('bewerbi.tn \u00b7 Deine Br\u00fccke nach Deutschland', style: GoogleFonts.inter(fontSize: 11, color: AppColors.gray400)),
              const SizedBox(height: 4),
              Text('Benachrichtigungen verwalten', style: GoogleFonts.inter(fontSize: 11, color: AppColors.primary)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _emailBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(label, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: color)),
    );
  }

  String _typeLabel(JobType t) {
    switch (t) {
      case JobType.job:
        return 'Stelle';
      case JobType.ausbildung:
        return 'Ausbildung';
      case JobType.studium:
        return 'Studium';
      case JobType.sprachkurs:
        return 'Sprachkurs';
    }
  }

  String _catLabel(JobCategory c) {
    switch (c) {
      case JobCategory.it:
        return 'IT';
      case JobCategory.pflege:
        return 'Pflege';
      case JobCategory.transport:
        return 'Transport';
      case JobCategory.sonstige:
        return 'Sonstige';
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => context.pop(),
        ),
        title: const Text('Benachrichtigungen'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Section: Active alerts
            Text(
              'Aktive Job-Alerts',
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: isDark ? AppColors.white : AppColors.gray900,
              ),
            ),
            const SizedBox(height: 12),
            if (_alerts.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Text(
                  'Keine Alerts vorhanden.',
                  style: GoogleFonts.inter(fontSize: 14, color: AppColors.gray500),
                ),
              )
            else
              ..._alerts.map((alert) => _buildAlertCard(alert, isDark)),

            const SizedBox(height: 28),

            // Section: Create new alert
            Text(
              'Neuen Alert erstellen',
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: isDark ? AppColors.white : AppColors.gray900,
              ),
            ),
            const SizedBox(height: 12),
            _buildCreateAlertCard(isDark),

            const SizedBox(height: 28),

            // Section: Recent notifications
            Text(
              'Letzte Benachrichtigungen',
              style: GoogleFonts.inter(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: isDark ? AppColors.white : AppColors.gray900,
              ),
            ),
            const SizedBox(height: 12),
            _buildNotificationEntry(
              isDark: isDark,
              title: '3 neue Stellen f\u00fcr "Softwareentwickler"',
              subtitle: 'vor 2 Stunden',
              searchQuery: 'Softwareentwickler',
            ),
            const SizedBox(height: 10),
            _buildNotificationEntry(
              isDark: isDark,
              title: '1 neue Stelle f\u00fcr "Pflege Berlin"',
              subtitle: 'Gestern',
              searchQuery: 'Pflege Berlin',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAlertCard(JobAlert alert, bool isDark) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.gray200),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  alert.searchQuery,
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.white : AppColors.gray900,
                  ),
                ),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 6,
                  runSpacing: 4,
                  children: [
                    if (alert.category != null)
                      _chipBadge(_categoryLabel(alert.category!), AppColors.primary, isDark),
                    if (alert.location != null)
                      _chipBadge(alert.location!, AppColors.success, isDark),
                  ],
                ),
              ],
            ),
          ),
          Switch(
            value: alert.active,
            activeTrackColor: AppColors.primary,
            onChanged: (val) {
              setState(() {
                NotificationService.toggleAlert(alert.id);
                _loadAlerts();
              });
            },
          ),
          IconButton(
            icon: Icon(LucideIcons.trash2, size: 18, color: AppColors.error.withValues(alpha: 0.7)),
            onPressed: () {
              setState(() {
                NotificationService.deleteAlert(alert.id);
                _loadAlerts();
              });
            },
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
        ],
      ),
    );
  }

  Widget _chipBadge(String label, Color color, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(label, style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: color)),
    );
  }

  Widget _buildCreateAlertCard(bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.gray200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextField(
            controller: _searchController,
            style: GoogleFonts.inter(color: isDark ? AppColors.white : AppColors.gray900, fontSize: 14),
            decoration: InputDecoration(
              hintText: 'Suchbegriff (z.B. Softwareentwickler)',
              hintStyle: GoogleFonts.inter(color: isDark ? AppColors.gray500 : AppColors.gray400, fontSize: 13),
              fillColor: isDark ? AppColors.darkSurface : AppColors.gray50,
              prefixIcon: const Icon(LucideIcons.search, size: 18),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            ),
          ),
          const SizedBox(height: 12),
          // Category dropdown
          DropdownButtonFormField<JobCategory>(
            initialValue: _selectedCategory,
            hint: Text('Kategorie (optional)', style: GoogleFonts.inter(fontSize: 13, color: isDark ? AppColors.gray500 : AppColors.gray400)),
            style: GoogleFonts.inter(color: isDark ? AppColors.white : AppColors.gray900, fontSize: 14),
            dropdownColor: isDark ? AppColors.darkCard : AppColors.white,
            decoration: InputDecoration(
              fillColor: isDark ? AppColors.darkSurface : AppColors.gray50,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            ),
            items: JobCategory.values.map((c) {
              return DropdownMenuItem(value: c, child: Text(_categoryLabel(c)));
            }).toList(),
            onChanged: (val) => setState(() => _selectedCategory = val),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _locationController,
            style: GoogleFonts.inter(color: isDark ? AppColors.white : AppColors.gray900, fontSize: 14),
            decoration: InputDecoration(
              hintText: 'Standort (optional)',
              hintStyle: GoogleFonts.inter(color: isDark ? AppColors.gray500 : AppColors.gray400, fontSize: 13),
              fillColor: isDark ? AppColors.darkSurface : AppColors.gray50,
              prefixIcon: const Icon(LucideIcons.mapPin, size: 18),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 44,
            child: ElevatedButton.icon(
              onPressed: _createAlert,
              icon: const Icon(LucideIcons.bellPlus, size: 18),
              label: Text('Alert erstellen', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationEntry({
    required bool isDark,
    required String title,
    required String subtitle,
    required String searchQuery,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.gray200),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(LucideIcons.bellRing, size: 20, color: AppColors.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.white : AppColors.gray900,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: GoogleFonts.inter(fontSize: 12, color: AppColors.gray500),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () => _showEmailPreview(context, searchQuery),
            child: Text(
              'E-Mail ansehen',
              style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }
}
