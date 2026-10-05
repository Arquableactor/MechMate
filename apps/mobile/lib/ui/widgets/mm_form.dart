import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import '../theme.dart';
import '../tokens.dart';
import 'mm_button.dart';

/// Formulario a pantalla completa (hoja de iOS): "Cancelar" arriba, título,
/// campos con scroll y la acción principal ABAJO, siempre por encima del
/// teclado (al alcance del pulgar).
class MmFormScaffold extends StatelessWidget {
  const MmFormScaffold({
    super.key,
    required this.title,
    required this.children,
    required this.submitLabel,
    required this.onSubmit,
    this.submitting = false,
  });

  final String title;
  final List<Widget> children;
  final String submitLabel;
  final VoidCallback? onSubmit;
  final bool submitting;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leadingWidth: 110,
        leading: TextButton(
          onPressed: submitting ? null : () => Navigator.of(context).maybePop(),
          style: TextButton.styleFrom(foregroundColor: MmColors.primaryText, splashFactory: NoSplash.splashFactory),
          child: const Text('Cancelar'),
        ),
        title: Text(title),
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Align(
                alignment: Alignment.topCenter,
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 560),
                  child: ListView(
                    keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
                    padding: const EdgeInsets.fromLTRB(
                      MmSpace.gutterPhone,
                      MmSpace.s,
                      MmSpace.gutterPhone,
                      MmSpace.xxl,
                    ),
                    children: children,
                  ),
                ),
              ),
            ),
            Container(
              decoration: const BoxDecoration(
                color: MmColors.background,
                border: Border(top: BorderSide(color: MmColors.separator)),
              ),
              padding: const EdgeInsets.fromLTRB(MmSpace.gutterPhone, MmSpace.m, MmSpace.gutterPhone, MmSpace.m),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 520),
                  child: MmButton(label: submitLabel, loading: submitting, onPressed: onSubmit),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Grupo de campos con título pequeño (como las secciones de Ajustes de iOS).
class MmFieldGroup extends StatelessWidget {
  const MmFieldGroup({super.key, required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: MmSpace.l),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: MmSpace.xs, bottom: MmSpace.s),
            child: Semantics(
              header: true,
              child: Text(
                title.toUpperCase(),
                style: MmType.caption.copyWith(color: MmColors.inkSecondary, letterSpacing: 0.6),
              ),
            ),
          ),
          for (var i = 0; i < children.length; i++) ...[if (i > 0) const SizedBox(height: MmSpace.m), children[i]],
        ],
      ),
    );
  }
}

enum MmNoticeTone { info, success, warning, error }

/// Aviso en línea (resultado del VIN, conflicto al guardar…), con acción opcional.
class MmNotice extends StatelessWidget {
  const MmNotice(this.text, {super.key, this.tone = MmNoticeTone.info, this.title, this.actionLabel, this.onAction});

  final String text;
  final String? title;
  final MmNoticeTone tone;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final (bg, fg, icon) = switch (tone) {
      MmNoticeTone.info => (MmColors.primaryTint, MmColors.primaryText, CupertinoIcons.info_circle_fill),
      MmNoticeTone.success => (MmColors.successTint, MmColors.successText, CupertinoIcons.checkmark_seal_fill),
      MmNoticeTone.warning => (
        const Color(0xFFFFF4E0),
        const Color(0xFF8A4B00),
        CupertinoIcons.exclamationmark_triangle_fill,
      ),
      MmNoticeTone.error => (MmColors.dangerTint, MmColors.dangerText, CupertinoIcons.exclamationmark_circle_fill),
    };
    return Semantics(
      liveRegion: true,
      child: Container(
        padding: const EdgeInsets.all(MmSpace.m),
        decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(MmRadius.control)),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 20, color: fg),
            const SizedBox(width: MmSpace.s),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (title != null) ...[
                    Text(
                      title!,
                      style: MmType.subhead.copyWith(color: fg, fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 2),
                  ],
                  Text(text, style: MmType.footnote.copyWith(color: fg)),
                  if (actionLabel != null && onAction != null)
                    TextButton(
                      onPressed: onAction,
                      style: TextButton.styleFrom(
                        foregroundColor: fg,
                        padding: EdgeInsets.zero,
                        minimumSize: const Size(44, 36),
                        tapTargetSize: MaterialTapTargetSize.padded,
                      ),
                      child: Text(actionLabel!, style: const TextStyle(fontWeight: FontWeight.w600)),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
