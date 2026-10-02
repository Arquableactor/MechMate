import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mechmate/features/onboarding/create_shop_screen.dart';

import '../../support/app_harness.dart';

void main() {
  group('sin sesión', () {
    testWidgets('bienvenida → "Iniciar sesión" → Auth0 → inicio con nombre y taller; la API recibe el token', (
      tester,
    ) async {
      final app = await pumpMechMate(tester, auth: FakeAuthService());

      expect(find.text('Tu taller, en orden.'), findsOneWidget);
      expect(app.http.requests.where((r) => r.path == '/v1/me'), isEmpty); // nada de API sin sesión

      await tester.tap(find.text('Iniciar sesión'));
      await tester.pumpAndSettle();

      expect(app.auth.logins, [false]);
      expect(find.text('Hola, Ana'), findsOneWidget);
      expect(find.text('Taller Hermanos Pérez'), findsOneWidget);
      final me = app.http.requests.firstWhere((r) => r.path == '/v1/me');
      expect(me.headers['Authorization'], 'Bearer token-de-prueba');
    });

    testWidgets('"Crear una cuenta" abre Auth0 directo en el registro', (tester) async {
      final app = await pumpMechMate(tester, auth: FakeAuthService());
      await tester.tap(find.text('Crear una cuenta'));
      await tester.pumpAndSettle();
      expect(app.auth.logins, [true]);
    });
  });

  group('primer ingreso (sin taller)', () {
    testWidgets('crea el taller con el nombre limpio y entra al inicio', (tester) async {
      final routes = signedInRoutes(shops: []);
      routes['POST /v1/shops'] = (status: 201, body: shopJson('Taller Hermanos Pérez'));
      final app = await pumpMechMate(tester, routes: routes);

      expect(find.text('Ana, crea tu taller'), findsOneWidget);
      await tester.enterText(find.byType(TextField), '  Taller Hermanos Pérez  ');
      await tester.pump();
      await tester.tap(find.text('Crear taller'));
      await tester.pumpAndSettle();

      final post = app.http.requests.singleWhere((r) => r.method == 'POST' && r.path == '/v1/shops');
      // El nombre llega limpio (sin espacios) y sin `type`: la API usa mechanic_shop por defecto.
      expect(jsonDecode(post.data as String), {'name': 'Taller Hermanos Pérez'});
      expect(find.text('Hola, Ana'), findsOneWidget);
      expect(find.text('Taller Hermanos Pérez'), findsOneWidget);
    });

    testWidgets('"Crear taller" deshabilitado hasta tener un nombre válido', (tester) async {
      final app = await pumpMechMate(tester, routes: signedInRoutes(shops: []));

      await tester.tap(find.text('Crear taller'), warnIfMissed: false);
      await tester.enterText(find.byType(TextField), 'A');
      await tester.pump();
      await tester.tap(find.text('Crear taller'), warnIfMissed: false);
      await tester.pumpAndSettle();
      expect(app.http.requests.where((r) => r.method == 'POST'), isEmpty);
    });

    testWidgets('si la API falla, explica qué pasó y se queda en el formulario', (tester) async {
      final routes = signedInRoutes(shops: []);
      routes['POST /v1/shops'] = (status: 500, body: {'message': 'x'});
      await pumpMechMate(tester, routes: routes);

      await tester.enterText(find.byType(TextField), 'Taller Pérez');
      await tester.pump();
      await tester.tap(find.text('Crear taller'));
      await tester.pumpAndSettle();

      expect(find.text('No pudimos crear el taller. Revisa tu conexión e inténtalo de nuevo.'), findsOneWidget);
      expect(find.text('Ana, crea tu taller'), findsOneWidget);
    });

    test('validación igual a la API: 2–120 caracteres, sin contar espacios sobrantes', () {
      const validate = validateShopName;
      expect(validate('  a  '), isNotNull);
      expect(validate('AB'), isNull);
      expect(validate('x' * 120), isNull);
      expect(validate('x' * 121), isNotNull);
    });
  });

  group('con sesión', () {
    testWidgets('va directo al inicio (sin pasar por bienvenida ni onboarding)', (tester) async {
      final app = await pumpMechMate(tester);
      expect(find.text('Hola, Ana'), findsOneWidget);
      expect(app.http.requests.where((r) => r.method == 'POST'), isEmpty);
    });

    testWidgets('cerrar sesión desde el avatar (hoja de acciones) → bienvenida', (tester) async {
      final app = await pumpMechMate(tester);

      await tester.tap(find.bySemanticsLabel('Tu cuenta'));
      await tester.pumpAndSettle();
      expect(find.text('ana@taller.do'), findsOneWidget);
      await tester.tap(find.text('Cerrar sesión'));
      await tester.pumpAndSettle();

      expect(app.auth.logouts, 1);
      expect(find.text('Tu taller, en orden.'), findsOneWidget);
    });

    testWidgets('token vencido al abrir (401 en /v1/me) → bienvenida con aviso', (tester) async {
      final routes = signedInRoutes()..['GET /v1/me'] = (status: 401, body: {'message': 'x'});
      await pumpMechMate(tester, routes: routes);

      expect(find.text('Tu sesión expiró. Inicia sesión de nuevo.'), findsOneWidget);
      expect(find.text('Iniciar sesión'), findsOneWidget);
    });

    testWidgets('401 de la API con la sesión abierta → se cierra con aviso', (tester) async {
      final routes = signedInRoutes()..['GET /v1/health'] = (status: 401, body: {'message': 'x'});
      await pumpMechMate(tester, routes: routes);

      expect(find.text('Tu sesión expiró. Inicia sesión de nuevo.'), findsOneWidget);
    });

    testWidgets('sin conexión al abrir → error con "Reintentar" que recupera', (tester) async {
      final routes = signedInRoutes()..['GET /v1/me'] = (status: 503, body: {'message': 'x'});
      final app = await pumpMechMate(tester, routes: routes);

      expect(find.text('No pudimos conectar'), findsOneWidget);
      app.http.routes['GET /v1/me'] = (status: 200, body: meAna);
      await tester.tap(find.text('Reintentar'));
      await tester.pumpAndSettle();
      expect(find.text('Hola, Ana'), findsOneWidget);
    });
  });
}
