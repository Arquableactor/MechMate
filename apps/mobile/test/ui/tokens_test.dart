import 'dart:ui';

import 'package:flutter_test/flutter_test.dart';
import 'package:mechmate/ui/tokens.dart';

/// Contraste WCAG 2.x entre dos colores opacos.
double contrast(Color a, Color b) {
  final la = a.computeLuminance();
  final lb = b.computeLuminance();
  final (hi, lo) = la > lb ? (la, lb) : (lb, la);
  return (hi + 0.05) / (lo + 0.05);
}

void main() {
  // Todo par texto/fondo que usa la app. AA = 4.5:1 para texto normal.
  final pairs = <String, (Color, Color)>{
    'texto blanco sobre botón principal': (MmColors.surface, MmColors.primary),
    'texto blanco sobre principal presionado': (MmColors.surface, MmColors.primaryPressed),
    'azul de texto sobre blanco': (MmColors.primaryText, MmColors.surface),
    'azul de texto sobre tinte (botón secundario)': (MmColors.primaryText, MmColors.primaryTintPressed),
    'texto principal sobre fondo': (MmColors.ink, MmColors.background),
    'texto secundario sobre fondo': (MmColors.inkSecondary, MmColors.background),
    'texto terciario sobre fondo': (MmColors.inkTertiary, MmColors.background),
    'texto terciario sobre blanco (pestañas)': (MmColors.inkTertiary, MmColors.surface),
    'badge de éxito': (MmColors.successText, MmColors.successTint),
    'badge de alerta': (MmColors.dangerText, MmColors.dangerTint),
    'badge neutro': (MmColors.neutralText, MmColors.neutralTint),
    'alerta sobre blanco': (MmColors.danger, MmColors.surface),
  };

  for (final MapEntry(key: name, value: (fg, bg)) in pairs.entries) {
    test('contraste AA (≥ 4.5:1): $name', () {
      expect(contrast(fg, bg), greaterThanOrEqualTo(4.5), reason: '${contrast(fg, bg).toStringAsFixed(2)}:1');
    });
  }

  test('el verde de éxito NO es para texto pequeño (solo íconos/grande): por eso existe successText', () {
    expect(contrast(MmColors.surface, MmColors.success), lessThan(4.5));
    expect(contrast(MmColors.successText, MmColors.surface), greaterThanOrEqualTo(4.5));
  });

  test('área táctil mínima de 44 pt (Apple HIG)', () {
    expect(MmSpace.minTouch, greaterThanOrEqualTo(44));
  });
}
