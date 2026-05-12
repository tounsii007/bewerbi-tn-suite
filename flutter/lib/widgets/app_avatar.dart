import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';

enum AvatarSize { sm, md, lg, xl }

class AppAvatar extends StatelessWidget {
  final String? imageUrl;
  final String name;
  final AvatarSize size;
  final VoidCallback? onTap;
  final bool showBorder;

  const AppAvatar({
    super.key,
    this.imageUrl,
    required this.name,
    this.size = AvatarSize.md,
    this.onTap,
    this.showBorder = false,
  });

  static const List<Color> _avatarColors = [
    AppColors.primary,
    AppColors.accentViolet,
    AppColors.success,
    AppColors.warningAccent,
    AppColors.error,
    AppColors.info,
    AppColors.accentPink,
  ];

  double get _diameter {
    switch (size) {
      case AvatarSize.sm:
        return 40;
      case AvatarSize.md:
        return 56;
      case AvatarSize.lg:
        return 80;
      case AvatarSize.xl:
        return 112;
    }
  }

  double get _fontSize {
    switch (size) {
      case AvatarSize.sm:
        return 14;
      case AvatarSize.md:
        return 18;
      case AvatarSize.lg:
        return 28;
      case AvatarSize.xl:
        return 40;
    }
  }

  String get _initials {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts.first.isEmpty) return '?';
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
  }

  Color get _color {
    int hash = 0;
    for (int i = 0; i < name.length; i++) {
      hash = name.codeUnitAt(i) + ((hash << 5) - hash);
    }
    return _avatarColors[hash.abs() % _avatarColors.length];
  }

  @override
  Widget build(BuildContext context) {
    final diameter = _diameter;
    final color = _color;

    Widget avatar;

    if (imageUrl != null && imageUrl!.isNotEmpty) {
      avatar = CachedNetworkImage(
        imageUrl: imageUrl!,
        imageBuilder: (context, imageProvider) => Container(
          width: diameter,
          height: diameter,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            image: DecorationImage(image: imageProvider, fit: BoxFit.cover),
          ),
        ),
        placeholder: (context, url) => _buildInitialsAvatar(diameter, color),
        errorWidget: (context, url, error) =>
            _buildInitialsAvatar(diameter, color),
      );
    } else {
      avatar = _buildInitialsAvatar(diameter, color);
    }

    if (showBorder) {
      avatar = Container(
        padding: const EdgeInsets.all(3),
        decoration: const BoxDecoration(
          shape: BoxShape.circle,
          color: AppColors.white,
        ),
        child: avatar,
      );
    }

    if (onTap != null) {
      avatar = GestureDetector(onTap: onTap, child: avatar);
    }

    return avatar;
  }

  Widget _buildInitialsAvatar(double diameter, Color color) {
    return Container(
      width: diameter,
      height: diameter,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color.withValues(alpha: 0.1),
      ),
      alignment: Alignment.center,
      child: Text(
        _initials,
        style: GoogleFonts.inter(
          fontSize: _fontSize,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}
