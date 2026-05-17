import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/services/api_client.dart';

/// GDPR right-to-erasure. Mirrors web + mobile screens (Iter 78 / 79).
class DeleteAccountScreen extends ConsumerStatefulWidget {
  const DeleteAccountScreen({super.key});

  @override
  ConsumerState<DeleteAccountScreen> createState() =>
      _DeleteAccountScreenState();
}

class _DeleteAccountScreenState extends ConsumerState<DeleteAccountScreen> {
  static const _confirmPhrase = 'LÖSCHEN';

  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _error = null);
    if (!ApiClient.isApiMode) {
      setState(() => _error = 'Funktion nur im API-Modus verfügbar.');
      return;
    }
    if (_passwordCtrl.text.isEmpty) {
      setState(() => _error = 'Passwort eingeben.');
      return;
    }
    if (_confirmCtrl.text != _confirmPhrase) {
      setState(() => _error = 'Bitte "$_confirmPhrase" zur Bestätigung tippen.');
      return;
    }
    setState(() => _loading = true);
    try {
      await ApiClient.instance.post(
        '/api/v1/auth/me/delete',
        body: {'password': _passwordCtrl.text},
      );
      await ref.read(authProvider.notifier).signOut();
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
        _error = 'Löschen fehlgeschlagen.';
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
        title: const Text('Konto löschen'),
      ),
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Row(
              children: [
                const Icon(LucideIcons.trash2, size: 22, color: AppColors.error),
                const SizedBox(width: 8),
                Text(
                  'Konto löschen',
                  style: GoogleFonts.inter(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: isDark ? AppColors.white : AppColors.gray900,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Permanente Löschung deines bewerbi.tn-Kontos und aller verknüpften Daten.',
              style: GoogleFonts.inter(
                fontSize: 14,
                color: AppColors.gray500,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.error.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(LucideIcons.alertTriangle,
                      size: 16, color: AppColors.error),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Diese Aktion kann nicht rückgängig gemacht werden. '
                      'Profil, Bewerbungen, Favoriten und Anerkennungs-Cases werden entfernt.',
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: AppColors.error,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _passwordCtrl,
              obscureText: true,
              decoration: const InputDecoration(
                hintText: 'Passwort zur Bestätigung',
                prefixIcon: Icon(Icons.lock_outline, size: 20),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Tippe $_confirmPhrase zur Bestätigung',
              style: GoogleFonts.inter(fontSize: 12, color: AppColors.gray500),
            ),
            const SizedBox(height: 4),
            TextField(
              controller: _confirmCtrl,
              textCapitalization: TextCapitalization.characters,
              decoration: const InputDecoration(hintText: _confirmPhrase),
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
              child: FilledButton(
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.error,
                ),
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
                        'Endgültig löschen',
                        style: GoogleFonts.inter(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
