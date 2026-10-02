import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../features/auth/session_screens.dart';
import '../features/auth/welcome_screen.dart';
import '../features/home/home_screen.dart';
import '../features/onboarding/create_shop_screen.dart';
import '../features/shell/placeholder_screens.dart';
import '../ui/widgets/app_shell.dart';
import 'auth/session.dart';

/// Rutas fuera del taller (no requieren tener uno).
abstract final class Routes {
  static const loading = '/cargando';
  static const offline = '/sin-conexion';
  static const welcome = '/bienvenida';
  static const createShop = '/crear-taller';
  static const home = '/inicio';
  static const gates = {loading, offline, welcome, createShop};
}

/// A dónde debe estar el usuario según la sesión; `null` = dentro del taller.
String? gateFor(AsyncValue<Session> session) => switch (session) {
  AsyncData(value: SignedOut()) => Routes.welcome,
  AsyncData(value: SignedIn(shop: null)) => Routes.createShop,
  AsyncData(value: SignedIn()) => null,
  AsyncError() => Routes.offline,
  _ => Routes.loading,
};

/// Rutas. Cada destino principal es una rama con su propia pila (volver a
/// una pestaña conserva dónde estabas; tocarla de nuevo vuelve a su inicio).
final routerProvider = Provider<GoRouter>((ref) {
  final refresh = ValueNotifier<int>(0);
  ref
    ..listen(sessionProvider, (_, _) => refresh.value++)
    ..onDispose(refresh.dispose);

  return GoRouter(
    initialLocation: Routes.home,
    refreshListenable: refresh,
    redirect: (context, state) {
      final gate = gateFor(ref.read(sessionProvider));
      final here = state.matchedLocation;
      if (gate == null) return Routes.gates.contains(here) ? Routes.home : null;
      return here == gate ? null : gate;
    },
    routes: [
      GoRoute(path: Routes.loading, builder: (context, state) => const LoadingScreen()),
      GoRoute(path: Routes.offline, builder: (context, state) => const OfflineScreen()),
      GoRoute(path: Routes.welcome, builder: (context, state) => const WelcomeScreen()),
      GoRoute(path: Routes.createShop, builder: (context, state) => const CreateShopScreen()),
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => AppShell(
          currentIndex: shell.currentIndex,
          onSelect: (i) => shell.goBranch(i, initialLocation: i == shell.currentIndex),
          child: shell,
        ),
        branches: [
          StatefulShellBranch(
            routes: [GoRoute(path: Routes.home, builder: (context, state) => const HomeScreen())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: '/ordenes', builder: (context, state) => const OrdersPlaceholder())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: '/clientes', builder: (context, state) => const CustomersPlaceholder())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: '/cobros', builder: (context, state) => const BillingPlaceholder())],
          ),
          StatefulShellBranch(
            routes: [GoRoute(path: '/taller', builder: (context, state) => const ShopPlaceholder())],
          ),
        ],
      ),
    ],
  );
});
