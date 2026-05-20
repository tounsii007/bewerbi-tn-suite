import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/services/api_client.dart';
import 'package:bewerbi_tn_flutter/widgets/password_strength_bar.dart';
import 'package:bewerbi_tn_flutter/widgets/app_aurora_background.dart';
import 'package:bewerbi_tn_flutter/widgets/app_gradient_text.dart';
import 'package:bewerbi_tn_flutter/widgets/app_reveal.dart';

/// Deep-link target for the password-reset email. The reset email built by
/// notification-service points at `https://bewerbi.tn/reset-password?token=…`,
/// which the mobile build maps onto `/reset-password` via universal links.
class ResetPasswordScreen extends ConsumerStatefulWidget {
  const ResetPasswordScreen({super.key, required this.token});

  final String token;

  @override
  ConsumerState<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _loading = false;
  bool _done = false;
  String? _error;

  @override
  void dispose() {
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _error = null);
    if (widget.token.isEmpty) {
      setState(() => _error = 'Kein Token. Bitte fordere einen neuen Link an.');
      return;
    }
    if (_passwordCtrl.text.length < 8) {
      setState(() => _error = 'Mindestens 8 Zeichen.');
      return;
    }
    if (_passwordCtrl.text != _confirmCtrl.text) {
      setState(() => _error = 'Passwörter stimmen nicht überein.');
      return;
    }

    setState(() => _loading = true);
    try {
      if (ApiClient.isApiMode) {
        await ApiClient.instance.post(
          '/api/v1/auth/password/reset',
          body: {'token': widget.token, 'newPassword': _passwordCtrl.text},
        );
      } else {
        await Future<void>.delayed(const Duration(milliseconds: 500));
      }
      if (!mounted) return;
      setState(() {
        _loading = false;
        _done = true;
      });
      await Future<void>.delayed(const Duration(milliseconds: 1200));
      if (!mounted) return;
      context.go('/login');
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e.message;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'Link ungültig oder abgelaufen.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/login'),
        ),
      ),
      extendBodyBehindAppBar: true,
      body: AppAuroraBackground(
        variant: AuroraVariant.defaultStrength,
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: _done ? _buildSuccess(isDark) : _buildForm(isDark),
          ),
        ),
      ),
    );
  }

  Widget _buildForm(bool isDark) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          AppReveal(
            direction: AppRevealDirection.up,
            child: Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [AppColors.primary, Color(0xFF6D4CF7)],
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.3),
                    offset: const Offset(0, 8),
                    blurRadius: 20,
                  ),
                ],
              ),
              child: const Icon(Icons.lock_outline, size: 32, color: Colors.white),
            ),
          ),
          const SizedBox(height: 24),
          AppReveal(
            direction: AppRevealDirection.up,
            delay: const Duration(milliseconds: 100),
            child: AppGradientText(
              'Neues Passwort',
              variant: GradientVariant.brand,
              style: GoogleFonts.inter(
                fontSize: 28,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Du wirst nach dem Setzen auf allen Geräten abgemeldet.',
            style: GoogleFonts.inter(fontSize: 14, color: AppColors.gray500, height: 1.5),
          ),
          const SizedBox(height: 24),
        TextField(
          controller: _passwordCtrl,
          obscureText: true,
          onChanged: (_) => setState(() {}),
          textInputAction: TextInputAction.next,
          decoration: const InputDecoration(
            hintText: 'Neues Passwort',
            prefixIcon: Icon(Icons.lock_outline, size: 20),
          ),
        ),
        PasswordStrengthBar(value: _passwordCtrl.text),
        const SizedBox(height: 12),
        TextField(
          controller: _confirmCtrl,
          obscureText: true,
          textInputAction: TextInputAction.done,
          onSubmitted: (_) => _submit(),
          decoration: const InputDecoration(
            hintText: 'Passwort bestätigen',
            prefixIcon: Icon(Icons.lock_outline, size: 20),
          ),
        ),
        if (_error != null) ...[
          const SizedBox(height: 8),
          Text(
            _error!,
            style: GoogleFonts.inter(fontSize: 13, color: AppColors.error),
          ),
        ],
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton(
            onPressed: _loading ? null : _submit,
            child: _loading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.white,
                    ),
                  )
                : Text(
                    'Passwort speichern',
                    style: GoogleFonts.inter(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
          ),
        ),
      ],
      ),
    );
  }

  Widget _buildSuccess(bool isDark) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 80,
          height: 80,
          decoration: BoxDecoration(
            color: AppColors.success.withValues(alpha: 0.1),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.check_circle_outline,
            size: 48,
            color: AppColors.success,
          ),
        ),
        const SizedBox(height: 24),
        Text(
          'Passwort aktualisiert',
          style: GoogleFonts.inter(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.white : AppColors.gray900,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Du wirst gleich zum Login weitergeleitet…',
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(fontSize: 14, color: AppColors.gray500, height: 1.5),
        ),
      ],
    );
  }
}
