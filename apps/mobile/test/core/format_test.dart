import 'package:flutter_test/flutter_test.dart';
import 'package:mechmate/core/format.dart';

void main() {
  group('Fmt', () {
    test('dinero: centavos en string → RD\$ con miles y 2 decimales (enteros, sin double)', () {
      expect(Fmt.money('626400'), 'RD\$6,264.00');
      expect(Fmt.money('0'), 'RD\$0.00');
      expect(Fmt.money('5'), 'RD\$0.05');
      expect(Fmt.money('123456789012345'), 'RD\$1,234,567,890,123.45');
      expect(Fmt.money('-50032'), '-RD\$500.32');
      // Más allá de 2^53 un double perdería centavos; BigInt no.
      expect(Fmt.money('9007199254740993'), 'RD\$90,071,992,547,409.93');
    });

    test('teléfono, cédula y kilometraje con formato dominicano', () {
      expect(Fmt.phone('+18095551234'), '(809) 555-1234');
      expect(Fmt.phone('+34612345678'), '+34612345678');
      expect(Fmt.cedula('00112345678'), '001-1234567-8');
      expect(Fmt.km(85000), '85,000 km');
    });

    test('fechas en hora de RD (UTC−4): una visita a las 11 p.m. de RD sigue siendo ese día', () {
      expect(Fmt.date('2026-09-03T02:30:00.000Z'), '2 sep 2026'); // 10:30 p.m. del 2 en RD
      final now = DateTime.utc(2026, 9, 30, 15);
      expect(Fmt.relativeDate('2026-09-30T13:00:00Z', now: now), 'Hoy');
      expect(Fmt.relativeDate('2026-09-29T13:00:00Z', now: now), 'Ayer');
      expect(Fmt.relativeDate('2026-09-26T13:00:00Z', now: now), 'Hace 4 días');
      expect(Fmt.relativeDate('2026-08-01T13:00:00Z', now: now), '1 ago 2026');
    });

    test('iniciales', () {
      expect(Fmt.initials('María Gómez de la Cruz'), 'MC');
      expect(Fmt.initials('pedro'), 'P');
      expect(Fmt.initials('  '), '?');
    });
  });

  group('Validate (mismas reglas que la API)', () {
    test('teléfono RD con o sin 1, o internacional con +; vacío = opcional', () {
      for (final ok in ['809-555-1234', '(829) 555 1234', '18495551234', '+34612345678', '']) {
        expect(Validate.phone(ok), isNull, reason: ok);
      }
      for (final bad in ['555-1234', '28095551234', '+0123']) {
        expect(Validate.phone(bad), isNotNull, reason: bad);
      }
    });

    test('cédula 11 dígitos, correo, nombre', () {
      expect(Validate.cedula('001-1234567-8'), isNull);
      expect(Validate.cedula('001-123'), isNotNull);
      expect(Validate.email('maria@correo.com'), isNull);
      expect(Validate.email('maria@'), isNotNull);
      expect(Validate.fullName(' A '), isNotNull);
      expect(Validate.fullName('Ana'), isNull);
    });

    test('vehículo: placa, VIN (sin I/O/Q), chasis, año y kilometraje', () {
      expect(Validate.plate('a-123 456'), isNull);
      expect(Validate.normalizePlate('a-123 456'), 'A123456');
      expect(Validate.plate('A1'), isNotNull);
      expect(Validate.vin('1hgcm82633a004352'), isNull);
      expect(Validate.vin('1HGCM82633A00435O'), isNotNull); // O no existe en un VIN
      expect(Validate.vin('1HGCM8263'), isNotNull);
      expect(Validate.chassis('nze121 - 1234567'), isNull);
      expect(Validate.year('1899'), isNotNull);
      expect(Validate.year('2019'), isNull);
      expect(Validate.mileage('3000001'), isNotNull);
      expect(Validate.mileage('85000'), isNull);
    });
  });
}
