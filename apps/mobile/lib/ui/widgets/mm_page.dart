import 'package:flutter/material.dart';

import '../theme.dart';
import '../tokens.dart';

/// Página con título grande estilo iOS, márgenes según el tamaño de pantalla
/// y contenido limitado a un ancho legible en escritorio.
class MmPage extends StatelessWidget {
  const MmPage({super.key, required this.title, required this.child, this.subtitle, this.trailing, this.gutter});

  final String title;
  final String? subtitle;
  final Widget? trailing;
  final Widget child;

  /// Margen lateral fijo (p. ej. dentro de un panel); por defecto, según la pantalla.
  final double? gutter;

  static double gutterFor(double width) => width >= MmBreakpoints.desktop
      ? MmSpace.gutterDesktop
      : width >= MmBreakpoints.tablet
      ? MmSpace.gutterTablet
      : MmSpace.gutterPhone;

  @override
  Widget build(BuildContext context) {
    final gutter = this.gutter ?? gutterFor(MediaQuery.sizeOf(context).width);
    return SafeArea(
      bottom: false,
      child: Align(
        alignment: Alignment.topCenter,
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: MmBreakpoints.maxContent),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Padding(
                padding: EdgeInsets.fromLTRB(gutter, MmSpace.l, gutter, MmSpace.l),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Semantics(header: true, child: Text(title, style: MmType.largeTitle)),
                          if (subtitle != null) ...[
                            const SizedBox(height: MmSpace.xs),
                            Text(subtitle!, style: MmType.body.copyWith(color: MmColors.inkSecondary)),
                          ],
                        ],
                      ),
                    ),
                    ?trailing,
                  ],
                ),
              ),
              Expanded(child: child),
            ],
          ),
        ),
      ),
    );
  }
}
