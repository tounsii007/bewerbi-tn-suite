import 'package:bewerbi_tn_flutter/models/job.dart';

class JobAlert {
  final String id;
  final String userId;
  final String searchQuery;
  final JobCategory? category;
  final String? location;
  final DateTime createdAt;
  bool active;

  JobAlert({
    required this.id,
    required this.userId,
    required this.searchQuery,
    this.category,
    this.location,
    required this.createdAt,
    this.active = true,
  });
}

class NotificationService {
  static final List<JobAlert> _alerts = [
    JobAlert(
      id: 'alert-1',
      userId: 'user-1',
      searchQuery: 'Softwareentwickler',
      category: JobCategory.it,
      createdAt: DateTime.now().subtract(const Duration(days: 7)),
      active: true,
    ),
    JobAlert(
      id: 'alert-2',
      userId: 'user-1',
      searchQuery: 'Pflege Berlin',
      category: JobCategory.pflege,
      location: 'Berlin',
      createdAt: DateTime.now().subtract(const Duration(days: 3)),
      active: true,
    ),
  ];

  static List<JobAlert> getAlerts(String userId) =>
      _alerts.where((a) => a.userId == userId).toList();

  static JobAlert createAlert({
    required String userId,
    required String searchQuery,
    JobCategory? category,
    String? location,
  }) {
    final alert = JobAlert(
      id: 'alert-${DateTime.now().millisecondsSinceEpoch}',
      userId: userId,
      searchQuery: searchQuery,
      category: category,
      location: location,
      createdAt: DateTime.now(),
    );
    _alerts.add(alert);
    return alert;
  }

  static void deleteAlert(String alertId) =>
      _alerts.removeWhere((a) => a.id == alertId);

  static void toggleAlert(String alertId) {
    final alert = _alerts.where((a) => a.id == alertId).firstOrNull;
    if (alert != null) alert.active = !alert.active;
  }

  static String generateEmailHtml({
    required String userName,
    required String searchQuery,
    required List<Job> jobs,
  }) {
    final jobCards = jobs
        .map((j) => '''
<div style="border:1px solid #E2E8F0;border-radius:12px;padding:16px;margin:12px 0;">
  <span style="background:#EFF6FF;color:#2563EB;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:600;">${_typeLabel(j.type)}</span>
  <span style="background:#F0FDF4;color:#16a34a;padding:4px 8px;border-radius:6px;font-size:12px;font-weight:600;margin-left:4px;">${_catLabel(j.category)}</span>
  <h3 style="margin:8px 0 4px;font-size:16px;">${j.title}</h3>
  <p style="color:#6B7280;margin:0;font-size:13px;">${j.employer?.fullName ?? ''} \u00b7 ${j.location}${j.salaryRange != null ? ' \u00b7 ${j.salaryRange}' : ''}</p>
  <a href="#" style="display:inline-block;margin-top:12px;background:#2563EB;color:white;padding:8px 20px;border-radius:8px;text-decoration:none;font-size:13px;">Details ansehen</a>
</div>''')
        .join('\n');

    return '''
<div style="max-width:600px;margin:0 auto;font-family:Inter,Arial,sans-serif;">
  <div style="background:linear-gradient(135deg,#3B82F6,#1E40AF);padding:32px;border-radius:16px 16px 0 0;text-align:center;">
    <div style="background:white;width:56px;height:56px;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
      <span style="font-size:28px;font-weight:800;color:#2563EB;">B</span>
    </div>
    <h1 style="color:white;margin:8px 0 4px;font-size:22px;">bewerbi.tn</h1>
    <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px;">Neue Stellenangebote f\u00fcr dich!</p>
  </div>
  <div style="background:white;padding:24px;border:1px solid #E2E8F0;">
    <p style="font-size:15px;color:#1F2937;">Hallo <b>$userName</b>,</p>
    <p style="font-size:14px;color:#4B5563;">wir haben <b>${jobs.length} neue Stelle${jobs.length == 1 ? '' : 'n'}</b> gefunden, die zu deiner Suche "<b>$searchQuery</b>" passen:</p>
    $jobCards
  </div>
  <div style="background:#F8FAFC;padding:20px;text-align:center;border-radius:0 0 16px 16px;border:1px solid #E2E8F0;border-top:none;">
    <p style="color:#94A3B8;font-size:12px;margin:0;">bewerbi.tn \u00b7 Deine Br\u00fccke nach Deutschland</p>
    <a href="#" style="color:#2563EB;font-size:12px;">Benachrichtigungen verwalten</a>
  </div>
</div>''';
  }

  static String _typeLabel(JobType t) {
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

  static String _catLabel(JobCategory c) {
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
}
