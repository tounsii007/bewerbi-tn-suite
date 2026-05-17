import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/services/api_client.dart';

/// Reminder for users who haven't yet confirmed their email. Mirrors the
/// web + mobile banners shipped in Iter 69 / 73. Renders nothing when:
///  - no session
///  - emailVerified is null  (unknown — likely re-hydrated session)
///  - emailVerified is true
///  - dismissed in this app run (in-memory only; the banner returns
///    on the next launch until the user actually verifies)
class VerifyEmailBanner extends ConsumerStatefulWidget {
  const VerifyEmailBanner({super.key});

  @override
  ConsumerState<VerifyEmailBanner> createState() => _VerifyEmailBannerState();
}

class _VerifyEmailBannerState extends ConsumerState<VerifyEmailBanner> {
  bool _dismissed = false;
  bool _sending = false;

  Future<void> _resend(String email) async {
    if (!ApiClient.isApiMode) return;
    setState(() => _sending = true);
    try {
      await ApiClient.instance.post(
        '/api/v1/auth/verify-email/resend',
        body: {'email': email},
      );
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Bestätigungs-Mail unterwegs.'),
        ),
      );
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(authProvider);
    final email = state.email;
    if (email == null || state.emailVerified != false || _dismissed) {
      return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF3C7),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFFCD34D)),
      ),
      child: Row(
        children: [
          const Icon(LucideIcons.alertCircle, size: 18, color: Color(0xFF92400E)),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Deine E-Mail ist noch nicht bestätigt.',
              style: GoogleFonts.inter(
                fontSize: 13,
                color: const Color(0xFF92400E),
              ),
            ),
          ),
          const SizedBox(width: 8),
          FilledButton(
            onPressed: _sending ? null : () => _resend(email),
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFFD97706),
              minimumSize: const Size(0, 32),
              padding: const EdgeInsets.symmetric(horizontal: 10),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: Text(
              _sending ? 'Senden…' : 'Erneut senden',
              style: GoogleFonts.inter(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: AppColors.white,
              ),
            ),
          ),
          IconButton(
            icon: const Icon(LucideIcons.x, size: 16, color: Color(0xFF92400E)),
            onPressed: () => setState(() => _dismissed = true),
            tooltip: 'Schließen',
            visualDensity: VisualDensity.compact,
          ),
        ],
      ),
    );
  }
}
