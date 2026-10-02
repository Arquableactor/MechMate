import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mechmate_api/mechmate_api.dart';

import 'auth/auth_service.dart';
import 'auth/session.dart';
import 'config.dart';

/// HTTP de la app. Timeouts holgados: el plan gratuito de Render "duerme" la
/// API y el primer request puede tardar ~50 s en despertarla.
Dio buildApiDio(Ref ref, {String baseUrl = AppConfig.apiBaseUrl}) => Dio(
  BaseOptions(
    baseUrl: baseUrl,
    connectTimeout: const Duration(seconds: 20),
    receiveTimeout: const Duration(seconds: 60),
  ),
)..interceptors.add(AuthInterceptor(ref));

final dioProvider = Provider<Dio>(buildApiDio);

/// Cliente GENERADO desde el OpenAPI (packages/mechmate_api). Los interceptores
/// genéricos de auth del generador no se usan: el token lo pone [AuthInterceptor].
final apiProvider = Provider<MechmateApi>((ref) => MechmateApi(dio: ref.watch(dioProvider), interceptors: const []));

/// Pone `Authorization: Bearer <token>` en cada request y, si la API responde
/// 401 con la sesión abierta, la cierra con aviso ("Tu sesión expiró").
class AuthInterceptor extends Interceptor {
  AuthInterceptor(this._ref);

  final Ref _ref;

  @override
  Future<void> onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _ref.read(authServiceProvider).accessToken();
    if (token != null) options.headers['Authorization'] = 'Bearer $token';
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.response?.statusCode == 401) _ref.read(sessionProvider.notifier).expire();
    handler.next(err);
  }
}
