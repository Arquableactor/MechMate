import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mechmate/ui/widgets/app_shell.dart';

import '../support/app_harness.dart';

Future<void> _pumpAt(WidgetTester tester, Size size) => pumpMechMate(tester, size: size);

void main() {
  final platforms = TargetPlatformVariant(const {TargetPlatform.iOS, TargetPlatform.android});

  testWidgets('teléfono: barra de pestañas con los 5 destinos, sin barra lateral', (tester) async {
    await _pumpAt(tester, const Size(390, 844));

    for (final d in shellDestinations) {
      expect(find.text(d.label), findsWidgets);
    }
    expect(find.byType(BackdropFilter), findsOneWidget); // vidrio de la barra de pestañas
    expect(find.byType(MmLogo), findsNothing);
  }, variant: platforms);

  testWidgets('teléfono: tocar "Clientes" cambia de sección', (tester) async {
    await _pumpAt(tester, const Size(390, 844));

    await tester.tap(find.text('Clientes'));
    await tester.pumpAndSettle();
    expect(find.text('Tus clientes aparecerán aquí'), findsOneWidget);
  }, variant: platforms);

  testWidgets('tablet: barra lateral con logo, sin barra de pestañas', (tester) async {
    await _pumpAt(tester, const Size(1024, 768));

    expect(find.byType(MmLogo), findsOneWidget);
    expect(find.byType(BackdropFilter), findsNothing);
    await tester.tap(find.text('Cobros'));
    await tester.pumpAndSettle();
    expect(find.text('Sin cobros todavía'), findsOneWidget);
  }, variant: platforms);

  testWidgets('escritorio: la barra lateral se ensancha', (tester) async {
    await _pumpAt(tester, const Size(1024, 768));
    final tabletWidth = tester
        .getSize(find.ancestor(of: find.byType(MmLogo), matching: find.byType(Container)).last)
        .width;

    await _pumpAt(tester, const Size(1440, 900));
    final desktopWidth = tester
        .getSize(find.ancestor(of: find.byType(MmLogo), matching: find.byType(Container)).last)
        .width;
    expect(desktopWidth, greaterThan(tabletWidth));
  });
}
