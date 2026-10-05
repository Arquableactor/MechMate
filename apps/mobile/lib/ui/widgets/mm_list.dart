import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import '../../core/format.dart';
import '../theme.dart';
import '../tokens.dart';

/// Título de sección (estilo iOS: texto secundario sobre el grupo) con acción opcional.
class MmSectionHeader extends StatelessWidget {
  const MmSectionHeader(this.title, {super.key, this.action});

  final String title;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(MmSpace.xs, MmSpace.xxl, MmSpace.xs, MmSpace.s),
      child: Row(
        children: [
          Expanded(
            child: Semantics(
              header: true,
              child: Text(title, style: MmType.headline.copyWith(fontSize: 20, height: 25 / 20)),
            ),
          ),
          ?action,
        ],
      ),
    );
  }
}

/// Lista agrupada (inset grouped de iOS): tarjeta blanca con separadores
/// que empiezan donde empieza el texto.
class MmListGroup extends StatelessWidget {
  const MmListGroup({super.key, required this.children, this.separatorIndent = 68});

  final List<Widget> children;
  final double separatorIndent;

  @override
  Widget build(BuildContext context) {
    final rows = <Widget>[];
    for (var i = 0; i < children.length; i++) {
      if (i > 0) rows.add(Divider(indent: separatorIndent, height: 1));
      rows.add(children[i]);
    }
    return DecoratedBox(
      decoration: BoxDecoration(
        color: MmColors.surface,
        borderRadius: BorderRadius.circular(MmRadius.card),
        boxShadow: MmShadows.card,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(MmRadius.card),
        child: Column(mainAxisSize: MainAxisSize.min, children: rows),
      ),
    );
  }
}

/// Fila de lista: ícono o avatar, título, subtítulo, valor y chevron. Tocable
/// (con estado presionado y seleccionado) si tiene `onTap`.
class MmListRow extends StatefulWidget {
  const MmListRow({
    super.key,
    required this.title,
    this.subtitle,
    this.leading,
    this.trailing,
    this.onTap,
    this.selected = false,
    this.semanticLabel,
    this.titleMaxLines = 1,
    this.subtitleMaxLines = 1,
  });

  final String title;
  final int titleMaxLines;
  final int subtitleMaxLines;
  final String? subtitle;
  final Widget? leading;
  final Widget? trailing;
  final VoidCallback? onTap;

  /// Fila elegida en la vista maestro-detalle (tablet/web).
  final bool selected;
  final String? semanticLabel;

  @override
  State<MmListRow> createState() => _MmListRowState();
}

class _MmListRowState extends State<MmListRow> {
  bool _pressed = false;
  bool _hover = false;

  @override
  Widget build(BuildContext context) {
    final bg = widget.selected
        ? MmColors.primaryTint
        : _pressed
        ? MmColors.fill
        : _hover
        ? const Color(0xFFF8F9FB)
        : MmColors.surface;
    final content = AnimatedContainer(
      duration: MmMotion.press,
      color: bg,
      constraints: const BoxConstraints(minHeight: 60),
      padding: const EdgeInsets.symmetric(horizontal: MmSpace.l, vertical: MmSpace.m),
      child: Row(
        children: [
          if (widget.leading != null) ...[widget.leading!, const SizedBox(width: MmSpace.m)],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  widget.title,
                  maxLines: widget.titleMaxLines,
                  overflow: TextOverflow.ellipsis,
                  style: MmType.body.copyWith(
                    fontWeight: FontWeight.w500,
                    color: widget.selected ? MmColors.primaryText : MmColors.ink,
                  ),
                ),
                if (widget.subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    widget.subtitle!,
                    maxLines: widget.subtitleMaxLines,
                    overflow: TextOverflow.ellipsis,
                    style: MmType.footnote.copyWith(color: MmColors.inkSecondary),
                  ),
                ],
              ],
            ),
          ),
          if (widget.trailing != null) ...[const SizedBox(width: MmSpace.s), widget.trailing!],
          if (widget.onTap != null) ...[
            const SizedBox(width: MmSpace.s),
            const Icon(CupertinoIcons.chevron_right, size: 16, color: Color(0xFFB4BAC4)),
          ],
        ],
      ),
    );
    if (widget.onTap == null) return content;
    return Semantics(
      button: true,
      selected: widget.selected,
      label: widget.semanticLabel,
      child: InkWell(
        onTap: widget.onTap,
        onHighlightChanged: (v) => setState(() => _pressed = v),
        onHover: (v) => setState(() => _hover = v),
        splashFactory: NoSplash.splashFactory,
        highlightColor: Colors.transparent,
        focusColor: MmColors.primary.withValues(alpha: 0.08),
        child: content,
      ),
    );
  }
}

/// Avatar con iniciales (clientes, cuenta).
class MmAvatar extends StatelessWidget {
  const MmAvatar(this.name, {super.key, this.size = 40});

  final String name;
  final double size;

  @override
  Widget build(BuildContext context) {
    return ExcludeSemantics(
      child: Container(
        width: size,
        height: size,
        alignment: Alignment.center,
        decoration: const BoxDecoration(color: MmColors.primaryTintHover, shape: BoxShape.circle),
        child: Text(
          Fmt.initials(name),
          style: MmType.headline.copyWith(fontSize: size * 0.38, color: MmColors.primaryText),
        ),
      ),
    );
  }
}

/// Ícono en cuadro redondeado (filas de vehículos, ajustes).
class MmIconTile extends StatelessWidget {
  const MmIconTile(
    this.icon, {
    super.key,
    this.size = 40,
    this.color = MmColors.primary,
    this.bg = MmColors.primaryTint,
  });

  final IconData icon;
  final double size;
  final Color color;
  final Color bg;

  @override
  Widget build(BuildContext context) {
    return ExcludeSemantics(
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(size * 0.3)),
        child: Icon(icon, size: size * 0.5, color: color),
      ),
    );
  }
}

/// Placa dominicana como "chapa": letras grandes, borde, fácil de reconocer.
class MmPlate extends StatelessWidget {
  const MmPlate(this.plate, {super.key});

  final String plate;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Placa $plate',
      excludeSemantics: true,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: MmColors.surface,
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: MmColors.fieldBorder, width: 1.5),
        ),
        child: Text(
          plate,
          style: MmType.footnote.copyWith(fontWeight: FontWeight.w700, letterSpacing: 1.2, color: MmColors.ink),
        ),
      ),
    );
  }
}
