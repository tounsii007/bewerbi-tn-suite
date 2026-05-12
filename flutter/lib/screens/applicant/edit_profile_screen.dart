import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/data/cities.dart';
import 'package:bewerbi_tn_flutter/data/countries.dart';
import 'package:bewerbi_tn_flutter/models/profile.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/widgets/app_avatar.dart';

class EditProfileScreen extends ConsumerStatefulWidget {
  const EditProfileScreen({super.key});

  @override
  ConsumerState<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends ConsumerState<EditProfileScreen> {
  final _firstNameCtrl = TextEditingController();
  final _lastNameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _countryCtrl = TextEditingController();
  final _bioCtrl = TextEditingController();
  bool _initialized = false;
  bool _hasChanges = false;

  void _initFields(Profile? profile) {
    if (_initialized || profile == null) return;
    _firstNameCtrl.text = profile.firstName;
    _lastNameCtrl.text = profile.lastName;
    _phoneCtrl.text = profile.phone;
    _cityCtrl.text = profile.city;
    _countryCtrl.text = profile.country;
    _bioCtrl.text = profile.bio;
    _initialized = true;
  }

  void _markChanged() {
    if (!_hasChanges) setState(() => _hasChanges = true);
  }

  void _save() {
    final profile = ref.read(authProvider).profile;
    if (profile == null) return;

    final updated = profile.copyWith(
      firstName: _firstNameCtrl.text.trim(),
      lastName: _lastNameCtrl.text.trim(),
      phone: _phoneCtrl.text.trim(),
      city: _cityCtrl.text.trim(),
      country: _countryCtrl.text.trim(),
      bio: _bioCtrl.text.trim(),
    );

    ref.read(authProvider.notifier).updateProfile(updated);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(LucideIcons.checkCircle, color: Colors.white, size: 18),
            const SizedBox(width: 8),
            Text('Profil erfolgreich gespeichert', style: GoogleFonts.inter()),
          ],
        ),
        backgroundColor: AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );

    context.pop();
  }

  void _discard() {
    if (!_hasChanges) {
      context.pop();
      return;
    }
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Änderungen verwerfen?'),
        content: const Text('Deine Änderungen gehen verloren.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Abbrechen'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.pop();
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('Verwerfen'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _firstNameCtrl.dispose();
    _lastNameCtrl.dispose();
    _phoneCtrl.dispose();
    _cityCtrl.dispose();
    _countryCtrl.dispose();
    _bioCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final profile = authState.profile;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    _initFields(profile);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: _discard,
        ),
        title: const Text('Profil bearbeiten'),
        actions: [
          TextButton.icon(
            onPressed: _save,
            icon: const Icon(LucideIcons.check, size: 18),
            label: Text('Speichern', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Avatar
                  Center(
                    child: GestureDetector(
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: const Text('Foto-Upload wird mit Supabase-Backend verfügbar'),
                            backgroundColor: AppColors.primary,
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        );
                      },
                      child: Stack(
                        children: [
                          AppAvatar(
                            name: profile?.fullName ?? '',
                            size: AvatarSize.xl,
                          ),
                          Positioned(
                            bottom: 0,
                            right: 0,
                            child: Container(
                              width: 36,
                              height: 36,
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                shape: BoxShape.circle,
                                boxShadow: AppShadows.sm,
                                border: Border.all(color: isDark ? AppColors.darkBackground : AppColors.white, width: 2),
                              ),
                              child: const Icon(LucideIcons.camera, size: 18, color: AppColors.white),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 32),

                  // Form fields
                  _buildField('Vorname', _firstNameCtrl, 'Dein Vorname', isDark, icon: LucideIcons.user),
                  _buildField('Nachname', _lastNameCtrl, 'Dein Nachname', isDark, icon: LucideIcons.user),
                  _buildField('Telefon', _phoneCtrl, '+216 XX XXX XXX', isDark, icon: LucideIcons.phone, keyboard: TextInputType.phone),
                  _buildAutocompleteField('Stadt', _cityCtrl, 'z.B. Tunis', isDark, LucideIcons.mapPin, worldCities),
                  _buildAutocompleteField('Land', _countryCtrl, 'z.B. Tunesien', isDark, LucideIcons.globe, worldCountries),
                  _buildField('Über mich', _bioCtrl, 'Erzähle etwas über dich...', isDark, icon: LucideIcons.alignLeft, multiline: true),

                  const SizedBox(height: 16),
                ],
              ),
            ),
          ),

          // Bottom action bar
          Container(
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : AppColors.white,
              boxShadow: [
                BoxShadow(
                  color: AppColors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  // Discard button
                  Expanded(
                    child: SizedBox(
                      height: 48,
                      child: OutlinedButton.icon(
                        onPressed: _discard,
                        icon: const Icon(LucideIcons.x, size: 18),
                        label: Text('Verwerfen', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600)),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.gray500,
                          side: BorderSide(color: isDark ? AppColors.darkBorder : AppColors.gray200),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Save button
                  Expanded(
                    flex: 2,
                    child: SizedBox(
                      height: 48,
                      child: ElevatedButton.icon(
                        onPressed: _save,
                        icon: const Icon(LucideIcons.check, size: 18),
                        label: Text('Änderungen speichern', style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w600)),
                        style: ElevatedButton.styleFrom(
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAutocompleteField(
    String label,
    TextEditingController controller,
    String placeholder,
    bool isDark,
    IconData icon,
    List<String> options,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isDark ? AppColors.gray300 : AppColors.gray700,
            ),
          ),
          const SizedBox(height: 6),
          Autocomplete<String>(
            initialValue: TextEditingValue(text: controller.text),
            optionsBuilder: (textEditingValue) {
              if (textEditingValue.text.isEmpty) return const Iterable<String>.empty();
              final query = textEditingValue.text.toLowerCase();
              return options.where((o) => o.toLowerCase().contains(query));
            },
            onSelected: (value) {
              controller.text = value;
              _markChanged();
            },
            fieldViewBuilder: (context, textController, focusNode, onFieldSubmitted) {
              // Sync with our controller
              textController.text = controller.text;
              textController.addListener(() {
                if (controller.text != textController.text) {
                  controller.text = textController.text;
                  _markChanged();
                }
              });
              return TextFormField(
                controller: textController,
                focusNode: focusNode,
                style: GoogleFonts.inter(fontSize: 15, color: isDark ? AppColors.white : AppColors.gray900),
                decoration: InputDecoration(
                  hintText: placeholder,
                  hintStyle: GoogleFonts.inter(fontSize: 14, color: isDark ? AppColors.gray500 : AppColors.gray400),
                  filled: true,
                  fillColor: isDark ? AppColors.darkCard : AppColors.gray50,
                  prefixIcon: Icon(icon, size: 18, color: AppColors.gray400),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: isDark ? AppColors.darkBorder : AppColors.gray200, width: 1.5),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: isDark ? AppColors.darkBorder : AppColors.gray200, width: 1.5),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                  ),
                ),
              );
            },
            optionsViewBuilder: (context, onSelected, options) {
              return Align(
                alignment: Alignment.topLeft,
                child: Material(
                  elevation: 4,
                  borderRadius: BorderRadius.circular(12),
                  color: isDark ? AppColors.darkCard : AppColors.white,
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxHeight: 200, maxWidth: 350),
                    child: ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      shrinkWrap: true,
                      itemCount: options.length,
                      itemBuilder: (context, index) {
                        final option = options.elementAt(index);
                        return ListTile(
                          dense: true,
                          leading: Icon(icon, size: 16, color: AppColors.primary),
                          title: Text(option, style: GoogleFonts.inter(fontSize: 14, color: isDark ? AppColors.white : AppColors.gray800)),
                          onTap: () => onSelected(option),
                        );
                      },
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildField(
    String label,
    TextEditingController controller,
    String placeholder,
    bool isDark, {
    IconData? icon,
    bool multiline = false,
    TextInputType? keyboard,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isDark ? AppColors.gray300 : AppColors.gray700,
            ),
          ),
          const SizedBox(height: 6),
          TextFormField(
            controller: controller,
            onChanged: (_) => _markChanged(),
            maxLines: multiline ? 4 : 1,
            keyboardType: multiline ? TextInputType.multiline : keyboard,
            style: GoogleFonts.inter(
              fontSize: 15,
              color: isDark ? AppColors.white : AppColors.gray900,
            ),
            decoration: InputDecoration(
              hintText: placeholder,
              hintStyle: GoogleFonts.inter(fontSize: 14, color: isDark ? AppColors.gray500 : AppColors.gray400),
              filled: true,
              fillColor: isDark ? AppColors.darkCard : AppColors.gray50,
              prefixIcon: icon != null ? Icon(icon, size: 18, color: AppColors.gray400) : null,
              contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: multiline ? 14 : 0),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: isDark ? AppColors.darkBorder : AppColors.gray200, width: 1.5),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(color: isDark ? AppColors.darkBorder : AppColors.gray200, width: 1.5),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
