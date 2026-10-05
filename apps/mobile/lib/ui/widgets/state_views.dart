import 'package:flutter/cupertino.dart';

import '../theme.dart';
import '../tokens.dart';
import 'mm_button.dart';

/// Estado vacío: ícono, título, explicación breve y (opcional) la acción que lo resuelve.
class MmEmptyState extends StatelessWidget {
  const MmEmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.actionLabel,
    this.onAction,
  });

  final IconData icon;
  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return _Centered(
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(color: MmColors.primaryTint, borderRadius: BorderRadius.circular(20)),
          child: Icon(icon, size: 30, color: MmColors.primary),
        ),
        const SizedBox(height: MmSpace.l),
        Text(title, style: MmType.title3, textAlign: TextAlign.center),
        const SizedBox(height: MmSpace.s),
        Text(
          message,
          style: MmType.subhead.copyWith(color: MmColors.inkSecondary),
          textAlign: TextAlign.center,
        ),
        if (actionLabel != null && onAction != null) ...[
          const SizedBox(height: MmSpace.xxl),
          MmButton.secondary(label: actionLabel!, onPressed: onAction, expand: false),
        ],
      ],
    );
  }
}

/// Error con salida: qué pasó en palabras humanas y un "Reintentar".
class MmErrorState extends StatelessWidget {
  const MmErrorState({
    super.key,
    this.title = 'No pudimos conectar',
    this.message = 'Revisa tu conexión a internet e inténtalo de nuevo.',
    required this.onRetry,
    this.detail,
  });

  final String title;
  final String message;
  final VoidCallback onRetry;

  /// Detalle técnico (solo en desarrollo): debajo del botón, para no taparlo.
  final String? detail;

  @override
  Widget build(BuildContext context) {
    return _Centered(
      children: [
        Container(
          width: 64,
          height: 64,
          decoration: BoxDecoration(color: MmColors.dangerTint, borderRadius: BorderRadius.circular(20)),
          child: const Icon(CupertinoIcons.wifi_slash, size: 28, color: MmColors.dangerText),
        ),
        const SizedBox(height: MmSpace.l),
        Text(title, style: MmType.title3, textAlign: TextAlign.center),
        const SizedBox(height: MmSpace.s),
        Text(
          message,
          style: MmType.subhead.copyWith(color: MmColors.inkSecondary),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: MmSpace.xxl),
        MmButton(label: 'Reintentar', icon: CupertinoIcons.arrow_clockwise, onPressed: onRetry, expand: false),
        if (detail != null) ...[
          const SizedBox(height: MmSpace.l),
          Text(
            detail!,
            maxLines: 4,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: MmType.caption.copyWith(color: MmColors.inkTertiary),
          ),
        ],
      ],
    );
  }
}

/// Bloque de carga (esqueleto) con brillo suave; quieto si el usuario pidió
/// reducir el movimiento. Preferido sobre spinners a pantalla completa.
class MmSkeleton extends StatefulWidget {
  const MmSkeleton({super.key, this.width, required this.height, this.radius = MmRadius.chip});

  final double? width;
  final double height;
  final double radius;

  @override
  State<MmSkeleton> createState() => _MmSkeletonState();
}

class _MmSkeletonState extends State<MmSkeleton> with SingleTickerProviderStateMixin {
  late final _controller = AnimationController(vsync: this, duration: const Duration(milliseconds: 1400));

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (MediaQuery.disableAnimationsOf(context)) {
      _controller.stop();
    } else if (!_controller.isAnimating) {
      _controller.repeat();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ExcludeSemantics(
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, _) {
          final t = _controller.value * 2 - 1;
          return Container(
            width: widget.width,
            height: widget.height,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(widget.radius),
              gradient: LinearGradient(
                begin: Alignment(-1 + t, 0),
                end: Alignment(1 + t, 0),
                colors: const [Color(0xFFEEF0F3), Color(0xFFF7F8FA), Color(0xFFEEF0F3)],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _Centered extends StatelessWidget {
  const _Centered({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(MmSpace.x3),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 360),
          child: Column(mainAxisSize: MainAxisSize.min, children: children),
        ),
      ),
    );
  }
}
