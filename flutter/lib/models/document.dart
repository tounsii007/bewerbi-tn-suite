enum DocumentType { cv, diploma, certificate, other }

class Document {
  final String id;
  final String userId;
  final String name;
  final DocumentType type;
  final String fileUrl;
  final int? fileSize;
  final DateTime uploadedAt;

  const Document({
    required this.id,
    required this.userId,
    required this.name,
    required this.type,
    this.fileUrl = '',
    this.fileSize,
    required this.uploadedAt,
  });

  Document copyWith({
    String? id,
    String? userId,
    String? name,
    DocumentType? type,
    String? fileUrl,
    int? fileSize,
    DateTime? uploadedAt,
  }) {
    return Document(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      name: name ?? this.name,
      type: type ?? this.type,
      fileUrl: fileUrl ?? this.fileUrl,
      fileSize: fileSize ?? this.fileSize,
      uploadedAt: uploadedAt ?? this.uploadedAt,
    );
  }
}
