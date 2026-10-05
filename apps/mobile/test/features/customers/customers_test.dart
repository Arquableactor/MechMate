import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/app_harness.dart';
import '../../support/fake_api.dart';
import '../../support/fixtures.dart';

/// Abre la app en la pestaña "Clientes" con el rol dado; devuelve la red simulada.
Future<FakeHttpAdapter> openCustomers(
  WidgetTester tester, {
  String role = 'owner',
  Size size = const Size(390, 844),
}) async {
  final app = await pumpMechMate(
    tester,
    size: size,
    routes: customerRoutes(role: role),
  );
  await tester.tap(find.text('Clientes').last);
  await tester.pumpAndSettle();
  return app.http;
}

Finder field(String label) => find.widgetWithText(TextFormField, label);

void main() {
  group('lista', () {
    testWidgets('muestra los clientes con su contacto formateado; el dueño ve "Nuevo cliente"', (tester) async {
      await openCustomers(tester);

      expect(find.text('María Gómez'), findsOneWidget);
      expect(find.text('(809) 555-1234 · 001-1234567-8'), findsOneWidget);
      expect(find.text('pedro@correo.com'), findsOneWidget); // sin teléfono ni cédula: el correo
      expect(find.bySemanticsLabel('Nuevo cliente'), findsOneWidget);
    });

    testWidgets('el mecánico solo consulta: sin "Nuevo cliente" ni "Agregar" vehículo', (tester) async {
      await openCustomers(tester, role: 'mechanic');

      expect(find.bySemanticsLabel('Nuevo cliente'), findsNothing);
      await tester.tap(find.text('María Gómez'));
      await tester.pumpAndSettle();
      expect(find.text('Toyota Corolla 2019'), findsOneWidget);
      expect(find.text('Agregar'), findsNothing);
    });

    testWidgets('buscar: espera a que el usuario deje de escribir y consulta con `q`; sin resultados lo dice', (
      tester,
    ) async {
      final http = await openCustomers(tester);
      final before = http.requests.where((r) => r.path.endsWith('/customers')).length;

      http.routes[api('/customers')] = (status: 200, body: page([]));
      await tester.enterText(find.byType(TextField).first, 'mar');
      await tester.pump(const Duration(milliseconds: 100));
      await tester.enterText(find.byType(TextField).first, 'maría');
      await tester.pump(const Duration(milliseconds: 350));
      await tester.pumpAndSettle();

      final searches = http.requests.where((r) => r.path.endsWith('/customers')).skip(before).toList();
      expect(searches.map((r) => r.queryParameters['q']), ['maría']); // una sola consulta, no una por tecla
      expect(find.text('Sin resultados'), findsOneWidget);
    });

    testWidgets('si la lista falla: error con "Reintentar"', (tester) async {
      final routes = customerRoutes()..[api('/customers')] = (status: 503, body: {'message': 'x'});
      await pumpMechMate(tester, routes: routes);
      await tester.tap(find.text('Clientes').last);
      await tester.pumpAndSettle();

      expect(find.text('No pudimos conectar'), findsOneWidget);
      expect(find.text('Reintentar'), findsOneWidget);
    });
  });

  group('ficha', () {
    testWidgets('cliente: resumen (visitas, total pagado en RD\$), contacto, vehículos e historial', (tester) async {
      await openCustomers(tester);
      await tester.tap(find.text('María Gómez'));
      await tester.pumpAndSettle();

      expect(find.text('RD\$6,264.00'), findsWidgets); // total pagado y monto de la visita
      expect(find.text('(809) 555-1234'), findsOneWidget);
      expect(find.text('001-1234567-8'), findsOneWidget);
      expect(find.text('Toyota Corolla 2019'), findsOneWidget);
      expect(find.text('A123456'), findsWidgets); // placa
      expect(find.textContaining('OT-0001'), findsOneWidget);
      expect(find.text('Pagada'), findsOneWidget);
      expect(find.textContaining('Efectivo'), findsOneWidget);
    });

    testWidgets('vehículo: datos técnicos e historia del carro', (tester) async {
      await openCustomers(tester);
      await tester.tap(find.text('María Gómez'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Toyota Corolla 2019'));
      await tester.pumpAndSettle();

      expect(find.text('85,000 km'), findsOneWidget);
      expect(find.text('1.8L 4 cil.'), findsOneWidget);
      expect(find.text('De María Gómez'), findsOneWidget);
      expect(find.text('OT-0001 · 2 sep 2026'), findsOneWidget); // en su propia ficha, sin repetir el vehículo
      expect(find.text('Efectivo'), findsOneWidget);
    });

    testWidgets('tablet: maestro-detalle (la lista y la ficha a la vez)', (tester) async {
      await openCustomers(tester, size: const Size(1024, 768));
      expect(find.text('Elige un cliente'), findsOneWidget);

      await tester.tap(find.text('María Gómez'));
      await tester.pumpAndSettle();
      expect(find.text('Pedro Ruiz'), findsOneWidget); // la lista sigue visible
      expect(find.text('Cliente desde 2 sep 2026'), findsOneWidget); // y la ficha al lado
    });
  });

  group('registrar cliente', () {
    testWidgets('valida como la API y envía solo lo escrito; luego abre la ficha nueva', (tester) async {
      final http = await openCustomers(tester);
      http.routes['POST /v1/shops/$shopId/customers'] = (status: 201, body: customerJson(name: 'Pedro Ruiz'));

      await tester.tap(find.bySemanticsLabel('Nuevo cliente'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Guardar cliente'));
      await tester.pumpAndSettle();
      expect(find.text('Escribe el nombre (al menos 2 letras).'), findsOneWidget);

      await tester.enterText(field('Nombre completo'), '  Pedro Ruiz ');
      await tester.enterText(field('Correo (opcional)'), 'pedro@');
      await tester.pumpAndSettle();
      expect(find.text('Escribe un correo válido.'), findsOneWidget);

      await tester.enterText(field('Correo (opcional)'), '');
      await tester.enterText(field('Teléfono (opcional)'), '809-555-1234');
      await tester.tap(find.text('Guardar cliente'));
      await tester.pumpAndSettle();

      final post = http.requests.singleWhere((r) => r.method == 'POST' && r.path.endsWith('/customers'));
      expect(jsonDecode(post.data as String), {'full_name': 'Pedro Ruiz', 'phone': '809-555-1234'});
      expect(find.text('Cliente desde 2 sep 2026'), findsOneWidget); // ficha del nuevo cliente
    });

    testWidgets('duplicado (409): lo explica y ofrece ir al cliente que ya existe', (tester) async {
      final http = await openCustomers(tester);
      http.routes['POST /v1/shops/$shopId/customers'] = (
        status: 409,
        body: {
          'message': 'Ya existe un cliente en este taller con ese teléfono o cédula.',
          'existing_customer_id': customerId,
        },
      );

      await tester.tap(find.bySemanticsLabel('Nuevo cliente'));
      await tester.pumpAndSettle();
      await tester.enterText(field('Nombre completo'), 'María G.');
      await tester.enterText(field('Teléfono (opcional)'), '8095551234');
      await tester.tap(find.text('Guardar cliente'));
      await tester.pumpAndSettle();

      expect(find.text('Ese cliente ya está registrado'), findsOneWidget);
      await tester.tap(find.text('Ver cliente existente'));
      await tester.pumpAndSettle();
      expect(find.text('María Gómez'), findsWidgets);
      expect(find.text('Cliente desde 2 sep 2026'), findsOneWidget);
    });
  });

  group('agregar vehículo', () {
    Future<FakeHttpAdapter> openVehicleForm(WidgetTester tester) async {
      final http = await openCustomers(tester);
      await tester.tap(find.text('María Gómez'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Agregar'));
      await tester.pumpAndSettle();
      return http;
    }

    testWidgets('exige al menos placa, VIN o chasis', (tester) async {
      final http = await openVehicleForm(tester);
      await tester.enterText(field('Marca'), 'Kia');
      await tester.tap(find.text('Guardar vehículo'));
      await tester.pumpAndSettle();

      expect(find.text('Indica al menos la placa, el VIN o el número de chasis.'), findsOneWidget);
      expect(http.requests.where((r) => r.method == 'POST'), isEmpty);
    });

    testWidgets('VIN válido → se decodifica solo y completa marca/modelo/año; lo vacío no se envía', (tester) async {
      final http = await openVehicleForm(tester);
      const vin = '1HGCM82633A004352';
      http.routes['GET /v1/vin/$vin'] = (
        status: 200,
        body: {
          'vin': vin,
          'check_digit_valid': true,
          'found': true,
          'source': 'nhtsa_vpic',
          'provider_unavailable': false,
          'vehicle': {
            'make': 'Honda',
            'model': 'Accord',
            'year': 2003,
            'trim': 'EX',
            'engine': '3.0L V6',
            'fuel_type': 'Gasolina',
            'body_class': null,
            'drive_type': null,
            'transmission': null,
          },
          'warnings': <String>[],
        },
      );
      http.routes['POST /v1/shops/$shopId/vehicles'] = (status: 201, body: vehicleJson(vin: vin));

      await tester.enterText(field('VIN'), '1hgcm82633a004352');
      await tester.pumpAndSettle();
      expect(find.text('Honda Accord 2003'), findsOneWidget); // aviso con lo decodificado
      expect(tester.widget<TextFormField>(field('Marca')).controller!.text, 'Honda');
      expect(tester.widget<TextFormField>(field('Año')).controller!.text, '2003');

      await tester.enterText(field('Kilometraje (opcional)'), '120000');
      await tester.tap(find.text('Guardar vehículo'));
      await tester.pumpAndSettle();

      final post = http.requests.singleWhere((r) => r.method == 'POST');
      // Motor/versión/combustible NO se envían: la API los toma del VIN.
      expect(jsonDecode(post.data as String), {
        'customer_id': customerId,
        'vin': vin,
        'make': 'Honda',
        'model': 'Accord',
        'year': 2003,
        'mileage_km': 120000,
      });
    });

    testWidgets('VIN no encontrado o servicio caído: lo dice y deja completar a mano', (tester) async {
      final http = await openVehicleForm(tester);
      const vin = '1HGCM82633A004352';
      Map<String, Object?> result({required bool unavailable}) => {
        'vin': vin,
        'check_digit_valid': true,
        'found': false,
        'source': null,
        'provider_unavailable': unavailable,
        'vehicle': null,
        'warnings': <String>[],
      };
      http.routes['GET /v1/vin/$vin'] = (status: 200, body: result(unavailable: true));

      await tester.enterText(field('VIN'), vin);
      await tester.pumpAndSettle();
      expect(find.text('El servicio de VIN no responde ahora. Completa la marca y el modelo a mano.'), findsOneWidget);
      expect(tester.widget<TextFormField>(field('Marca')).controller!.text, '');
    });
  });
}
