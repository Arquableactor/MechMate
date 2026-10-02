import 'package:flutter/widgets.dart';

/// Tokens del sistema visual de MechMate (estilo iOS). Ver DESIGN.md.
/// Una sola fuente: ningún widget usa colores, radios o sombras sueltos.
abstract final class MmColors {
  // Acción principal: el ÚNICO color de acción.
  static const primary = Color(0xFF0B63F6);
  static const primaryHover = Color(0xFF0957DA);
  static const primaryPressed = Color(0xFF084CBF);
  static const primaryTint = Color(0xFFEAF1FF);
  static const primaryTintHover = Color(0xFFDDE8FF);
  static const primaryTintPressed = Color(0xFFCFDFFF);

  /// Azul para TEXTO sobre blanco o sobre `primaryTint` (contraste AA).
  static const primaryText = Color(0xFF0B4FC4);

  // Texto.
  static const ink = Color(0xFF0B1220);
  static const inkSecondary = Color(0xFF5B6472);
  static const inkTertiary = Color(0xFF667085);

  // Superficies.
  static const background = Color(0xFFF5F6F8);
  static const surface = Color(0xFFFFFFFF);
  static const fill = Color(0xFFF1F3F6);
  static const separator = Color(0xFFE6E8EC);
  static const fieldBorder = Color(0xFFE1E5EB);

  // Estados: verde = confirmado/disponible; rojo = SOLO alertas.
  static const success = Color(0xFF1E9E55);
  static const successDot = Color(0xFF22A55B);
  static const successTint = Color(0xFFE7F6EC);
  static const successText = Color(0xFF146C3B);
  static const danger = Color(0xFFD92D20);
  static const dangerTint = Color(0xFFFDECEA);
  static const dangerText = Color(0xFFB42318);

  // Deshabilitado.
  static const disabledFill = Color(0xFFE6E8EC);
  static const disabledInk = Color(0xFF8A93A3);

  // Neutro (badges informativos que no son estado).
  static const neutralTint = Color(0xFFEEF0F4);
  static const neutralText = Color(0xFF3D4656);
}

/// Grilla de 4 pt.
abstract final class MmSpace {
  static const xs = 4.0;
  static const s = 8.0;
  static const m = 12.0;
  static const l = 16.0;
  static const xl = 20.0;
  static const xxl = 24.0;
  static const x3 = 32.0;
  static const x4 = 40.0;
  static const x5 = 48.0;

  /// Margen lateral por tamaño: teléfono, tablet, escritorio.
  static const gutterPhone = 20.0;
  static const gutterTablet = 24.0;
  static const gutterDesktop = 32.0;

  /// Área táctil mínima (Apple HIG).
  static const minTouch = 44.0;
}

abstract final class MmRadius {
  static const chip = 10.0;
  static const control = 16.0;
  static const card = 22.0;
  static const sheet = 28.0;
}

abstract final class MmShadows {
  /// Tarjetas: sombra suave y realista (dos capas).
  static const card = [
    BoxShadow(color: Color(0x0A101828), blurRadius: 2, offset: Offset(0, 1)),
    BoxShadow(color: Color(0x0F101828), blurRadius: 30, offset: Offset(0, 10)),
  ];

  /// Botón principal en reposo (se aplana al presionar).
  static const primaryButton = [BoxShadow(color: Color(0x3D0B63F6), blurRadius: 20, offset: Offset(0, 8))];

  static const floating = [BoxShadow(color: Color(0x14101828), blurRadius: 40, offset: Offset(0, -2))];
}

/// Puntos de quiebre del layout adaptativo.
abstract final class MmBreakpoints {
  /// Desde aquí: barra lateral en vez de barra de pestañas.
  static const tablet = 700.0;

  /// Desde aquí: barra lateral ancha y contenido tipo dashboard.
  static const desktop = 1100.0;

  /// Ancho máximo del contenido (web).
  static const maxContent = 1280.0;
}

/// Duraciones de las microinteracciones (se anulan con "reducir movimiento").
abstract final class MmMotion {
  static const press = Duration(milliseconds: 120);
  static const state = Duration(milliseconds: 180);
}
