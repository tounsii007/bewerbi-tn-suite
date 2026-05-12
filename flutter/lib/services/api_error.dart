/// Mirrors the canonical ApiError envelope from shared/schemas/api-error.schema.json. Decoded
/// once at the http boundary so feature code never sniffs status codes — switch on [code] and
/// look up [messageKey] in i18n.
class ApiError implements Exception {
  final int status;
  final String code;
  final String message;
  final String messageKey;
  final List<ApiFieldViolation> violations;
  final String? path;
  final String? traceId;
  final DateTime? timestamp;

  const ApiError({
    required this.status,
    required this.code,
    required this.message,
    required this.messageKey,
    this.violations = const [],
    this.path,
    this.traceId,
    this.timestamp,
  });

  factory ApiError.fromJson(Map<String, dynamic> json) => ApiError(
        status: json['status'] as int? ?? 0,
        code: json['code'] as String? ?? 'UNKNOWN',
        message: json['message'] as String? ?? '',
        messageKey: json['messageKey'] as String? ?? 'error.internal',
        violations: ((json['violations'] as List?) ?? const [])
            .map((v) => ApiFieldViolation.fromJson(v as Map<String, dynamic>))
            .toList(growable: false),
        path: json['path'] as String?,
        traceId: json['traceId'] as String?,
        timestamp: json['timestamp'] != null
            ? DateTime.tryParse(json['timestamp'] as String)
            : null,
      );

  /// Convenience getter — true for any 5xx where retry is plausibly useful.
  bool get isTransient => status >= 500 && status < 600;

  /// Lock-out / rate-limit responses carry a Retry-After header but the body alone is enough
  /// to know not to retry immediately.
  bool get isRateLimited => status == 429;

  @override
  String toString() =>
      'ApiError(status=$status, code=$code, key=$messageKey, trace=$traceId)';
}

class ApiFieldViolation {
  final String field;
  final String message;
  final String messageKey;

  const ApiFieldViolation({
    required this.field,
    required this.message,
    required this.messageKey,
  });

  factory ApiFieldViolation.fromJson(Map<String, dynamic> json) => ApiFieldViolation(
        field: json['field'] as String? ?? '',
        message: json['message'] as String? ?? '',
        messageKey: json['messageKey'] as String? ?? '',
      );
}
