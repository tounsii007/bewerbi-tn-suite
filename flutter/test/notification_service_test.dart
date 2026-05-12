import 'package:flutter_test/flutter_test.dart';
import 'package:bewerbi_tn_flutter/services/notification_service.dart';
import 'package:bewerbi_tn_flutter/models/job.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';

void main() {
  group('NotificationService', () {
    test('getAlerts returns alerts for user-1', () {
      final alerts = NotificationService.getAlerts('user-1');
      expect(alerts, isNotEmpty);
      for (final a in alerts) {
        expect(a.userId, 'user-1');
      }
    });

    test('getAlerts returns empty for unknown user', () {
      final alerts = NotificationService.getAlerts('nonexistent-user');
      expect(alerts, isEmpty);
    });

    test('createAlert adds new alert', () {
      final beforeCount = NotificationService.getAlerts('user-1').length;
      final alert = NotificationService.createAlert(
        userId: 'user-1',
        searchQuery: 'DevOps Engineer',
        category: JobCategory.it,
        location: 'Frankfurt',
      );
      final afterCount = NotificationService.getAlerts('user-1').length;

      expect(afterCount, equals(beforeCount + 1));
      expect(alert.userId, 'user-1');
      expect(alert.searchQuery, 'DevOps Engineer');
      expect(alert.category, JobCategory.it);
      expect(alert.location, 'Frankfurt');
      expect(alert.active, true);
    });

    test('createAlert without optional fields', () {
      final alert = NotificationService.createAlert(
        userId: 'user-5',
        searchQuery: 'Pflege',
      );
      expect(alert.userId, 'user-5');
      expect(alert.category, null);
      expect(alert.location, null);
      expect(alert.active, true);
    });

    test('deleteAlert removes alert', () {
      // Create a new alert to delete
      final alert = NotificationService.createAlert(
        userId: 'user-1',
        searchQuery: 'To Delete',
      );
      final alertId = alert.id;
      final beforeCount = NotificationService.getAlerts('user-1').length;

      NotificationService.deleteAlert(alertId);
      final afterCount = NotificationService.getAlerts('user-1').length;

      expect(afterCount, equals(beforeCount - 1));
      final remaining = NotificationService.getAlerts('user-1');
      expect(remaining.any((a) => a.id == alertId), false);
    });

    test('deleteAlert with nonexistent ID does nothing', () {
      final beforeCount = NotificationService.getAlerts('user-1').length;
      NotificationService.deleteAlert('nonexistent-alert-id');
      final afterCount = NotificationService.getAlerts('user-1').length;
      expect(afterCount, equals(beforeCount));
    });

    test('toggleAlert changes active status', () {
      final alert = NotificationService.createAlert(
        userId: 'user-1',
        searchQuery: 'Toggle Test',
      );
      expect(alert.active, true);

      NotificationService.toggleAlert(alert.id);
      // Since JobAlert is a mutable object, the same reference is toggled
      final alerts = NotificationService.getAlerts('user-1');
      final toggled = alerts.firstWhere((a) => a.id == alert.id);
      expect(toggled.active, false);

      NotificationService.toggleAlert(alert.id);
      final toggledBack = NotificationService.getAlerts('user-1')
          .firstWhere((a) => a.id == alert.id);
      expect(toggledBack.active, true);
    });

    test('toggleAlert with nonexistent ID does nothing', () {
      // Should not throw
      NotificationService.toggleAlert('nonexistent-id');
    });

    test('generateEmailHtml returns valid HTML string', () {
      final jobs = mockJobs.take(3).toList();
      final html = NotificationService.generateEmailHtml(
        userName: 'Ahmed',
        searchQuery: 'Softwareentwickler',
        jobs: jobs,
      );
      expect(html, isNotEmpty);
      expect(html, contains('<div'));
      expect(html, contains('Ahmed'));
      expect(html, contains('Softwareentwickler'));
      expect(html, contains('bewerbi.tn'));
    });

    test('generated HTML contains job titles', () {
      final jobs = mockJobs.take(2).toList();
      final html = NotificationService.generateEmailHtml(
        userName: 'Test User',
        searchQuery: 'IT Jobs',
        jobs: jobs,
      );
      for (final job in jobs) {
        expect(html, contains(job.title));
      }
    });

    test('generated HTML contains employer names', () {
      final jobs = mockJobs.where((j) => j.employer != null).take(2).toList();
      final html = NotificationService.generateEmailHtml(
        userName: 'Test User',
        searchQuery: 'Any',
        jobs: jobs,
      );
      for (final job in jobs) {
        if (job.employer != null) {
          expect(html, contains(job.employer!.fullName));
        }
      }
    });

    test('generated HTML contains job locations', () {
      final jobs = mockJobs.take(2).toList();
      final html = NotificationService.generateEmailHtml(
        userName: 'Test',
        searchQuery: 'Jobs',
        jobs: jobs,
      );
      for (final job in jobs) {
        expect(html, contains(job.location));
      }
    });

    test('generated HTML handles single job count text', () {
      final jobs = [mockJobs.first];
      final html = NotificationService.generateEmailHtml(
        userName: 'Test',
        searchQuery: 'Test',
        jobs: jobs,
      );
      expect(html, contains('1 neue Stelle'));
      expect(html, isNot(contains('1 neue Stellen')));
    });

    test('generated HTML handles multiple job count text', () {
      final jobs = mockJobs.take(3).toList();
      final html = NotificationService.generateEmailHtml(
        userName: 'Test',
        searchQuery: 'Test',
        jobs: jobs,
      );
      expect(html, contains('3 neue Stellen'));
    });
  });
}
