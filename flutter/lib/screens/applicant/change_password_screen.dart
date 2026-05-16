import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/services/api_client.dart';
import 'package:bewerbi_tn_flutter/widgets/password_strength_bar.dart';

/// Authenticated change-password screen. The backend revokes every
/// refresh token on success — including this one — so we sign out
/// locally and route to /login.
class ChangePasswordScreen extends ConsumerStatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  ConsumerState<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends ConsumerState<ChangePasswordScreen> {
  final _oldCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _loading = false;
  bool _done = false;
  String? _error;

  @override
  void dispose() {
    _oldCtrl.dispose();
    _newCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _error = null);
    if (_newCtrl.text.length < 8) {
      setState(() => _error = 'Mindestens 8 Zeichen.');
      return;
    }
    if (_newCtrl.text != _confirmCtrl.text) {
      setState(() => _error = 'Passwörter stimmen nicht überein.');
      return;
    }
    if (!ApiClient.isApiMode) {
      setState(() => _error = 'Funktion nur im API-Modus verfügbar.');
      return;
    }
    setState(() => _loading = true);
    try {
      await ApiClient.instance.post(
        '/api/v1/auth/password/change',
        body: {'oldPassword': _oldCtrl.text, 'newPassword': _newCtrl.text},
      );
      if (!mounted) return;
      setState(() {
        _loading = false;
        _done = true;
      });
      await ref.read(authProvider.notifier).signOut();
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
        _error = 'Änderung fehlgeschlagen.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Passwort ändern'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: _done ? _buildDone(isDark) : _buildForm(isDark),
        ),
      ),
    );
  }

  Widget _buildForm(bool isDark) {
    return ListView(
      children: [
        const SizedBox(height: 8),
        Text(
          'Du wirst nach der Änderung auf allen Geräten abgemeldet.',
          style: GoogleFonts.inter(fontSize: 14, color: AppColors.gray500, height: 1.5),
        ),
        const SizedBox(height: 20),
        TextField(
          controller: _oldCtrl,
          obscureText: true,
          textInputAction: TextInputAction.next,
          decoration: const InputDecoration(
            hintText: 'Aktuelles Passwort',
            prefixIcon: Icon(Icons.lock_outline, size: 20),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: _newCtrl,
          obscureText: true,
          textInputAction: TextInputAction.next,
          onChanged: (_) => setState(() {}),
          decoration: const InputDecoration(
            hintText: 'Neues Passwort',
            prefixIcon: Icon(Icons.lock_outline, size: 20),
          ),
        ),
        PasswordStrengthBar(value: _newCtrl.text),
        const SizedBox(height: 12),
        TextField(
          controller: _confirmCtrl,
          obscureText: true,
          textInputAction: TextInputAction.done,
          onSubmitted: (_) => _submit(),
          decoration: const InputDecoration(
            hintText: 'Neues Passwort bestätigen',
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
    );
  }

  Widget _buildDone(bool isDark) {
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
