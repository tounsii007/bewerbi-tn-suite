import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/services/api_client.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  bool _isLoading = false;
  bool _isSubmitted = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Bitte geben Sie Ihre E-Mail-Adresse ein.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    if (ApiClient.isApiMode) {
      try {
        // Backend always returns 204; the success card below renders no
        // matter what so the screen cannot leak whether the address is
        // registered (anti-enumeration).
        await ApiClient.instance.post(
          '/api/v1/auth/password/forgot',
          body: {'email': email},
        );
      } catch (_) {
        // Swallow on purpose — see comment above.
      }
    } else {
      await Future<void>.delayed(const Duration(milliseconds: 600));
    }

    if (!mounted) return;
    setState(() {
      _isLoading = false;
      _isSubmitted = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/login'),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: _isSubmitted ? _buildSuccess(isDark) : _buildForm(isDark),
        ),
      ),
    );
  }

  Widget _buildForm(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 16),

        // Icon
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(
            color: AppColors.primary.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Icon(
            Icons.lock_reset_outlined,
            size: 32,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(height: 24),

        // Title
        Text(
          'Passwort zurücksetzen',
          style: GoogleFonts.inter(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            color: isDark ? AppColors.white : AppColors.gray900,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen Ihres Passworts.',
          style: GoogleFonts.inter(
            fontSize: 14,
            color: AppColors.gray500,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 32),

        // Email input
        TextField(
          controller: _emailController,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.done,
          onSubmitted: (_) => _handleSubmit(),
          decoration: const InputDecoration(
            hintText: 'E-Mail-Adresse',
            prefixIcon: Icon(Icons.email_outlined, size: 20),
          ),
        ),
        const SizedBox(height: 24),

        // Submit button
        SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _handleSubmit,
            child: _isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.white,
                    ),
                  )
                : Text(
                    'Link senden',
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
          ),
        ),
      ],
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
          'E-Mail gesendet!',
          style: GoogleFonts.inter(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: isDark ? AppColors.white : AppColors.gray900,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Wir haben einen Link zum Zurücksetzen Ihres Passworts an ${_emailController.text.trim()} gesendet.',
          textAlign: TextAlign.center,
          style: GoogleFonts.inter(
            fontSize: 14,
            color: AppColors.gray500,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 32),
        SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton(
            onPressed: () => context.go('/login'),
            child: Text(
              'Zurück zur Anmeldung',
              style: GoogleFonts.inter(
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
