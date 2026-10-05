import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import '../theme.dart';
import '../tokens.dart';

/// Buscador estilo iOS: relleno gris, lupa, botón para borrar. Avisa del
/// texto con una pausa (`debounce`) para no consultar la API en cada tecla.
class MmSearchField extends StatefulWidget {
  const MmSearchField({
    super.key,
    required this.hint,
    required this.onChanged,
    this.debounce = const Duration(milliseconds: 300),
  });

  final String hint;
  final ValueChanged<String> onChanged;
  final Duration debounce;

  @override
  State<MmSearchField> createState() => _MmSearchFieldState();
}

class _MmSearchFieldState extends State<MmSearchField> {
  final _controller = TextEditingController();
  Timer? _timer;

  void _changed(String value) {
    setState(() {});
    _timer?.cancel();
    _timer = Timer(widget.debounce, () => widget.onChanged(value.trim()));
  }

  void _clear() {
    _controller.clear();
    _timer?.cancel();
    setState(() {});
    widget.onChanged('');
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme.bodyLarge!;
    final noBorder = OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none);
    return TextField(
      controller: _controller,
      onChanged: _changed,
      textInputAction: TextInputAction.search,
      style: text,
      decoration: InputDecoration(
        hintText: widget.hint,
        filled: true,
        fillColor: const Color(0xFFE9ECF0),
        isDense: true,
        contentPadding: const EdgeInsets.symmetric(vertical: 12),
        prefixIcon: const Icon(CupertinoIcons.search, size: 20, color: MmColors.inkTertiary),
        suffixIcon: _controller.text.isEmpty
            ? null
            : IconButton(
                tooltip: 'Borrar búsqueda',
                onPressed: _clear,
                icon: const Icon(CupertinoIcons.xmark_circle_fill, size: 18, color: MmColors.inkTertiary),
              ),
        border: noBorder,
        enabledBorder: noBorder,
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: MmColors.primary, width: 2),
        ),
        hintStyle: text.copyWith(color: MmColors.inkTertiary),
      ),
    );
  }
}

/// Botón redondo de 44 pt para acciones de la cabecera (`+ Nuevo cliente`).
class MmHeaderButton extends StatelessWidget {
  const MmHeaderButton({super.key, required this.icon, required this.label, required this.onPressed});

  final IconData icon;

  /// Para VoiceOver/TalkBack y como tooltip (el botón no tiene texto).
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: label,
      child: Semantics(
        button: true,
        label: label,
        excludeSemantics: true,
        child: Material(
          color: MmColors.primary,
          shape: const CircleBorder(),
          child: InkWell(
            customBorder: const CircleBorder(),
            splashFactory: NoSplash.splashFactory,
            highlightColor: MmColors.primaryPressed,
            onTap: onPressed,
            child: SizedBox.square(
              dimension: MmSpace.minTouch,
              child: Icon(icon, color: MmColors.surface, size: 22),
            ),
          ),
        ),
      ),
    );
  }
}

/// Texto de ayuda breve bajo una lista ("Toca un cliente para ver su historial").
class MmCaption extends StatelessWidget {
  const MmCaption(this.text, {super.key});

  final String text;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: MmSpace.xs, vertical: MmSpace.s),
    child: Text(text, style: MmType.footnote.copyWith(color: MmColors.inkSecondary)),
  );
}
