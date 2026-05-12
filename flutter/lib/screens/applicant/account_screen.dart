import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/services/supabase_service.dart';

part 'account/account_screen_constants.dart';
part 'account/account_screen_widgets.dart';

class AccountScreen extends ConsumerStatefulWidget {
  const AccountScreen({super.key});

  @override
  ConsumerState<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends ConsumerState<AccountScreen> {
  String? _passwordError;

  final _newEmailController = TextEditingController();
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _deleteController = TextEditingController();

  @override
  void dispose() {
    _newEmailController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    _deleteController.dispose();
    super.dispose();
  }

  String get _currentEmail {
    final profile = ref.read(authProvider).profile;
    if (profile != null) {
      return '${profile.firstName.toLowerCase()}.${profile.lastName.toLowerCase()}@bewerbi.tn';
    }
    return _AccountScreenText.fallbackEmail;
  }

  bool get _isEmailVerified => SupabaseService.isMockMode;

  void _showMessage(String message, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: GoogleFonts.inter()),
        backgroundColor: color,
      ),
    );
  }

  void _changeEmail() {
    final newEmail = _newEmailController.text.trim();
    if (newEmail.isEmpty || !newEmail.contains('@')) {
      _showMessage(_AccountScreenText.invalidEmail, AppColors.error);
      return;
    }

    _showMessage(
      'Bestaetigungsmail an $newEmail gesendet (Demo)',
      AppColors.success,
    );
    _newEmailController.clear();
  }

  void _changePassword() {
    String? error;
    final currentPassword = _currentPasswordController.text;
    final newPassword = _newPasswordController.text;
    final confirmPassword = _confirmPasswordController.text;

    if (currentPassword.isEmpty) {
      error = _AccountScreenText.currentPasswordMissing;
    } else if (newPassword.length < 8) {
      error = _AccountScreenText.passwordTooShort;
    } else if (newPassword != confirmPassword) {
      error = _AccountScreenText.passwordMismatch;
    }

    if (error != null) {
      setState(() => _passwordError = error);
      return;
    }

    setState(() {
      _passwordError = null;
    });
    _currentPasswordController.clear();
    _newPasswordController.clear();
    _confirmPasswordController.clear();

    _showMessage(_AccountScreenText.passwordChanged, AppColors.success);
  }

  void _sendVerificationEmail() {
    _showMessage(_AccountScreenText.verificationSent, AppColors.success);
  }

  void _exportData() {
    _showMessage(_AccountScreenText.exportStarted, AppColors.info);
  }

  Future<void> _confirmDelete(BuildContext dialogContext) async {
    if (_deleteController.text.trim() !=
        _AccountScreenText.deleteConfirmation) {
      return;
    }

    Navigator.of(dialogContext).pop();
    await ref.read(authProvider.notifier).signOut();

    if (!mounted) return;
    _showMessage(_AccountScreenText.accountDeleted, AppColors.error);
    context.go('/login');
  }

  void _showDeleteDialog() {
    _deleteController.clear();
    showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: Text(
            _AccountScreenText.deleteDialogTitle,
            style: GoogleFonts.inter(fontWeight: FontWeight.w700),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _AccountScreenText.deleteDialogBody,
                style: GoogleFonts.inter(fontSize: 14),
              ),
              const SizedBox(height: AppSpacing.lg),
              Text(
                _AccountScreenText.deleteDialogInstruction,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              TextField(
                controller: _deleteController,
                decoration: InputDecoration(
                  hintText: _AccountScreenText.deleteConfirmation,
                  hintStyle: GoogleFonts.inter(
                    fontSize: 14,
                    color: AppColors.gray400,
                  ),
                ),
                style: GoogleFonts.inter(fontSize: 14),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(dialogContext).pop(),
              child: Text(
                'Abbrechen',
                style: GoogleFonts.inter(color: AppColors.gray500),
              ),
            ),
            TextButton(
              onPressed: () => _confirmDelete(dialogContext),
              child: Text(
                'Endgueltig loeschen',
                style: GoogleFonts.inter(
                  color: AppColors.error,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        );
      },
    );
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
        title: Text(
          'Konto verwalten',
          style: GoogleFonts.inter(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.white : AppColors.gray900,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: _AccountScreenUi.screenPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _AccountSectionCard(
              isDark: isDark,
              icon: LucideIcons.mail,
              iconColor: AppColors.primary,
              title: 'E-Mail aendern',
              children: [
                _AccountLabel(text: 'Aktuelle E-Mail', isDark: isDark),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  _currentEmail,
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: isDark ? AppColors.white : AppColors.gray800,
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                _AccountLabel(text: 'Neue E-Mail', isDark: isDark),
                const SizedBox(height: 6),
                _AccountTextField(
                  controller: _newEmailController,
                  placeholder: 'neue.email@beispiel.de',
                  isDark: isDark,
                  keyboardType: TextInputType.emailAddress,
                  onChanged: (_) {},
                ),
                const SizedBox(height: AppSpacing.md),
                _AccountActionButton(
                  label: 'Aendern',
                  color: AppColors.primary,
                  onPressed: _changeEmail,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),
            _AccountSectionCard(
              isDark: isDark,
              icon: LucideIcons.lock,
              iconColor: AppColors.warning,
              title: 'Passwort aendern',
              children: [
                _AccountLabel(text: 'Aktuelles Passwort', isDark: isDark),
                const SizedBox(height: 6),
                _AccountTextField(
                  controller: _currentPasswordController,
                  placeholder: 'Aktuelles Passwort',
                  isDark: isDark,
                  obscureText: true,
                  onChanged: (_) {},
                ),
                const SizedBox(height: AppSpacing.md),
                _AccountLabel(text: 'Neues Passwort', isDark: isDark),
                const SizedBox(height: 6),
                _AccountTextField(
                  controller: _newPasswordController,
                  placeholder: 'Mindestens 8 Zeichen',
                  isDark: isDark,
                  obscureText: true,
                  onChanged: (_) {},
                ),
                const SizedBox(height: AppSpacing.md),
                _AccountLabel(text: 'Passwort bestaetigen', isDark: isDark),
                const SizedBox(height: 6),
                _AccountTextField(
                  controller: _confirmPasswordController,
                  placeholder: 'Passwort wiederholen',
                  isDark: isDark,
                  obscureText: true,
                  onChanged: (_) {},
                ),
                if (_passwordError case final error?) ...[
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    error,
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: AppColors.error,
                    ),
                  ),
                ],
                const SizedBox(height: AppSpacing.md),
                _AccountActionButton(
                  label: 'Passwort aendern',
                  color: AppColors.warning,
                  onPressed: _changePassword,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),
            _AccountSectionCard(
              isDark: isDark,
              icon: LucideIcons.shieldCheck,
              iconColor: AppColors.success,
              title: 'E-Mail-Verifizierung',
              children: [
                Row(
                  children: [
                    Text(
                      'Status: ',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        color: isDark ? AppColors.gray300 : AppColors.gray600,
                      ),
                    ),
                    _VerificationBadge(isVerified: _isEmailVerified),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                _AccountActionButton(
                  label: 'Bestaetigungsmail senden',
                  color: AppColors.success,
                  onPressed: _sendVerificationEmail,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),
            _AccountSectionCard(
              isDark: isDark,
              icon: LucideIcons.download,
              iconColor: AppColors.info,
              title: 'Datenexport',
              children: [
                Text(
                  'Lade eine Kopie aller deiner gespeicherten Daten herunter.',
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    color: isDark ? AppColors.gray300 : AppColors.gray600,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                _AccountActionButton(
                  label: 'Meine Daten herunterladen',
                  color: AppColors.info,
                  onPressed: _exportData,
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),
            _DangerZoneCard(isDark: isDark, onDelete: _showDeleteDialog),
            const SizedBox(height: AppSpacing.xxl + AppSpacing.sm),
          ],
        ),
      ),
    );
  }
}
