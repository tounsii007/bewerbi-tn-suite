import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

/// Thin HTTP client for the bewerbi.tn Java backend.
///
/// Features:
///  - Bearer-token injection
///  - Accept-Language header from the current [Locale]
///  - Proactive refresh 60 s before access token expiry
///  - On 401: single transparent retry after refreshing the token
///
/// Configure via --dart-define=API_BASE=https://api.bewerbi.tn or leave empty
/// for mock mode.
class ApiClient {
  ApiClient._();

  static final ApiClient instance = ApiClient._();

  static const String baseUrl =
      String.fromEnvironment('API_BASE', defaultValue: '');
  static bool get isApiMode => baseUrl.isNotEmpty;

  String? _accessToken;
  String? _refreshToken;
  DateTime? _accessExpiresAt;
  String _languageTag = 'de';

  Timer? _scheduledRefresh;
  Future<AuthTokens>? _ongoingRefresh;

  void Function()? _onUnauthorized;
  void Function(AuthTokens tokens)? _onTokensRefreshed;

  // ─── Configuration ────────────────────────────────────────────────

  void setLocale(String languageTag) => _languageTag = languageTag;
  void setUnauthorizedHandler(void Function() handler) =>
      _onUnauthorized = handler;
  void setTokensRefreshedHandler(void Function(AuthTokens tokens) h) =>
      _onTokensRefreshed = h;

  /// Called by the auth store after login / register / refresh.
  /// Passing `null` clears the tokens and stops the refresh timer.
  void setTokens(AuthTokens? tokens) {
    _scheduledRefresh?.cancel();
    _scheduledRefresh = null;
    if (tokens == null) {
      _accessToken = null;
      _refreshToken = null;
      _accessExpiresAt = null;
      return;
    }
    _accessToken = tokens.accessToken;
    _refreshToken = tokens.refreshToken;
    _accessExpiresAt = tokens.accessExpiresAt;
    _scheduleProactiveRefresh();
  }

  void _scheduleProactiveRefresh() {
    final expiresAt = _accessExpiresAt;
    if (expiresAt == null) return;
    final lead = const Duration(seconds: 60);
    var delay = expiresAt.difference(DateTime.now()) - lead;
    if (delay < const Duration(seconds: 5)) delay = const Duration(seconds: 5);
    _scheduledRefresh = Timer(delay, () => _refreshSilently());
  }

  Future<void> _refreshSilently() async {
    try {
      await _refreshAccessToken();
    } catch (_) {
      _onUnauthorized?.call();
    }
  }

  Future<AuthTokens> _refreshAccessToken() {
    if (_refreshToken == null) {
      return Future.error(
          ApiException(401, 'UNAUTHORIZED', 'No refresh token'));
    }
    // Coalesce concurrent refresh attempts
    final inFlight = _ongoingRefresh;
    if (inFlight != null) return inFlight;

    final future = () async {
      try {
        final body = jsonEncode({'refreshToken': _refreshToken});
        final uri = Uri.parse('$baseUrl/api/v1/auth/refresh');
        final response = await http.post(
          uri,
          headers: {'Content-Type': 'application/json'},
          body: body,
        );
        if (response.statusCode != 200) {
          throw ApiException(response.statusCode, 'REFRESH_FAILED',
              'Refresh token rejected');
        }
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final tokens = AuthTokens.fromJson(data);
        setTokens(tokens);
        _onTokensRefreshed?.call(tokens);
        return tokens;
      } finally {
        _ongoingRefresh = null;
      }
    }();

    _ongoingRefresh = future;
    return future;
  }

  // ─── Public API ───────────────────────────────────────────────────

  Future<dynamic> get(String path) => _send('GET', path);
  Future<dynamic> post(String path, {Object? body}) =>
      _send('POST', path, body: body);
  Future<dynamic> put(String path, {Object? body}) =>
      _send('PUT', path, body: body);
  Future<dynamic> patch(String path, {Object? body}) =>
      _send('PATCH', path, body: body);
  Future<dynamic> delete(String path) => _send('DELETE', path);

  Future<dynamic> uploadFile(String path, File file, String fieldName,
      Map<String, String> fields) async {
    Future<http.Response> send() async {
      final uri = Uri.parse('$baseUrl$path');
      final request = http.MultipartRequest('POST', uri)
        ..fields.addAll(fields)
        ..files.add(await http.MultipartFile.fromPath(fieldName, file.path));
      _applyAuthHeaders(request.headers);
      final streamed = await request.send();
      return http.Response.fromStream(streamed);
    }

    final response = await send();
    if (response.statusCode == 401 && _refreshToken != null) {
      try {
        await _refreshAccessToken();
        return _handleResponse(await send());
      } catch (_) {
        _onUnauthorized?.call();
      }
    }
    return _handleResponse(response);
  }

  // ─── Internals ────────────────────────────────────────────────────

  Future<dynamic> _send(String method, String path, {Object? body}) async {
    Future<http.Response> issue() async {
      final uri = Uri.parse('$baseUrl$path');
      final headers = <String, String>{'Content-Type': 'application/json'};
      _applyAuthHeaders(headers);
      final request = http.Request(method, uri)..headers.addAll(headers);
      if (body != null) request.body = jsonEncode(body);
      final streamed = await http.Client().send(request);
      return http.Response.fromStream(streamed);
    }

    var response = await issue();
    if (response.statusCode == 401 && _refreshToken != null) {
      try {
        await _refreshAccessToken();
        response = await issue();
      } catch (_) {
        _onUnauthorized?.call();
      }
    }
    return _handleResponse(response);
  }

  void _applyAuthHeaders(Map<String, String> headers) {
    if (_accessToken != null) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }
    headers['Accept-Language'] = _languageTag;
  }

  dynamic _handleResponse(http.Response response) {
    if (response.statusCode == 401) {
      _onUnauthorized?.call();
      throw ApiException(401, 'UNAUTHORIZED', 'Not authenticated');
    }
    if (response.statusCode >= 400) {
      try {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        throw ApiException(
          response.statusCode,
          data['code'] as String? ?? 'UNKNOWN',
          data['message'] as String? ?? response.reasonPhrase ?? 'Error',
          messageKey: data['messageKey'] as String?,
        );
      } catch (e) {
        if (e is ApiException) rethrow;
        throw ApiException(response.statusCode, 'UNKNOWN',
            response.reasonPhrase ?? 'Error');
      }
    }
    if (response.body.isEmpty) return null;
    return jsonDecode(response.body);
  }
}

/// Response of auth endpoints — parsed into strong-typed token holder.
class AuthTokens {
  final String accessToken;
  final DateTime accessExpiresAt;
  final String refreshToken;
  final DateTime refreshExpiresAt;

  AuthTokens({
    required this.accessToken,
    required this.accessExpiresAt,
    required this.refreshToken,
    required this.refreshExpiresAt,
  });

  factory AuthTokens.fromJson(Map<String, dynamic> json) => AuthTokens(
        accessToken: json['accessToken'] as String,
        accessExpiresAt:
            DateTime.parse(json['accessTokenExpiresAt'] as String),
        refreshToken: json['refreshToken'] as String,
        refreshExpiresAt:
            DateTime.parse(json['refreshTokenExpiresAt'] as String),
      );
}

class ApiException implements Exception {
  final int status;
  final String code;
  final String message;
  final String? messageKey;

  ApiException(this.status, this.code, this.message, {this.messageKey});

  @override
  String toString() => '$code ($status): $message';
}
