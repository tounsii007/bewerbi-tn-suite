import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/models/profile.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with TickerProviderStateMixin {
  late final AnimationController _fadeController;
  late final AnimationController _slideController;
  late final AnimationController _flagController;
  late final AnimationController _dotsController;

  late final Animation<double> _fadeAnimation;
  late final Animation<Offset> _slideAnimation;
  late final Animation<double> _flagFadeAnimation;
  late final Animation<double> _dotsFadeAnimation;

  @override
  void initState() {
    super.initState();

    // Logo fade-in
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOut,
    );

    // Title slide up + fade
    _slideController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOut,
    ));

    // Flag row
    _flagController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _flagFadeAnimation = CurvedAnimation(
      parent: _flagController,
      curve: Curves.easeIn,
    );

    // Dots
    _dotsController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _dotsFadeAnimation = CurvedAnimation(
      parent: _dotsController,
      curve: Curves.easeIn,
    );

    _startAnimationSequence();
  }

  Future<void> _startAnimationSequence() async {
    await Future<void>.delayed(const Duration(milliseconds: 200));
    if (!mounted) return;
    _fadeController.forward();

    await Future<void>.delayed(const Duration(milliseconds: 400));
    if (!mounted) return;
    _slideController.forward();

    await Future<void>.delayed(const Duration(milliseconds: 300));
    if (!mounted) return;
    _flagController.forward();

    await Future<void>.delayed(const Duration(milliseconds: 300));
    if (!mounted) return;
    _dotsController.forward();

    // Wait remaining time then navigate
    await Future<void>.delayed(const Duration(milliseconds: 1300));
    if (!mounted) return;
    _navigate();
  }

  Future<void> _navigate() async {
    final prefs = await SharedPreferences.getInstance();
    final onboardingCompleted =
        prefs.getBool('onboarding_completed') ?? false;

    if (!mounted) return;

    if (!onboardingCompleted) {
      context.go('/onboarding');
      return;
    }

    final authState = ref.read(authProvider);

    if (!authState.isLoggedIn) {
      context.go('/login');
      return;
    }

    final role = authState.profile?.role ?? UserRole.applicant;
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
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    _flagController.dispose();
    _dotsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              AppColors.primary, // primary-500
              AppColors.primaryDark, // primary-800
            ],
          ),
        ),
        child: SafeArea(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(flex: 3),

              // Logo: white rounded square with "B" and ".tn" badge
              FadeTransition(
                opacity: _fadeAnimation,
                child: _buildLogo(),
              ),

              const SizedBox(height: 24),

              // Title "bewerbi.tn"
              SlideTransition(
                position: _slideAnimation,
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: Text(
                    'bewerbi.tn',
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                          color: AppColors.white,
                          fontSize: 32,
                          fontWeight: FontWeight.w800,
                        ),
                  ),
                ),
              ),

              const SizedBox(height: 8),

              // Subtitle
              SlideTransition(
                position: _slideAnimation,
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: Text(
                    'Deine Brücke nach Deutschland',
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: AppColors.white.withValues(alpha: 0.85),
                          fontSize: 16,
                        ),
                  ),
                ),
              ),

              const SizedBox(height: 32),

              // Flag row: Tunisia -> Germany
              FadeTransition(
                opacity: _flagFadeAnimation,
                child: _buildFlagRow(),
              ),

              const SizedBox(height: 40),

              // Loading dots
              FadeTransition(
                opacity: _dotsFadeAnimation,
                child: const _LoadingDots(),
              ),

              const Spacer(flex: 4),
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
        children: [
          Container(
            width: 96,
            height: 96,
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x40000000),
                  blurRadius: 20,
                  offset: Offset(0, 8),
                ),
              ],
            ),
            child: const Center(
              child: Text(
                'B',
                style: TextStyle(
                  color: AppColors.primary,
                  fontSize: 48,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
          // ".tn" red badge
          Positioned(
            right: -4,
            top: -4,
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
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFlagRow() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Tunisia flag
        _buildFlag('\u{1F1F9}\u{1F1F3}'),
        const SizedBox(width: 12),
        Icon(
          Icons.arrow_forward,
          color: AppColors.white.withValues(alpha: 0.7),
          size: 20,
        ),
        const SizedBox(width: 12),
        // Germany flag
        _buildFlag('\u{1F1E9}\u{1F1EA}'),
      ],
    );
  }

  Widget _buildFlag(String emoji) {
    return Text(
      emoji,
      style: const TextStyle(fontSize: 32),
    );
  }
}

class _LoadingDots extends StatefulWidget {
  const _LoadingDots();

  @override
  State<_LoadingDots> createState() => _LoadingDotsState();
}

class _LoadingDotsState extends State<_LoadingDots>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(3, (index) {
            final delay = index * 0.2;
            final value = _controller.value;
            final opacity =
                ((value - delay) % 1.0 < 0.5) ? 1.0 : 0.3;
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: AppColors.white.withValues(alpha: opacity),
                shape: BoxShape.circle,
              ),
            );
          }),
        );
      },
    );
  }
}
