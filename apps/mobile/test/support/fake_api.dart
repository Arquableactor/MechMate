import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:mechmate_api/mechmate_api.dart';

/// Respuesta enlatada para una ruta (`GET /v1/health`).
typedef FakeRoute = ({int status, Object? body});

/// Adaptador HTTP falso: el cliente GENERADO hace su trabajo real (armar la
/// ruta, deserializar el JSON del contrato) y solo la red es simulada.
class FakeHttpAdapter implements HttpClientAdapter {
  FakeHttpAdapter(this.routes);

  /// `'GET /v1/health'` → respuesta. Mutable para simular cambios (reintentos).
  final Map<String, FakeRoute> routes;
  final List<RequestOptions> requests = [];

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    requests.add(options);
    final route = routes['${options.method} ${options.path}'];
    if (route == null) {
      return ResponseBody.fromString('{"message":"no simulada"}', 404, headers: _json);
    }
    return ResponseBody.fromString(jsonEncode(route.body), route.status, headers: _json);
  }

  static const _json = {
    Headers.contentTypeHeader: [Headers.jsonContentType],
  };

  @override
  void close({bool force = false}) {}
}

MechmateApi fakeApi(FakeHttpAdapter adapter) {
  final dio = Dio(BaseOptions(baseUrl: 'https://api.test'))..httpClientAdapter = adapter;
  return MechmateApi(dio: dio, interceptors: const []);
}
