import 'package:flutter/material.dart';

import '../theme.dart';
import '../tokens.dart';

enum MmBadgeTone { success, info, neutral, danger }

/// Etiqueta de estado ("Disponible hoy", "Pagada", "Verificado"). El estado
/// nunca se comunica solo por color: siempre lleva texto (y punto o ícono).
class MmBadge extends StatelessWidget {
  const MmBadge(this.label, {super.key, this.tone = MmBadgeTone.neutral, this.icon, this.dot = false});

  final String label;
  final MmBadgeTone tone;
  final IconData? icon;

  /// Punto de estado a la izquierda (p. ej. disponibilidad).
  final bool dot;

  ({Color bg, Color fg, Color dot}) get _colors => switch (tone) {
    MmBadgeTone.success => (bg: MmColors.successTint, fg: MmColors.successText, dot: MmColors.successDot),
    MmBadgeTone.info => (bg: MmColors.primaryTint, fg: MmColors.primaryText, dot: MmColors.primary),
    MmBadgeTone.neutral => (bg: MmColors.neutralTint, fg: MmColors.neutralText, dot: MmColors.inkTertiary),
    MmBadgeTone.danger => (bg: MmColors.dangerTint, fg: MmColors.dangerText, dot: MmColors.danger),
  };

  @override
  Widget build(BuildContext context) {
    final c = _colors;
    return Container(
      height: 24,
      padding: const EdgeInsets.symmetric(horizontal: 9),
      decoration: BoxDecoration(color: c.bg, borderRadius: BorderRadius.circular(12)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (dot) ...[
            Container(
              width: 6,
              height: 6,
              decoration: BoxDecoration(color: c.dot, shape: BoxShape.circle),
            ),
            const SizedBox(width: 6),
          ] else if (icon != null) ...[
            Icon(icon, size: 14, color: c.fg),
            const SizedBox(width: 5),
          ],
          Text(label, style: MmType.caption.copyWith(color: c.fg)),
        ],
      ),
    );
  }
}
