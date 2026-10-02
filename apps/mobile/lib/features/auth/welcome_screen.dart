import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/auth/session.dart';
import '../../ui/theme.dart';
import '../../ui/tokens.dart';
import '../../ui/widgets/app_shell.dart';
import '../../ui/widgets/mm_button.dart';

/// Bienvenida: qué es MechMate en tres líneas y una sola acción principal.
class WelcomeScreen extends ConsumerStatefulWidget {
  const WelcomeScreen({super.key});

  @override
  ConsumerState<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends ConsumerState<WelcomeScreen> {
  /// Qué botón está esperando a Auth0 (evita dobles toques).
  bool? _busySignup;

  Future<void> _start({required bool signup}) async {
    setState(() => _busySignup = signup);
    try {
      await ref.read(sessionProvider.notifier).login(signup: signup);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('No se pudo abrir el inicio de sesión. Inténtalo de nuevo.')));
      }
    } finally {
      if (mounted) setState(() => _busySignup = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(sessionProvider).value;
    final notice = session is SignedOut ? session.notice : null;
    final busy = _busySignup != null;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(MmSpace.xxl),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Align(alignment: Alignment.centerLeft, child: MmLogo(size: 44)),
                  const SizedBox(height: MmSpace.x4),
                  Semantics(header: true, child: const Text('Tu taller, en orden.', style: MmType.largeTitle)),
                  const SizedBox(height: MmSpace.s),
                  Text(
                    'Órdenes, inspecciones y cobros en un solo lugar.',
                    style: MmType.body.copyWith(color: MmColors.inkSecondary),
                  ),
                  const SizedBox(height: MmSpace.x3),
                  const _Feature(
                    icon: CupertinoIcons.wrench_fill,
                    text: 'Órdenes de trabajo claras, con totales e ITBIS',
                  ),
                  const _Feature(
                    icon: CupertinoIcons.camera_fill,
                    text: 'Inspección con fotos y aprobación del cliente',
                  ),
                  const _Feature(
                    icon: CupertinoIcons.creditcard_fill,
                    text: 'Cobro con tarjeta, efectivo o transferencia',
                  ),
                  const SizedBox(height: MmSpace.x3),
                  if (notice != null) ...[_Notice(notice), const SizedBox(height: MmSpace.l)],
                  MmButton(
                    label: 'Iniciar sesión',
                    loading: _busySignup == false,
                    onPressed: busy ? null : () => _start(signup: false),
                  ),
                  const SizedBox(height: MmSpace.s),
                  MmButton.ghost(
                    label: 'Crear una cuenta',
                    expand: true,
                    loading: _busySignup == true,
                    onPressed: busy ? null : () => _start(signup: true),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Feature extends StatelessWidget {
  const _Feature({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: MmSpace.m),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(color: MmColors.primaryTint, borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, size: 20, color: MmColors.primary),
          ),
          const SizedBox(width: MmSpace.m),
          Expanded(child: Text(text, style: MmType.subhead)),
        ],
      ),
    );
  }
}

class _Notice extends StatelessWidget {
  const _Notice(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      liveRegion: true,
      child: Container(
        padding: const EdgeInsets.all(MmSpace.m),
        decoration: BoxDecoration(color: MmColors.primaryTint, borderRadius: BorderRadius.circular(MmRadius.control)),
        child: Row(
          children: [
            const Icon(CupertinoIcons.info_circle_fill, size: 20, color: MmColors.primaryText),
            const SizedBox(width: MmSpace.s),
            Expanded(
              child: Text(text, style: MmType.footnote.copyWith(color: MmColors.primaryText)),
            ),
          ],
        ),
      ),
    );
  }
}
