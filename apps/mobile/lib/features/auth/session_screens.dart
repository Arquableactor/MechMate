import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/auth/session.dart';
import '../../ui/theme.dart';
import '../../ui/tokens.dart';
import '../../ui/widgets/app_shell.dart';
import '../../ui/widgets/state_views.dart';

/// Mientras se restaura la sesión. Si tarda (la API en Render "despierta"),
/// lo explica en vez de dejar al usuario mirando un spinner.
class LoadingScreen extends StatefulWidget {
  const LoadingScreen({super.key});

  static const slowAfter = Duration(seconds: 6);

  @override
  State<LoadingScreen> createState() => _LoadingScreenState();
}

class _LoadingScreenState extends State<LoadingScreen> {
  Timer? _timer;
  bool _slow = false;

  @override
  void initState() {
    super.initState();
    _timer = Timer(LoadingScreen.slowAfter, () => setState(() => _slow = true));
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(MmSpace.x3),
          child: Semantics(
            liveRegion: true,
            label: _slow ? 'Conectando. La primera conexión del día puede tardar hasta un minuto.' : 'Conectando',
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const MmLogo(size: 44),
                const SizedBox(height: MmSpace.x3),
                const SizedBox.square(dimension: 22, child: CircularProgressIndicator(strokeWidth: 2.4)),
                const SizedBox(height: MmSpace.l),
                AnimatedOpacity(
                  opacity: _slow ? 1 : 0,
                  duration: MmMotion.state,
                  child: Text(
                    'La primera conexión del día puede tardar hasta un minuto.',
                    textAlign: TextAlign.center,
                    style: MmType.footnote.copyWith(color: MmColors.inkSecondary),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// No se pudo cargar la sesión (sin red, API caída): error con salida.
class OfflineScreen extends ConsumerWidget {
  const OfflineScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(body: MmErrorState(onRetry: () => ref.invalidate(sessionProvider)));
  }
}
