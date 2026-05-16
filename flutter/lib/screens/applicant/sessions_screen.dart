import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/services/api_client.dart';

class _Session {
  _Session({
    required this.tokenHash,
    required this.createdAt,
    required this.lastUsedAt,
    required this.userAgent,
    required this.expiresInSeconds,
  });

  factory _Session.fromJson(Map<String, dynamic> json) => _Session(
        tokenHash: json['tokenHash'] as String,
        createdAt: (json['createdAt'] as num?)?.toInt() ?? 0,
        lastUsedAt: (json['lastUsedAt'] as num?)?.toInt() ?? 0,
        userAgent: (json['userAgent'] as String?) ?? '',
        expiresInSeconds: (json['expiresInSeconds'] as num?)?.toInt() ?? -1,
      );

  final String tokenHash;
  final int createdAt;
  final int lastUsedAt;
  final String userAgent;
  final int expiresInSeconds;
}

IconData _deviceIcon(String ua) {
  final lc = ua.toLowerCase();
  if (lc.contains('android') || lc.contains('iphone') || lc.contains('mobile')) {
    return LucideIcons.smartphone;
  }
  if (lc.contains('windows') || lc.contains('mac') || lc.contains('linux')) {
    return LucideIcons.monitor;
  }
  return LucideIcons.globe;
}

String _deviceLabel(String ua) {
  if (ua.isEmpty) return 'Unbekanntes Gerät';
  final browser = ua.contains('Edg/')
      ? 'Edge'
      : ua.contains('Chrome/')
          ? 'Chrome'
          : ua.contains('Firefox/')
              ? 'Firefox'
              : ua.contains('Safari/')
                  ? 'Safari'
                  : 'App';
  final os = ua.contains('Android')
      ? 'Android'
      : RegExp(r'iPhone|iPad|iOS').hasMatch(ua)
          ? 'iOS'
          : ua.contains('Windows')
              ? 'Windows'
              : ua.contains('Mac OS')
                  ? 'macOS'
                  : ua.contains('Linux')
                      ? 'Linux'
                      : '';
  return os.isEmpty ? browser : '$browser · $os';
}

String _formatCreatedAt(int epochSec) {
  if (epochSec == 0) return '—';
  return DateTime.fromMillisecondsSinceEpoch(epochSec * 1000).toLocal().toString();
}

/// Lists every active refresh-token session of the current user. Each row
/// has a Beenden button that revokes that single session — separate from
/// the existing "auf allen Geräten abmelden" sledgehammer in /account.
class SessionsScreen extends ConsumerStatefulWidget {
  const SessionsScreen({super.key});

  @override
  ConsumerState<SessionsScreen> createState() => _SessionsScreenState();
}

class _SessionsScreenState extends ConsumerState<SessionsScreen> {
  List<_Session>? _items;
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _refresh();
  }

  Future<void> _refresh() async {
    if (!ApiClient.isApiMode) {
      setState(() {
        _items = [];
        _loading = false;
      });
      return;
    }
    setState(() => _loading = true);
    try {
      final raw = await ApiClient.instance.get('/api/v1/auth/me/sessions') as List<dynamic>;
      final list = raw
          .map((e) => _Session.fromJson(e as Map<String, dynamic>))
          .toList(growable: false);
      if (!mounted) return;
      setState(() {
        _items = list;
        _loading = false;
        _error = null;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e.message;
      });
    }
  }

  Future<void> _revoke(_Session s) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sitzung beenden'),
        content: Text('${_deviceLabel(s.userAgent)} wird abgemeldet.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Abbrechen'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Beenden'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    try {
      await ApiClient.instance.delete('/api/v1/auth/me/sessions/${Uri.encodeComponent(s.tokenHash)}');
      if (!mounted) return;
      setState(() => _items = _items?.where((x) => x.tokenHash != s.tokenHash).toList());
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.message)));
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
        title: const Text('Aktive Sitzungen'),
      ),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _error != null
                  ? _buildError(isDark)
                  : _items == null || _items!.isEmpty
                      ? _buildEmpty(isDark)
                      : ListView.separated(
                          padding: const EdgeInsets.all(20),
                          itemCount: _items!.length,
                          separatorBuilder: (_, _) => const SizedBox(height: 10),
                          itemBuilder: (_, i) => _buildTile(_items![i], isDark),
                        ),
        ),
      ),
    );
  }

  Widget _buildTile(_Session s, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.gray200,
        ),
      ),
      child: Row(
        children: [
          Icon(
            _deviceIcon(s.userAgent),
            size: 20,
            color: isDark ? AppColors.gray400 : AppColors.gray500,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _deviceLabel(s.userAgent),
                  style: GoogleFonts.inter(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.white : AppColors.gray900,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  'Zuletzt aktiv ${_formatCreatedAt(s.lastUsedAt == 0 ? s.createdAt : s.lastUsedAt)}',
                  style: GoogleFonts.inter(fontSize: 12, color: AppColors.gray500),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(LucideIcons.x, color: AppColors.error),
            onPressed: () => _revoke(s),
            tooltip: 'Sitzung beenden',
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty(bool isDark) => ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          const SizedBox(height: 120),
          Center(
            child: Text(
              'Keine aktiven Sitzungen.',
              style: GoogleFonts.inter(
                fontSize: 14,
                color: isDark ? AppColors.gray400 : AppColors.gray500,
              ),
            ),
          ),
        ],
      );

  Widget _buildError(bool isDark) => ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        children: [
          const SizedBox(height: 120),
          Center(
            child: Text(
              _error ?? 'Konnte Sitzungen nicht laden.',
              style: GoogleFonts.inter(fontSize: 14, color: AppColors.error),
            ),
          ),
        ],
      );
}
