import 'package:flutter/cupertino.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mechmate_api/mechmate_api.dart';

import '../../core/api.dart';
import '../../core/auth/session.dart';
import '../../ui/theme.dart';
import '../../ui/tokens.dart';
import '../../ui/widgets/mm_button.dart';
import '../../ui/widgets/mm_card.dart';
import '../../ui/widgets/mm_page.dart';
import '../../ui/widgets/state_views.dart';

/// Estado de la API (`GET /v1/health`) con el cliente generado.
final healthProvider = FutureProvider.autoDispose<HealthStatus>((ref) async {
  final response = await ref.watch(apiProvider).getHealthApi().healthGetHealth();
  return response.data!;
});

/// Inicio del taller: saludo, taller activo y estado de la conexión.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final gutter = MmPage.gutterFor(MediaQuery.sizeOf(context).width);
    final session = ref.watch(sessionProvider).value;
    final signedIn = session is SignedIn ? session : null;
    final firstName = signedIn?.firstName;
    return MmPage(
      title: firstName == null ? 'Hola' : 'Hola, $firstName',
      subtitle: signedIn?.shop?.name ?? 'Así va tu taller hoy.',
      trailing: signedIn == null ? null : _AccountButton(session: signedIn),
      child: ListView(
        padding: EdgeInsets.fromLTRB(gutter, MmSpace.s, gutter, MmSpace.x4),
        children: [_ConnectionCard(health: ref.watch(healthProvider), onRetry: () => ref.invalidate(healthProvider))],
      ),
    );
  }
}

/// Avatar con iniciales → hoja de acciones (estilo iOS) con "Cerrar sesión".
class _AccountButton extends ConsumerWidget {
  const _AccountButton({required this.session});

  final SignedIn session;

  String get _initials {
    final source = session.me.fullName?.trim().isNotEmpty == true ? session.me.fullName! : (session.me.email ?? '?');
    final parts = source.split(RegExp(r'[\s@.]+')).where((p) => p.isNotEmpty).toList();
    return parts.take(2).map((p) => p[0].toUpperCase()).join();
  }

  Future<void> _open(BuildContext context, WidgetRef ref) async {
    final logout = await showCupertinoModalPopup<bool>(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: Text(session.me.fullName ?? session.me.email ?? 'Tu cuenta'),
        message: session.me.email == null ? null : Text(session.me.email!),
        actions: [
          CupertinoActionSheetAction(
            isDestructiveAction: true,
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Cerrar sesión'),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          isDefaultAction: true,
          onPressed: () => Navigator.of(context).pop(false),
          child: const Text('Cancelar'),
        ),
      ),
    );
    if (logout == true) await ref.read(sessionProvider.notifier).logout();
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Semantics(
      button: true,
      label: 'Tu cuenta',
      excludeSemantics: true,
      child: GestureDetector(
        onTap: () => _open(context, ref),
        child: Container(
          width: MmSpace.minTouch,
          height: MmSpace.minTouch,
          alignment: Alignment.center,
          decoration: const BoxDecoration(color: MmColors.primaryTintHover, shape: BoxShape.circle),
          child: Text(_initials, style: MmType.headline.copyWith(color: MmColors.primaryText)),
        ),
      ),
    );
  }
}

class _ConnectionCard extends StatelessWidget {
  const _ConnectionCard({required this.health, required this.onRetry});

  final AsyncValue<HealthStatus> health;
  final VoidCallback onRetry;

  static String _label(Object state) => switch (state.toString()) {
    'up' => 'en línea',
    'down' => 'caída',
    'disabled' => 'desactivadas',
    final other => other,
  };

  /// Todo en línea → una frase corta; si algo falla, se dice qué.
  static String _detail(HealthStatus h) => h.db.toString() == 'up' && h.redis.toString() == 'up'
      ? 'Base de datos y colas en línea'
      : 'Base de datos ${_label(h.db)} · Colas ${_label(h.redis)}';

  @override
  Widget build(BuildContext context) {
    return MmCard(
      child: switch (health) {
        AsyncData(:final value) => Row(
          children: [
            const _IconTile(
              icon: CupertinoIcons.checkmark_shield_fill,
              color: MmColors.success,
              bg: MmColors.successTint,
            ),
            const SizedBox(width: MmSpace.m),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Conectado a MechMate', style: MmType.headline),
                  const SizedBox(height: 2),
                  Text(_detail(value), style: MmType.footnote.copyWith(color: MmColors.inkSecondary)),
                ],
              ),
            ),
          ],
        ),
        AsyncError() => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const _IconTile(icon: CupertinoIcons.wifi_slash, color: MmColors.dangerText, bg: MmColors.dangerTint),
                const SizedBox(width: MmSpace.m),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('No pudimos conectar', style: MmType.headline),
                      const SizedBox(height: 2),
                      Text(
                        'Revisa tu conexión e inténtalo de nuevo.',
                        style: MmType.footnote.copyWith(color: MmColors.inkSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: MmSpace.m),
            MmButton.secondary(
              label: 'Reintentar',
              icon: CupertinoIcons.arrow_clockwise,
              onPressed: onRetry,
              // Ancho completo solo en teléfono (pulgar); en pantallas anchas, a su tamaño.
              expand: MediaQuery.sizeOf(context).width < MmBreakpoints.tablet,
            ),
          ],
        ),
        _ => Semantics(
          label: 'Conectando con MechMate',
          child: const Row(
            children: [
              MmSkeleton(width: 44, height: 44, radius: 14),
              SizedBox(width: MmSpace.m),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    MmSkeleton(width: 180, height: 16),
                    SizedBox(height: MmSpace.s),
                    MmSkeleton(width: 120, height: 12),
                  ],
                ),
              ),
            ],
          ),
        ),
      },
    );
  }
}

class _IconTile extends StatelessWidget {
  const _IconTile({required this.icon, required this.color, required this.bg});

  final IconData icon;
  final Color color;
  final Color bg;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(14)),
      child: Icon(icon, color: color, size: 22),
    );
  }
}
