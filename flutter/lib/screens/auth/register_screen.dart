import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/profile.dart';
import 'package:bewerbi_tn_flutter/widgets/password_strength_bar.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _obscurePassword = true;
  bool _obscureConfirm = true;
  UserRole _selectedRole = UserRole.applicant;
  bool _isLoading = false;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    final firstName = _firstNameController.text.trim();
    final lastName = _lastNameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();
    final confirmPassword = _confirmPasswordController.text.trim();

    if (firstName.isEmpty ||
        lastName.isEmpty ||
        email.isEmpty ||
        password.isEmpty) {
      _showError('Bitte füllen Sie alle Felder aus.');
      return;
    }

    if (password != confirmPassword) {
      _showError('Die Passwörter stimmen nicht überein.');
      return;
    }

    if (password.length < 8) {
      _showError('Das Passwort muss mindestens 8 Zeichen lang sein.');
      return;
    }

    setState(() => _isLoading = true);

    // Simulate registration delay
    await Future<void>.delayed(const Duration(milliseconds: 800));

    if (!mounted) return;
    setState(() => _isLoading = false);

    // Show success and navigate to login
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Registrierung erfolgreich! Bitte melden Sie sich an.'),
          backgroundColor: AppColors.success,
        ),
      );
      context.go('/login');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error,
      ),
    );
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
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 8),

              // Title
              Text(
                'Registrieren',
                style: GoogleFonts.inter(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: isDark ? AppColors.white : AppColors.gray900,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Erstellen Sie Ihr bewerbi.tn Konto',
                style: GoogleFonts.inter(
                  fontSize: 15,
                  color: AppColors.gray500,
                ),
              ),
              const SizedBox(height: 32),

              // First Name
              TextField(
                controller: _firstNameController,
                textInputAction: TextInputAction.next,
                style: GoogleFonts.inter(color: isDark ? AppColors.white : AppColors.gray900, fontSize: 15),
                decoration: InputDecoration(
                  hintText: 'Vorname',
                  hintStyle: GoogleFonts.inter(color: isDark ? AppColors.gray500 : AppColors.gray400),
                  fillColor: isDark ? AppColors.darkCard : AppColors.gray50,
                  prefixIcon: const Icon(Icons.person_outline, size: 20),
                ),
              ),
              const SizedBox(height: 16),

              // Last Name
              TextField(
                controller: _lastNameController,
                textInputAction: TextInputAction.next,
                style: GoogleFonts.inter(color: isDark ? AppColors.white : AppColors.gray900, fontSize: 15),
                decoration: InputDecoration(
                  hintText: 'Nachname',
                  hintStyle: GoogleFonts.inter(color: isDark ? AppColors.gray500 : AppColors.gray400),
                  fillColor: isDark ? AppColors.darkCard : AppColors.gray50,
                  prefixIcon: const Icon(Icons.person_outline, size: 20),
                ),
              ),
              const SizedBox(height: 16),

              // Email
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                style: GoogleFonts.inter(color: isDark ? AppColors.white : AppColors.gray900, fontSize: 15),
                decoration: InputDecoration(
                  hintText: 'E-Mail-Adresse',
                  hintStyle: GoogleFonts.inter(color: isDark ? AppColors.gray500 : AppColors.gray400),
                  fillColor: isDark ? AppColors.darkCard : AppColors.gray50,
                  prefixIcon: const Icon(Icons.email_outlined, size: 20),
                ),
              ),
              const SizedBox(height: 16),

              // Password
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                onChanged: (_) => setState(() {}),
                textInputAction: TextInputAction.next,
                style: GoogleFonts.inter(color: isDark ? AppColors.white : AppColors.gray900, fontSize: 15),
                decoration: InputDecoration(
                  hintText: 'Passwort',
                  hintStyle: GoogleFonts.inter(color: isDark ? AppColors.gray500 : AppColors.gray400),
                  fillColor: isDark ? AppColors.darkCard : AppColors.gray50,
                  prefixIcon: const Icon(Icons.lock_outline, size: 20),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      size: 20,
                    ),
                    onPressed: () {
                      setState(() => _obscurePassword = !_obscurePassword);
                    },
                  ),
                ),
              ),
              PasswordStrengthBar(value: _passwordController.text),
              const SizedBox(height: 16),

              // Confirm Password
              TextField(
                controller: _confirmPasswordController,
                obscureText: _obscureConfirm,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _handleRegister(),
                style: GoogleFonts.inter(color: isDark ? AppColors.white : AppColors.gray900, fontSize: 15),
                decoration: InputDecoration(
                  hintText: 'Passwort bestätigen',
                  hintStyle: GoogleFonts.inter(color: isDark ? AppColors.gray500 : AppColors.gray400),
                  fillColor: isDark ? AppColors.darkCard : AppColors.gray50,
                  prefixIcon: const Icon(Icons.lock_outline, size: 20),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscureConfirm
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      size: 20,
                    ),
                    onPressed: () {
                      setState(() => _obscureConfirm = !_obscureConfirm);
                    },
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Role selector
              Text(
                'Ich bin ein...',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.gray300 : AppColors.gray700,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _RoleChip(
                    label: 'Bewerber',
                    icon: Icons.school_outlined,
                    selected: _selectedRole == UserRole.applicant,
                    onTap: () {
                      setState(() => _selectedRole = UserRole.applicant);
                    },
                  ),
                  const SizedBox(width: 12),
                  _RoleChip(
                    label: 'Arbeitgeber',
                    icon: Icons.business_outlined,
                    selected: _selectedRole == UserRole.employer,
                    onTap: () {
                      setState(() => _selectedRole = UserRole.employer);
                    },
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Register button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleRegister,
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
                          'Registrieren',
                          style: GoogleFonts.inter(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 20),

              // Login link
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Bereits ein Konto? ',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: isDark ? AppColors.gray400 : AppColors.gray600,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => context.go('/login'),
                    child: Text(
                      'Anmelden',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const _RoleChip({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: selected
                ? AppColors.primary.withValues(alpha: 0.1)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: selected ? AppColors.primary : (isDark ? AppColors.darkBorder : AppColors.gray300),
              width: selected ? 2 : 1,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 20,
                color: selected ? AppColors.primary : (isDark ? AppColors.gray400 : AppColors.gray500),
              ),
              const SizedBox(width: 8),
              Text(
                label,
                style: GoogleFonts.inter(
                  fontSize: 14,
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                  color: selected ? AppColors.primary : (isDark ? AppColors.gray300 : AppColors.gray600),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
