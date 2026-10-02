import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mechmate/ui/theme.dart';
import 'package:mechmate/ui/widgets/mm_button.dart';

Widget _host(Widget child, {TargetPlatform platform = TargetPlatform.android}) => MaterialApp(
  theme: buildTheme(platform),
  home: Scaffold(
    body: Center(
      child: Padding(padding: const EdgeInsets.all(20), child: child),
    ),
  ),
);

void main() {
  testWidgets('normal: toca y ejecuta; mide al menos 52 de alto (≥ 44 pt)', (tester) async {
    var taps = 0;
    await tester.pumpWidget(_host(MmButton(label: 'Continuar', onPressed: () => taps++)));

    await tester.tap(find.text('Continuar'));
    expect(taps, 1);
    expect(tester.getSize(find.byType(TextButton)).height, greaterThanOrEqualTo(52));
  });

  testWidgets('lector de pantalla: botón habilitado, con su etiqueta y acción de tocar', (tester) async {
    final handle = tester.ensureSemantics();
    await tester.pumpWidget(_host(MmButton(label: 'Continuar', onPressed: () {})));
    expect(
      tester.getSemantics(find.bySemanticsLabel('Continuar')),
      isSemantics(label: 'Continuar', isButton: true, hasEnabledState: true, isEnabled: true, hasTapAction: true),
    );
    handle.dispose();
  });

  testWidgets('deshabilitado (onPressed null): no responde y se anuncia deshabilitado', (tester) async {
    final handle = tester.ensureSemantics();
    await tester.pumpWidget(_host(const MmButton(label: 'Confirmar cita', onPressed: null)));

    await tester.tap(find.text('Confirmar cita'), warnIfMissed: false);
    expect(
      tester.getSemantics(find.bySemanticsLabel('Confirmar cita')),
      isSemantics(label: 'Confirmar cita', isButton: true, hasEnabledState: true, isEnabled: false),
    );
    handle.dispose();
  });

  testWidgets('cargando: muestra progreso, ignora toques (no cobra dos veces) y lo anuncia', (tester) async {
    final handle = tester.ensureSemantics();
    var taps = 0;
    await tester.pumpWidget(_host(MmButton(label: 'Cobrar', loading: true, onPressed: () => taps++)));

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    await tester.tap(find.text('Cobrar'), warnIfMissed: false);
    await tester.pump();
    expect(taps, 0);
    expect(
      tester.getSemantics(find.bySemanticsLabel('Cobrar, cargando')),
      isSemantics(label: 'Cobrar, cargando', isButton: true, hasEnabledState: true, isEnabled: false),
    );
    handle.dispose();
  });

  testWidgets('presionado: se encoge levemente (respuesta táctil estilo iOS, sin ripple)', (tester) async {
    await tester.pumpWidget(_host(MmButton(label: 'Guardar', onPressed: () {})));
    final gesture = await tester.startGesture(tester.getCenter(find.text('Guardar')));
    await tester.pumpAndSettle();
    expect(tester.widget<AnimatedScale>(find.byType(AnimatedScale)).scale, lessThan(1));
    expect(find.byType(InkRipple), findsNothing);
    expect(find.byType(InkSparkle), findsNothing);
    await gesture.up();
    await tester.pumpAndSettle();
    expect(tester.widget<AnimatedScale>(find.byType(AnimatedScale)).scale, 1);
  });

  testWidgets('en iPhone, el botón principal da háptica ligera', (tester) async {
    final calls = <MethodCall>[];
    tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(SystemChannels.platform, (call) async {
      calls.add(call);
      return null;
    });
    await tester.pumpWidget(
      _host(
        MmButton(label: 'Pagar', icon: CupertinoIcons.lock_fill, onPressed: () {}),
        platform: TargetPlatform.iOS,
      ),
    );
    await tester.tap(find.text('Pagar'));
    expect(calls.where((c) => c.method == 'HapticFeedback.vibrate'), isNotEmpty);
    tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(SystemChannels.platform, null);
  });
}
