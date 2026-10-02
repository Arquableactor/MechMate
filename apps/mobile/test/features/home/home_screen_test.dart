import 'package:flutter_test/flutter_test.dart';

import '../../support/app_harness.dart';

Map<String, Object?> _health({String db = 'up', String redis = 'disabled'}) => {...healthy, 'db': db, 'redis': redis};

void main() {
  testWidgets('saludo con el nombre y el taller activo', (tester) async {
    await pumpMechMate(tester);
    expect(find.text('Hola, Ana'), findsOneWidget);
    expect(find.text('Taller Hermanos Pérez'), findsOneWidget);
  });

  testWidgets('estado de la API (JSON → modelos generados): dice qué está caído o desactivado', (tester) async {
    final app = await pumpMechMate(
      tester,
      routes: signedInRoutes()..['GET /v1/health'] = (status: 200, body: _health()),
    );

    expect(find.text('Conectado a MechMate'), findsOneWidget);
    expect(find.text('Base de datos en línea · Colas desactivadas'), findsOneWidget);
    expect(app.http.requests.where((r) => r.path == '/v1/health'), hasLength(1));
  });

  testWidgets('todo en línea: frase corta, sin repetir el estado', (tester) async {
    await pumpMechMate(
      tester,
      routes: signedInRoutes()..['GET /v1/health'] = (status: 200, body: _health(redis: 'up')),
    );
    expect(find.text('Base de datos y colas en línea'), findsOneWidget);
  });

  testWidgets('si la API falla muestra el error y "Reintentar" vuelve a consultar', (tester) async {
    final app = await pumpMechMate(
      tester,
      routes: signedInRoutes()..['GET /v1/health'] = (status: 503, body: {'message': 'x'}),
    );

    expect(find.text('No pudimos conectar'), findsOneWidget);
    app.http.routes['GET /v1/health'] = (status: 200, body: _health());
    await tester.tap(find.text('Reintentar'));
    await tester.pumpAndSettle();

    expect(find.text('Conectado a MechMate'), findsOneWidget);
    expect(app.http.requests.where((r) => r.path == '/v1/health'), hasLength(2));
  });

  testWidgets('un JSON que no cumple el contrato es un error, no un crash', (tester) async {
    await pumpMechMate(
      tester,
      routes: signedInRoutes()..['GET /v1/health'] = (status: 200, body: _health(db: 'desconocido')),
    );
    expect(find.text('No pudimos conectar'), findsOneWidget);
  });
}
