import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/models/profile.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();

    if (email.isEmpty || password.isEmpty) return;

    setState(() => _isLoading = true);

    await ref.read(authProvider.notifier).signIn(email, password);

    if (!mounted) return;
    setState(() => _isLoading = false);

    final authState = ref.read(authProvider);
    if (authState.isLoggedIn) {
      _navigateByRole(authState.profile?.role ?? UserRole.applicant);
    }
  }

  void _handleDemoLogin(UserRole role) {
    ref.read(authProvider.notifier).mockLoginAs(role);
    _navigateByRole(role);
  }

  void _navigateByRole(UserRole role) {
    switch (role) {
      case UserRole.applicant:
        context.go('/applicant/home');
      case UserRole.employer:
        context.go('/employer/dashboard');
      case UserRole.admin:
        context.go('/admin/users');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            children: [
              const SizedBox(height: 48),

              // Logo
              _buildLogo(),
              const SizedBox(height: 16),

              // Title
              Text(
                'bewerbi.tn',
                style: GoogleFonts.inter(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Deine Brücke nach Deutschland',
                style: GoogleFonts.inter(
                  fontSize: 14,
                  color: AppColors.gray500,
                ),
              ),

              const SizedBox(height: 40),

              // Email input
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

              // Password input
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _handleLogin(),
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
              const SizedBox(height: 8),

              // Forgot password link
              Align(
                alignment: Alignment.centerRight,
                child: TextButton(
                  onPressed: () => context.push('/forgot-password'),
                  child: Text(
                    'Passwort vergessen?',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: AppColors.primary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Login button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
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
                          'Anmelden',
                          style: GoogleFonts.inter(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 24),
              Row(
                children: [
                  Expanded(child: Divider(color: isDark ? AppColors.darkBorder : AppColors.gray200)),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Text('oder', style: GoogleFonts.inter(fontSize: 13, color: AppColors.gray400)),
                  ),
                  Expanded(child: Divider(color: isDark ? AppColors.darkBorder : AppColors.gray200)),
                ],
              ),
              const SizedBox(height: 16),
              // Google button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: OutlinedButton.icon(
                  onPressed: () {
                    ref.read(authProvider.notifier).signIn('demo@bewerbi.tn', 'demo');
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Google Login (Demo-Modus)'), backgroundColor: AppColors.primary));
                    context.go('/applicant/home');
                  },
                  icon: Text('G', style: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700, color: const Color(0xFF4285F4))),
                  label: Text('Mit Google anmelden', style: GoogleFonts.inter(fontSize: 14, color: isDark ? AppColors.white : AppColors.gray700)),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(color: isDark ? AppColors.darkBorder : AppColors.gray200),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              // Facebook button
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: () {
                    ref.read(authProvider.notifier).signIn('demo@bewerbi.tn', 'demo');
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Facebook Login (Demo-Modus)'), backgroundColor: AppColors.primary));
                    context.go('/applicant/home');
                  },
                  icon: const Icon(LucideIcons.facebook, size: 20, color: Colors.white),
                  label: Text('Mit Facebook anmelden', style: GoogleFonts.inter(fontSize: 14, color: Colors.white)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1877F2),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Register link
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'Noch kein Konto? ',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      color: isDark ? AppColors.gray400 : AppColors.gray600,
                    ),
                  ),
                  GestureDetector(
                    onTap: () => context.push('/register'),
                    child: Text(
                      'Registrieren',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 40),

              // Demo section
              _buildDemoSection(isDark),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLogo() {
    return SizedBox(
      width: 96,
      height: 96,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: 96,
            height: 96,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(24),
              boxShadow: AppShadows.lg,
            ),
            child: const Center(
              child: Text(
                'B',
                style: TextStyle(
                  color: AppColors.white,
                  fontSize: 48,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
          Positioned(
            right: -6,
            top: -6,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.error,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Text(
                '.tn',
                style: TextStyle(
                  color: AppColors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDemoSection(bool isDark) {
    return Column(
      children: [
        // Divider with label
        Row(
          children: [
            Expanded(
              child: Divider(
                color: isDark ? AppColors.darkBorder : AppColors.gray200,
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                'DEMO-MODUS',
                style: GoogleFonts.inter(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.5,
                  color: AppColors.gray400,
                ),
              ),
            ),
            Expanded(
              child: Divider(
                color: isDark ? AppColors.darkBorder : AppColors.gray200,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Demo role chips
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _DemoChip(
              label: 'Bewerber',
              color: AppColors.primary,
              onTap: () => _handleDemoLogin(UserRole.applicant),
            ),
            const SizedBox(width: 12),
            _DemoChip(
              label: 'Arbeitgeber',
              color: AppColors.success,
              onTap: () => _handleDemoLogin(UserRole.employer),
            ),
            const SizedBox(width: 12),
            _DemoChip(
              label: 'Admin',
              color: AppColors.warning,
              onTap: () => _handleDemoLogin(UserRole.admin),
            ),
          ],
        ),
      ],
    );
  }
}

class _DemoChip extends StatelessWidget {
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _DemoChip({
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Text(
          label,
          style: GoogleFonts.inter(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: color,
          ),
        ),
      ),
    );
  }
}
