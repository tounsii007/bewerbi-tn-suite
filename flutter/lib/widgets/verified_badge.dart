import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';

enum VerificationStatus { unverified, pendingReview, verified, rejected }

class VerifiedBadge extends StatelessWidget {
  final VerificationStatus status;
  final bool compact;

  const VerifiedBadge({super.key, required this.status, this.compact = true});

  @override
  Widget build(BuildContext context) {
    final (icon, bg, fg, label) = switch (status) {
      VerificationStatus.verified => (LucideIcons.shieldCheck, AppColors.successSoft, AppColors.successDark, 'Verifiziert'),
      VerificationStatus.pendingReview => (LucideIcons.shield, AppColors.warningSoft, AppColors.warningDark, 'Prüfung läuft'),
      VerificationStatus.unverified => (LucideIcons.shieldAlert, AppColors.gray100, AppColors.gray600, 'Nicht verifiziert'),
      // `shieldX` doesn't exist in lucide_icons 0.257; the equivalent
      // "rejected" glyph is `shieldClose`.
      VerificationStatus.rejected => (LucideIcons.shieldClose, AppColors.errorSoft, AppColors.error, 'Abgelehnt'),
    };
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 10,
        vertical: compact ? 4 : 6,
      ),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: compact ? 12 : 14, color: fg),
          const SizedBox(width: 4),
          Text(label,
              style: GoogleFonts.inter(
                fontSize: compact ? 11 : 12,
                fontWeight: FontWeight.w700,
                color: fg,
              )),
        ],
      ),
    );
  }
}
