import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import 'tokens.dart';

/// Escala tipográfica de iOS (tamaño/interlineado en pt).
abstract final class MmType {
  static const largeTitle = TextStyle(fontSize: 34, height: 41 / 34, fontWeight: FontWeight.w700, letterSpacing: -0.4);
  static const title1 = TextStyle(fontSize: 28, height: 34 / 28, fontWeight: FontWeight.w700, letterSpacing: -0.3);
  static const title2 = TextStyle(fontSize: 22, height: 28 / 22, fontWeight: FontWeight.w700, letterSpacing: -0.2);
  static const title3 = TextStyle(fontSize: 20, height: 25 / 20, fontWeight: FontWeight.w600, letterSpacing: -0.2);
  static const headline = TextStyle(fontSize: 17, height: 22 / 17, fontWeight: FontWeight.w600, letterSpacing: -0.2);
  static const body = TextStyle(fontSize: 17, height: 22 / 17, fontWeight: FontWeight.w400, letterSpacing: -0.2);
  static const callout = TextStyle(fontSize: 16, height: 21 / 16, fontWeight: FontWeight.w400, letterSpacing: -0.2);
  static const subhead = TextStyle(fontSize: 15, height: 20 / 15, fontWeight: FontWeight.w400, letterSpacing: -0.1);
  static const footnote = TextStyle(fontSize: 13, height: 18 / 13, fontWeight: FontWeight.w400);
  static const caption = TextStyle(fontSize: 12, height: 16 / 12, fontWeight: FontWeight.w500);

  /// Montos: cifras tabulares (las columnas de precios alinean).
  static const money = [FontFeature.tabularFigures()];
}

/// iPhone/iPad/Mac usan SF Pro (fuente del sistema); el resto, Geist (incluida).
String? fontFamilyFor(TargetPlatform platform) =>
    platform == TargetPlatform.iOS || platform == TargetPlatform.macOS ? null : 'Geist';

/// Tema único estilo iOS en TODAS las plataformas (sin ripple, transiciones
/// de iOS, superficies blancas sobre gris suave). Solo modo claro por ahora.
ThemeData buildTheme(TargetPlatform platform) {
  const scheme = ColorScheme(
    brightness: Brightness.light,
    primary: MmColors.primary,
    onPrimary: MmColors.surface,
    primaryContainer: MmColors.primaryTint,
    onPrimaryContainer: MmColors.primaryText,
    secondary: MmColors.primaryText,
    onSecondary: MmColors.surface,
    error: MmColors.danger,
    onError: MmColors.surface,
    errorContainer: MmColors.dangerTint,
    onErrorContainer: MmColors.dangerText,
    surface: MmColors.surface,
    onSurface: MmColors.ink,
    onSurfaceVariant: MmColors.inkSecondary,
    surfaceContainerLowest: MmColors.surface,
    surfaceContainerLow: MmColors.background,
    surfaceContainer: MmColors.fill,
    outline: MmColors.fieldBorder,
    outlineVariant: MmColors.separator,
  );

  final text = TextTheme(
    displaySmall: MmType.largeTitle,
    headlineMedium: MmType.title1,
    headlineSmall: MmType.title2,
    titleLarge: MmType.title3,
    titleMedium: MmType.headline,
    titleSmall: MmType.subhead.copyWith(fontWeight: FontWeight.w600),
    bodyLarge: MmType.body,
    bodyMedium: MmType.subhead,
    bodySmall: MmType.footnote,
    labelLarge: MmType.headline,
    labelMedium: MmType.footnote.copyWith(fontWeight: FontWeight.w600),
    labelSmall: MmType.caption,
  ).apply(bodyColor: MmColors.ink, displayColor: MmColors.ink, fontFamily: fontFamilyFor(platform));
  // OJO: los estilos de componentes (inputs, snackbars, botones) REEMPLAZAN el
  // estilo heredado; se derivan de `text` para no perder la fuente del tema.

  const iosTransitions = PageTransitionsTheme(
    builders: {
      TargetPlatform.android: CupertinoPageTransitionsBuilder(),
      TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
      TargetPlatform.macOS: CupertinoPageTransitionsBuilder(),
      TargetPlatform.windows: CupertinoPageTransitionsBuilder(),
      TargetPlatform.linux: CupertinoPageTransitionsBuilder(),
      TargetPlatform.fuchsia: CupertinoPageTransitionsBuilder(),
    },
  );

  OutlineInputBorder border(Color color, [double width = 1]) => OutlineInputBorder(
    borderRadius: BorderRadius.circular(MmRadius.control),
    borderSide: BorderSide(color: color, width: width),
  );

  return ThemeData(
    useMaterial3: true,
    platform: platform,
    colorScheme: scheme,
    fontFamily: fontFamilyFor(platform),
    textTheme: text,
    scaffoldBackgroundColor: MmColors.background,
    // iOS no tiene ripple: la respuesta al toque es escala/color (ver MmButton, MmCard).
    splashFactory: NoSplash.splashFactory,
    highlightColor: Colors.transparent,
    hoverColor: Colors.transparent,
    pageTransitionsTheme: iosTransitions,
    dividerTheme: const DividerThemeData(color: MmColors.separator, thickness: 1, space: 1),
    appBarTheme: AppBarTheme(
      backgroundColor: MmColors.background,
      foregroundColor: MmColors.ink,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0,
      centerTitle: true,
      titleTextStyle: text.titleMedium,
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: MmColors.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: MmSpace.l, vertical: 15),
      hintStyle: text.bodyLarge!.copyWith(color: MmColors.inkTertiary),
      labelStyle: text.bodyMedium!.copyWith(color: MmColors.inkSecondary),
      floatingLabelBehavior: FloatingLabelBehavior.always,
      helperStyle: text.bodySmall!.copyWith(color: MmColors.inkSecondary),
      errorStyle: text.bodySmall!.copyWith(color: MmColors.dangerText),
      border: border(MmColors.fieldBorder),
      enabledBorder: border(MmColors.fieldBorder),
      focusedBorder: border(MmColors.primary, 2),
      errorBorder: border(MmColors.danger),
      focusedErrorBorder: border(MmColors.danger, 2),
      disabledBorder: border(MmColors.separator),
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(color: MmColors.primary),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      backgroundColor: MmColors.ink,
      contentTextStyle: text.bodyMedium!.copyWith(color: MmColors.surface, fontWeight: FontWeight.w500),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(MmRadius.control)),
    ),
    cupertinoOverrideTheme: const CupertinoThemeData(primaryColor: MmColors.primary),
  );
}

/// Rebote de iOS al hacer scroll, sin el brillo de Android, en toda plataforma.
class MmScrollBehavior extends MaterialScrollBehavior {
  const MmScrollBehavior();

  @override
  ScrollPhysics getScrollPhysics(BuildContext context) =>
      const BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics());

  @override
  Widget buildOverscrollIndicator(BuildContext context, Widget child, ScrollableDetails details) => child;
}
