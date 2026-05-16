import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/providers/theme_provider.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  final _languages = ['Deutsch', 'العربية', 'Français'];
  int _languageIndex = 0;
  bool _notificationsEnabled = true;

  void _cycleLanguage() {
    setState(() {
      _languageIndex = (_languageIndex + 1) % _languages.length;
    });
  }

  Future<void> _handleLogout() async {
    await ref.read(authProvider.notifier).signOut();
    if (mounted) {
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDarkMode = ref.watch(themeProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
                child: Text(
                  'Einstellungen',
                  style: GoogleFonts.inter(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: isDark ? AppColors.white : AppColors.gray900,
                  ),
                ),
              ),

              // KONTO section
              _buildSectionHeader('KONTO', isDark),
              _buildSettingTile(
                icon: LucideIcons.languages,
                iconColor: AppColors.primary,
                title: 'Sprache',
                subtitle: _languages[_languageIndex],
                isDark: isDark,
                trailing: Icon(
                  Icons.chevron_right,
                  color: isDark ? AppColors.gray500 : AppColors.gray400,
                ),
                onTap: _cycleLanguage,
              ),
              _buildSettingTile(
                icon: isDarkMode ? LucideIcons.moon : LucideIcons.sun,
                iconColor: AppColors.warning,
                title: 'Dunkelmodus',
                subtitle: isDarkMode ? 'Aktiviert' : 'Deaktiviert',
                isDark: isDark,
                trailing: Switch.adaptive(
                  value: isDarkMode,
                  onChanged: (_) => ref.read(themeProvider.notifier).toggle(),
                  activeTrackColor: AppColors.primary,
                  activeThumbColor: AppColors.white,
                ),
                onTap: () => ref.read(themeProvider.notifier).toggle(),
              ),
              _buildSettingTile(
                icon: LucideIcons.userCog,
                iconColor: AppColors.error,
                title: 'Konto verwalten',
                isDark: isDark,
                trailing: Icon(
                  Icons.chevron_right,
                  color: isDark ? AppColors.gray500 : AppColors.gray400,
                ),
                onTap: () => context.go('/applicant/settings/account'),
              ),

              _buildSettingTile(
                icon: LucideIcons.keyRound,
                iconColor: AppColors.warning,
                title: 'Passwort ändern',
                isDark: isDark,
                trailing: Icon(
                  Icons.chevron_right,
                  color: isDark ? AppColors.gray500 : AppColors.gray400,
                ),
                onTap: () => context.go('/applicant/settings/change-password'),
              ),
              _buildSettingTile(
                icon: LucideIcons.smartphone,
                iconColor: AppColors.info,
                title: 'Aktive Sitzungen',
                isDark: isDark,
                trailing: Icon(
                  Icons.chevron_right,
                  color: isDark ? AppColors.gray500 : AppColors.gray400,
                ),
                onTap: () => context.go('/applicant/settings/sessions'),
              ),

              const SizedBox(height: 16),

              // APP section
              _buildSectionHeader('APP', isDark),
              _buildSettingTile(
                icon: LucideIcons.bell,
                iconColor: AppColors.info,
                title: 'Benachrichtigungen',
                subtitle: _notificationsEnabled ? 'Aktiviert' : 'Deaktiviert',
                isDark: isDark,
                trailing: Switch.adaptive(
                  value: _notificationsEnabled,
                  onChanged: (val) {
                    setState(() => _notificationsEnabled = val);
                  },
                  activeTrackColor: AppColors.primary,
                  activeThumbColor: AppColors.white,
                ),
                onTap: () {
                  setState(() =>
                      _notificationsEnabled = !_notificationsEnabled);
                },
              ),
              _buildSettingTile(
                icon: LucideIcons.helpCircle,
                iconColor: AppColors.primary,
                title: 'Hilfe & Support',
                isDark: isDark,
                trailing: Icon(
                  Icons.chevron_right,
                  color: isDark ? AppColors.gray500 : AppColors.gray400,
                ),
                onTap: () => context.go('/legal/support'),
              ),

              const SizedBox(height: 16),

              // RECHTLICHES section
              _buildSectionHeader('RECHTLICHES', isDark),
              _buildSettingTile(
                icon: LucideIcons.shield,
                iconColor: AppColors.success,
                title: 'Datenschutz',
                isDark: isDark,
                trailing: Icon(
                  Icons.chevron_right,
                  color: isDark ? AppColors.gray500 : AppColors.gray400,
                ),
                onTap: () => context.go('/legal/privacy'),
              ),
              _buildSettingTile(
                icon: LucideIcons.fileText,
                iconColor: AppColors.gray500,
                title: 'Nutzungsbedingungen',
                isDark: isDark,
                trailing: Icon(
                  Icons.chevron_right,
                  color: isDark ? AppColors.gray500 : AppColors.gray400,
                ),
                onTap: () => context.go('/legal/terms'),
              ),
              _buildSettingTile(
                icon: LucideIcons.info,
                iconColor: AppColors.primary,
                title: 'Ueber bewerbi.tn',
                subtitle: 'v1.0.0',
                isDark: isDark,
                trailing: Icon(
                  Icons.chevron_right,
                  color: isDark ? AppColors.gray500 : AppColors.gray400,
                ),
                onTap: () => context.go('/legal/impressum'),
              ),

              const SizedBox(height: 32),

              // Logout button
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: OutlinedButton(
                    onPressed: _handleLogout,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.error,
                      side: const BorderSide(color: AppColors.error),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(LucideIcons.logOut, size: 18),
                        const SizedBox(width: 8),
                        Text(
                          'Abmelden',
                          style: GoogleFonts.inter(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Footer
              Center(
                child: Text(
                  'bewerbi.tn v1.0.0 | Made with love in Tunisia',
                  style: GoogleFonts.inter(
                    fontSize: 12,
                    color: AppColors.gray400,
                  ),
                ),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, bool isDark) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
      child: Text(
        title,
        style: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.5,
          color: AppColors.gray400,
        ),
      ),
    );
  }

  Widget _buildSettingTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    String? subtitle,
    required bool isDark,
    required Widget trailing,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.fromLTRB(20, 0, 20, 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkCard : AppColors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: AppShadows.sm,
        ),
        child: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: iconColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 18, color: iconColor),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.inter(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: isDark ? AppColors.white : AppColors.gray800,
                    ),
                  ),
                  if (subtitle != null)
                    Text(
                      subtitle,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        color: AppColors.gray500,
                      ),
                    ),
                ],
              ),
            ),
            trailing,
          ],
        ),
      ),
    );
  }
}
