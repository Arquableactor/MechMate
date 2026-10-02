import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mechmate/app.dart';
import 'package:mechmate/core/api.dart';
import 'package:mechmate/core/auth/auth_service.dart';

import 'fake_api.dart';

/// Auth0 simulado: sin navegador ni red; registra qué pidió la app.
class FakeAuthService implements AuthService {
  FakeAuthService({this.signedIn = false});

  bool signedIn;
  String token = 'token-de-prueba';
  final List<bool> logins = [];
  int logouts = 0;

  @override
  Future<bool> restore() async => signedIn;

  @override
  Future<void> login({bool signup = false}) async {
    logins.add(signup);
    signedIn = true;
  }

  @override
  Future<void> logout() async {
    logouts++;
    signedIn = false;
  }

  @override
  Future<String?> accessToken() async => signedIn ? token : null;
}

const meAna = {
  'id': '01920000-0000-7000-8000-000000000001',
  'auth0_sub': 'auth0|ana',
  'email': 'ana@taller.do',
  'phone': null,
  'full_name': 'Ana Rosario',
  'status': 'active',
  'kyc_status': 'none',
  'roles': ['mechanic'],
  'created_at': '2026-09-30T12:00:00.000Z',
};

Map<String, Object?> shopJson(String name) => {
  'id': '01920000-0000-7000-8000-0000000000aa',
  'name': name,
  'type': 'mechanic_shop',
  'commission_bps': 800,
  'my_role': 'owner',
  'created_at': '2026-09-30T12:00:00.000Z',
};

const healthy = {'status': 'ok', 'uptime': 12.5, 'timestamp': '2026-09-30T12:00:00.000Z', 'db': 'up', 'redis': 'up'};

/// Rutas de una cuenta con sesión y un taller.
Map<String, FakeRoute> signedInRoutes({List<Object?>? shops}) => {
  'GET /v1/health': (status: 200, body: healthy),
  'GET /v1/me': (status: 200, body: meAna),
  'GET /v1/shops/mine': (status: 200, body: shops ?? [shopJson('Taller Hermanos Pérez')]),
};

/// Monta la app real (router, sesión, interceptor, cliente generado) con
/// Auth0 y la red simulados.
Future<({FakeHttpAdapter http, FakeAuthService auth})> pumpMechMate(
  WidgetTester tester, {
  Size size = const Size(390, 844),
  FakeAuthService? auth,
  Map<String, FakeRoute>? routes,
}) async {
  tester.view
    ..physicalSize = size * 3
    ..devicePixelRatio = 3;
  addTearDown(tester.view.reset);
  final adapter = FakeHttpAdapter(routes ?? signedInRoutes());
  final fakeAuth = auth ?? FakeAuthService(signedIn: true);
  await tester.pumpWidget(
    ProviderScope(
      retry: (_, _) => null,
      overrides: [
        authServiceProvider.overrideWithValue(fakeAuth),
        dioProvider.overrideWith((ref) => buildApiDio(ref, baseUrl: 'https://api.test')..httpClientAdapter = adapter),
      ],
      child: const MechMateApp(),
    ),
  );
  await tester.pumpAndSettle();
  return (http: adapter, auth: fakeAuth);
}
