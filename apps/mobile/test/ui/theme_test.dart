import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mechmate/ui/theme.dart';
import 'package:mechmate/ui/tokens.dart';
import 'package:mechmate/ui/widgets/mm_button.dart';

void main() {
  test('tipografía: SF Pro (sistema) en iPhone/Mac; Geist en Android y web', () {
    expect(buildTheme(TargetPlatform.iOS).textTheme.bodyLarge!.fontFamily, isNot('Geist'));
    expect(fontFamilyFor(TargetPlatform.iOS), isNull);
    expect(fontFamilyFor(TargetPlatform.macOS), isNull);
    expect(buildTheme(TargetPlatform.android).textTheme.bodyLarge!.fontFamily, 'Geist');
  });

  test('estilo iOS en todas las plataformas: transiciones de iOS y sin ripple', () {
    for (final p in [TargetPlatform.android, TargetPlatform.iOS, TargetPlatform.linux]) {
      final theme = buildTheme(p);
      expect(theme.pageTransitionsTheme.builders[p], isA<CupertinoPageTransitionsBuilder>());
      expect(theme.splashFactory, NoSplash.splashFactory);
    }
  });

  test('escala tipográfica de iOS y colores del sistema', () {
    final theme = buildTheme(TargetPlatform.android);
    expect(theme.textTheme.displaySmall!.fontSize, 34); // Large Title
    expect(theme.textTheme.bodyLarge!.fontSize, 17); // Body
    expect(theme.colorScheme.primary, MmColors.primary);
    expect(theme.scaffoldBackgroundColor, MmColors.background);
  });

  testWidgets('la fuente del tema llega también a botones, inputs y avisos (que reemplazan el estilo)', (tester) async {
    final theme = buildTheme(TargetPlatform.android);
    expect(theme.inputDecorationTheme.hintStyle!.fontFamily, 'Geist');
    expect(theme.inputDecorationTheme.errorStyle!.fontFamily, 'Geist');
    expect(theme.snackBarTheme.contentTextStyle!.fontFamily, 'Geist');
    expect(theme.appBarTheme.titleTextStyle!.fontFamily, 'Geist');

    await tester.pumpWidget(
      MaterialApp(
        theme: theme,
        home: Scaffold(
          body: MmButton(label: 'Iniciar sesión', onPressed: () {}),
        ),
      ),
    );
    final label = tester.widget<RichText>(find.descendant(of: find.byType(MmButton), matching: find.byType(RichText)));
    expect(label.text.style!.fontFamily, 'Geist');
  });

  test('ningún estilo hereda el espaciado ancho de Material (texto apretado como en iOS)', () {
    final t = buildTheme(TargetPlatform.android).textTheme;
    final styles = {
      'displaySmall': t.displaySmall,
      'headlineMedium': t.headlineMedium,
      'headlineSmall': t.headlineSmall,
      'titleLarge': t.titleLarge,
      'titleMedium': t.titleMedium,
      'titleSmall': t.titleSmall,
      'bodyLarge': t.bodyLarge,
      'bodyMedium': t.bodyMedium,
      'bodySmall': t.bodySmall,
      'labelLarge': t.labelLarge,
      'labelMedium': t.labelMedium,
      'labelSmall': t.labelSmall,
    };
    for (final MapEntry(:key, :value) in styles.entries) {
      expect(value!.letterSpacing, lessThanOrEqualTo(0), reason: key);
    }
  });
}
