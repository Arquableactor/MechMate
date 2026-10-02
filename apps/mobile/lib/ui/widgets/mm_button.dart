import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../tokens.dart';

enum MmButtonVariant { primary, secondary, ghost }

/// Botón del sistema. Estados: normal, hover, presionado (escala + color),
/// deshabilitado (`onPressed: null`), cargando (`loading: true`: no acepta
/// toques, conserva el color y lo anuncia a VoiceOver/TalkBack).
class MmButton extends StatefulWidget {
  const MmButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = MmButtonVariant.primary,
    this.icon,
    this.loading = false,
    this.expand = true,
  });

  const MmButton.secondary({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.loading = false,
    this.expand = true,
  }) : variant = MmButtonVariant.secondary;

  const MmButton.ghost({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.loading = false,
    this.expand = false,
  }) : variant = MmButtonVariant.ghost;

  final String label;
  final VoidCallback? onPressed;
  final MmButtonVariant variant;
  final IconData? icon;
  final bool loading;

  /// true = ocupa todo el ancho (acción principal de la pantalla).
  final bool expand;

  @override
  State<MmButton> createState() => _MmButtonState();
}

class _MmButtonState extends State<MmButton> {
  final _states = WidgetStatesController();

  @override
  void initState() {
    super.initState();
    _states.addListener(_onStates);
  }

  bool _pressed = false;

  // Solo "presionado" cambia el aspecto aquí (el resto lo resuelve ButtonStyle).
  // Reaccionar a TODO cambio llamaría setState durante el build (p. ej. al
  // marcarse "disabled").
  void _onStates() {
    final pressed = _states.value.contains(WidgetState.pressed);
    if (pressed != _pressed) setState(() => _pressed = pressed);
  }

  @override
  void dispose() {
    _states
      ..removeListener(_onStates)
      ..dispose();
    super.dispose();
  }

  bool get _enabled => widget.onPressed != null;

  ({Color bg, Color bgHover, Color bgPressed, Color fg}) get _palette => switch (widget.variant) {
    MmButtonVariant.primary => (
      bg: MmColors.primary,
      bgHover: MmColors.primaryHover,
      bgPressed: MmColors.primaryPressed,
      fg: MmColors.surface,
    ),
    MmButtonVariant.secondary => (
      bg: MmColors.primaryTint,
      bgHover: MmColors.primaryTintHover,
      bgPressed: MmColors.primaryTintPressed,
      fg: MmColors.primaryText,
    ),
    MmButtonVariant.ghost => (
      bg: Colors.transparent,
      bgHover: const Color(0xFFF0F4FC),
      bgPressed: const Color(0xFFE4ECFB),
      fg: MmColors.primaryText,
    ),
  };

  void _handlePress() {
    if (widget.variant == MmButtonVariant.primary && Theme.of(context).platform == TargetPlatform.iOS) {
      HapticFeedback.lightImpact();
    }
    widget.onPressed?.call();
  }

  @override
  Widget build(BuildContext context) {
    final p = _palette;
    final pressed = _pressed && !widget.loading;
    final reduceMotion = MediaQuery.disableAnimationsOf(context);

    Color resolveBg(Set<WidgetState> s) {
      if (s.contains(WidgetState.disabled)) {
        return widget.variant == MmButtonVariant.ghost ? Colors.transparent : MmColors.disabledFill;
      }
      if (widget.loading) return p.bg;
      if (s.contains(WidgetState.pressed)) return p.bgPressed;
      if (s.contains(WidgetState.hovered)) return p.bgHover;
      return p.bg;
    }

    final style = ButtonStyle(
      backgroundColor: WidgetStateProperty.resolveWith(resolveBg),
      foregroundColor: WidgetStateProperty.resolveWith(
        (s) => s.contains(WidgetState.disabled) ? MmColors.disabledInk : p.fg,
      ),
      overlayColor: const WidgetStatePropertyAll(Colors.transparent),
      splashFactory: NoSplash.splashFactory,
      elevation: const WidgetStatePropertyAll(0),
      minimumSize: WidgetStatePropertyAll(Size(widget.expand ? double.infinity : MmSpace.minTouch, 52)),
      padding: const WidgetStatePropertyAll(EdgeInsets.symmetric(horizontal: 22)),
      shape: const WidgetStatePropertyAll(
        RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(MmRadius.control))),
      ),
      side: WidgetStateProperty.resolveWith(
        (s) => s.contains(WidgetState.focused)
            ? BorderSide(color: MmColors.primary.withValues(alpha: 0.45), width: 3)
            : BorderSide.none,
      ),
      // Del tema (no MmType directo): los botones reemplazan el estilo heredado.
      textStyle: WidgetStatePropertyAll(Theme.of(context).textTheme.labelLarge),
      animationDuration: MmMotion.state,
    );

    final label = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (widget.loading)
          SizedBox.square(dimension: 18, child: CircularProgressIndicator(strokeWidth: 2.2, color: p.fg))
        else if (widget.icon != null)
          Icon(widget.icon, size: 20),
        if (widget.loading || widget.icon != null) const SizedBox(width: MmSpace.s),
        Flexible(child: Text(widget.label, overflow: TextOverflow.ellipsis)),
      ],
    );

    final showShadow = widget.variant == MmButtonVariant.primary && _enabled && !pressed;

    final button = AnimatedScale(
      scale: pressed ? 0.97 : 1,
      duration: reduceMotion ? Duration.zero : MmMotion.press,
      child: AnimatedContainer(
        duration: reduceMotion ? Duration.zero : MmMotion.state,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(MmRadius.control),
          boxShadow: showShadow ? MmShadows.primaryButton : const [],
        ),
        child: AbsorbPointer(
          absorbing: widget.loading,
          child: TextButton(
            statesController: _states,
            style: style,
            onPressed: _enabled ? _handlePress : null,
            child: label,
          ),
        ),
      ),
    );

    // Normal/deshabilitado: la semántica la da TextButton (botón, etiqueta,
    // habilitado). Cargando: se anuncia "…, cargando" y no se puede activar.
    if (!widget.loading) return button;
    return Semantics(
      container: true,
      button: true,
      enabled: false,
      label: '${widget.label}, cargando',
      excludeSemantics: true,
      child: button,
    );
  }
}
