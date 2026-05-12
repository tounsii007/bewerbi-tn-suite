import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'package:bewerbi_tn_flutter/app/theme.dart';
import 'package:bewerbi_tn_flutter/models/document.dart';
import 'package:bewerbi_tn_flutter/providers/auth_provider.dart';
import 'package:bewerbi_tn_flutter/services/mock_data.dart';
import 'package:bewerbi_tn_flutter/widgets/app_badge.dart';
import 'package:bewerbi_tn_flutter/widgets/app_card.dart';
import 'package:bewerbi_tn_flutter/widgets/app_input.dart';

class DocumentsScreen extends ConsumerStatefulWidget {
  const DocumentsScreen({super.key});

  @override
  ConsumerState<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends ConsumerState<DocumentsScreen> {
  late List<Document> _entries;
  final Set<String> _deletedIds = {};
  bool _initialized = false;

  static const Map<DocumentType, String> _typeLabels = {
    DocumentType.cv: 'CV',
    DocumentType.diploma: 'Diplom',
    DocumentType.certificate: 'Zertifikat',
    DocumentType.other: 'Zeugnis',
  };

  IconData _iconForType(DocumentType type) {
    switch (type) {
      case DocumentType.cv:
        return LucideIcons.fileText;
      case DocumentType.diploma:
        return LucideIcons.graduationCap;
      case DocumentType.certificate:
        return LucideIcons.award;
      case DocumentType.other:
        return LucideIcons.file;
    }
  }

  BadgeVariant _badgeForType(DocumentType type) {
    switch (type) {
      case DocumentType.cv:
        return BadgeVariant.info;
      case DocumentType.diploma:
        return BadgeVariant.success;
      case DocumentType.certificate:
        return BadgeVariant.warning;
      case DocumentType.other:
        return BadgeVariant.defaultVariant;
    }
  }

  String _formatFileSize(int? bytes) {
    if (bytes == null) return '';
    if (bytes < 1000) return '$bytes B';
    if (bytes < 1000000) return '${(bytes / 1000).toStringAsFixed(0)} KB';
    return '${(bytes / 1000000).toStringAsFixed(1)} MB';
  }

  String _formatDate(DateTime date) {
    return DateFormat('dd.MM.yyyy', 'de_DE').format(date);
  }

  void _initEntries() {
    if (_initialized) return;
    final userId = ref.read(authProvider).profile?.userId;
    if (userId == null) return;
    _entries = mockDocuments.where((e) => e.userId == userId).toList();
    _initialized = true;
  }

  void _softDelete(String docId) {
    setState(() => _deletedIds.add(docId));
  }

  void _restore(String docId) {
    setState(() => _deletedIds.remove(docId));
  }

  void _permanentDelete(Document doc) {
    showDialog(
      context: context,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        return AlertDialog(
          backgroundColor: isDark ? AppColors.darkCard : AppColors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text(
            'Endg\u00fcltig l\u00f6schen?',
            style: GoogleFonts.inter(
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.white : AppColors.gray900,
            ),
          ),
          content: Text(
            '"${doc.name}" wird unwiderruflich gel\u00f6scht.',
            style: GoogleFonts.inter(
              fontSize: 14,
              color: isDark ? AppColors.gray300 : AppColors.gray600,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: Text('Abbrechen', style: GoogleFonts.inter(color: AppColors.gray500)),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                setState(() {
                  _deletedIds.remove(doc.id);
                  _entries.removeWhere((e) => e.id == doc.id);
                  mockDocuments.removeWhere((e) => e.id == doc.id);
                });
              },
              child: Text('L\u00f6schen', style: GoogleFonts.inter(color: AppColors.error, fontWeight: FontWeight.w600)),
            ),
          ],
        );
      },
    );
  }

  void _showAddSheet() {
    String docName = '';
    DocumentType selectedType = DocumentType.cv;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        final isDark = Theme.of(ctx).brightness == Brightness.dark;
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            return Container(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(ctx).viewInsets.bottom,
              ),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkCard : AppColors.white,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(24),
                ),
              ),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                      child: Container(
                        width: 40,
                        height: 4,
                        decoration: BoxDecoration(
                          color: AppColors.gray300,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Dokument hinzuf\u00fcgen',
                      style: GoogleFonts.inter(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: isDark ? AppColors.white : AppColors.gray900,
                      ),
                    ),
                    const SizedBox(height: 20),
                    AppInput(
                      label: 'Dokumentname',
                      value: docName,
                      onChanged: (v) => setSheetState(() => docName = v),
                      placeholder: 'z.B. Lebenslauf_2024.pdf',
                      prefixIcon: const Icon(LucideIcons.fileText, size: 18),
                    ),
                    const SizedBox(height: 16),

                    // Type selector
                    Text(
                      'Dokumenttyp',
                      style: GoogleFonts.inter(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: isDark ? AppColors.gray300 : AppColors.gray700,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: _typeLabels.entries.map((entry) {
                        final isSelected = entry.key == selectedType;
                        return GestureDetector(
                          onTap: () => setSheetState(
                            () => selectedType = entry.key,
                          ),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 10,
                            ),
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? AppColors.primary
                                  : (isDark
                                      ? AppColors.darkSurface
                                      : AppColors.gray100),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: isSelected
                                    ? AppColors.primary
                                    : (isDark
                                        ? AppColors.darkBorder
                                        : AppColors.gray200),
                                width: 1.5,
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  _iconForType(entry.key),
                                  size: 16,
                                  color: isSelected
                                      ? AppColors.white
                                      : (isDark
                                          ? AppColors.gray300
                                          : AppColors.gray600),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  entry.value,
                                  style: GoogleFonts.inter(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: isSelected
                                        ? AppColors.white
                                        : (isDark
                                            ? AppColors.gray300
                                            : AppColors.gray600),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton.icon(
                        onPressed: () {
                          if (docName.isEmpty) return;

                          final userId =
                              ref.read(authProvider).profile?.userId ?? '';
                          final entry = Document(
                            id: 'doc-${DateTime.now().millisecondsSinceEpoch}',
                            userId: userId,
                            name: docName,
                            type: selectedType,
                            fileUrl: '',
                            fileSize: 250000,
                            uploadedAt: DateTime.now(),
                          );

                          setState(() {
                            _entries.add(entry);
                            mockDocuments.add(entry);
                          });

                          Navigator.of(ctx).pop();

                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(
                                'Dokument hinzugef\u00fcgt (Demo-Modus)',
                                style: GoogleFonts.inter(),
                              ),
                              behavior: SnackBarBehavior.floating,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          );
                        },
                        icon: const Icon(LucideIcons.upload, size: 18),
                        label: Text(
                          'Hinzuf\u00fcgen',
                          style: GoogleFonts.inter(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    _initEntries();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final activeEntries = _entries.where((e) => !_deletedIds.contains(e.id)).toList();
    final deletedEntries = _entries.where((e) => _deletedIds.contains(e.id)).toList();

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(LucideIcons.arrowLeft),
          onPressed: () => context.pop(),
        ),
        title: const Text('Dokumente'),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddSheet,
        backgroundColor: AppColors.primary,
        child: const Icon(LucideIcons.plus, color: AppColors.white),
      ),
      body: _entries.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    LucideIcons.folderOpen,
                    size: 48,
                    color: isDark ? AppColors.gray600 : AppColors.gray300,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Noch keine Dokumente',
                    style: GoogleFonts.inter(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.gray400 : AppColors.gray500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Tippe auf +, um ein Dokument hinzuzuf\u00fcgen',
                    style: GoogleFonts.inter(
                      fontSize: 13,
                      color: AppColors.gray400,
                    ),
                  ),
                ],
              ),
            )
          : ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
              children: [
                // Active documents
                ...activeEntries.map((doc) => Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: _buildDocCard(doc, isDark, isDeleted: false),
                    )),

                // Deleted documents section
                if (deletedEntries.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: Divider(color: isDark ? AppColors.darkBorder : AppColors.gray200),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text(
                          'Gel\u00f6schte Dokumente',
                          style: GoogleFonts.inter(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppColors.gray500,
                          ),
                        ),
                      ),
                      Expanded(
                        child: Divider(color: isDark ? AppColors.darkBorder : AppColors.gray200),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ...deletedEntries.map((doc) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _buildDocCard(doc, isDark, isDeleted: true),
                      )),
                ],
              ],
            ),
    );
  }

  Widget _buildDocCard(Document doc, bool isDark, {required bool isDeleted}) {
    final fileIcon = _iconForType(doc.type);
    final badgeVariant = _badgeForType(doc.type);
    final typeLabel = _typeLabels[doc.type] ?? 'Sonstiges';

    Widget card = AppCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              fileIcon,
              size: 22,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  doc.name,
                  style: GoogleFonts.inter(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppColors.white : AppColors.gray900,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    AppBadge(
                      label: typeLabel,
                      variant: badgeVariant,
                    ),
                    if (isDeleted) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.error.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          'GEL\u00d6SCHT',
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: AppColors.error,
                          ),
                        ),
                      ),
                    ],
                    if (doc.fileSize != null) ...[
                      const SizedBox(width: 8),
                      Text(
                        _formatFileSize(doc.fileSize),
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: AppColors.gray400,
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(
                      LucideIcons.calendar,
                      size: 12,
                      color: AppColors.gray400,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      _formatDate(doc.uploadedAt),
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        color: AppColors.gray400,
                      ),
                    ),
                  ],
                ),
                // Action buttons for deleted docs
                if (isDeleted) ...[
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      OutlinedButton.icon(
                        onPressed: () => _restore(doc.id),
                        icon: const Icon(LucideIcons.rotateCcw, size: 14),
                        label: Text(
                          'Wiederherstellen',
                          style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.success,
                          side: const BorderSide(color: AppColors.success),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          minimumSize: Size.zero,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      TextButton.icon(
                        onPressed: () => _permanentDelete(doc),
                        icon: const Icon(LucideIcons.trash2, size: 14),
                        label: Text(
                          'Endg\u00fcltig l\u00f6schen',
                          style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                        style: TextButton.styleFrom(
                          foregroundColor: AppColors.error,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          minimumSize: Size.zero,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          if (!isDeleted)
            IconButton(
              icon: Icon(
                LucideIcons.trash2,
                size: 18,
                color: AppColors.error.withValues(alpha: 0.7),
              ),
              onPressed: () => _softDelete(doc.id),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
        ],
      ),
    );

    if (isDeleted) {
      card = Opacity(opacity: 0.5, child: card);
    }

    return card;
  }
}
