import 'package:flutter/material.dart';

import '../tokens.dart';

/// Tarjeta del sistema: blanca, radio grande, sombra suave. Con `onTap` se
/// comporta como botón (foco, teclado, lector de pantalla) y responde al
/// toque con una leve escala, sin ripple.
class MmCard extends StatefulWidget {
  const MmCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding = const EdgeInsets.all(MmSpace.l),
    this.semanticLabel,
  });

  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsetsGeometry padding;
  final String? semanticLabel;

  @override
  State<MmCard> createState() => _MmCardState();
}

class _MmCardState extends State<MmCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final reduceMotion = MediaQuery.disableAnimationsOf(context);
    final radius = BorderRadius.circular(MmRadius.card);
    final content = Padding(padding: widget.padding, child: widget.child);

    return AnimatedScale(
      scale: _pressed ? 0.98 : 1,
      duration: reduceMotion ? Duration.zero : MmMotion.press,
      child: DecoratedBox(
        decoration: BoxDecoration(color: MmColors.surface, borderRadius: radius, boxShadow: MmShadows.card),
        child: widget.onTap == null
            ? content
            : Semantics(
                label: widget.semanticLabel,
                button: true,
                child: Material(
                  type: MaterialType.transparency,
                  borderRadius: radius,
                  child: InkWell(
                    borderRadius: radius,
                    splashFactory: NoSplash.splashFactory,
                    highlightColor: Colors.transparent,
                    focusColor: MmColors.primary.withValues(alpha: 0.08),
                    onHighlightChanged: (v) => setState(() => _pressed = v),
                    onTap: widget.onTap,
                    child: content,
                  ),
                ),
              ),
      ),
    );
  }
}
