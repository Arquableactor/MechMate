import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mechmate_api/mechmate_api.dart';

import '../api.dart';
import 'auth_service.dart';

/// Quién está usando la app y en qué taller.
sealed class Session {
  const Session();
}

class SignedOut extends Session {
  const SignedOut({this.notice});

  /// Aviso para la pantalla de bienvenida (p. ej. sesión expirada).
  final String? notice;
}

class SignedIn extends Session {
  const SignedIn({required this.me, required this.shops});

  final MeResponse me;
  final List<ShopView> shops;

  /// Taller activo (por ahora el primero; el selector llega con multi-taller).
  ShopView? get shop => shops.isEmpty ? null : shops.first;

  /// "Ana" de "Ana Rosario"; si no hay nombre, null (la UI dice solo "Hola").
  String? get firstName {
    final name = me.fullName?.trim();
    if (name == null || name.isEmpty) return null;
    return name.split(RegExp(r'\s+')).first;
  }
}

const sessionExpiredNotice = 'Tu sesión expiró. Inicia sesión de nuevo.';

final sessionProvider = AsyncNotifierProvider<SessionController, Session>(SessionController.new);

/// Sesión: Auth0 (identidad) + `/v1/me` (cuenta) + `/v1/shops/mine` (talleres).
class SessionController extends AsyncNotifier<Session> {
  AuthService get _auth => ref.read(authServiceProvider);
  MechmateApi get _api => ref.read(apiProvider);

  @override
  Future<Session> build() async {
    try {
      if (!await _auth.restore()) return const SignedOut();
    } on AuthFailure catch (e) {
      // Error de Auth0 (no de red): de vuelta a la bienvenida con el motivo.
      return SignedOut(notice: 'No se pudo iniciar sesión: ${e.message}');
    }
    return _load();
  }

  Future<Session> _load() async {
    try {
      final me = (await _api.getMeApi().meGetMe()).data!;
      final shops = (await _api.getShopsApi().shopsMine()).data!;
      return SignedIn(me: me, shops: shops);
    } on DioException catch (e) {
      // Token vencido o revocado: a iniciar sesión (no es un error de red).
      if (e.response?.statusCode == 401) return const SignedOut(notice: sessionExpiredNotice);
      debugPrint(
        'Sesión: no se pudo cargar ${e.requestOptions.path}: ${e.type} ${e.response?.statusCode ?? ''} ${e.error ?? ''}',
      );
      rethrow;
    }
  }

  Future<void> login({bool signup = false}) async {
    await _auth.login(signup: signup);
    // Móvil: el login ya terminó. Web: la página se fue a Auth0 (no llega aquí).
    if (await _auth.accessToken() == null) return;
    state = const AsyncLoading();
    state = await AsyncValue.guard(_load);
  }

  /// Onboarding: crea el taller (la API deja al usuario como dueño).
  Future<void> createShop(String name) async {
    final current = state.value;
    if (current is! SignedIn) return;
    final shop = (await _api.getShopsApi().shopsCreate(createShopDto: CreateShopDto(name: name.trim()))).data!;
    state = AsyncData(SignedIn(me: current.me, shops: [shop, ...current.shops]));
  }

  Future<void> logout() async {
    await _auth.logout();
    state = const AsyncData(SignedOut());
  }

  /// La API respondió 401 con sesión abierta (ver el interceptor de `api.dart`).
  void expire() {
    if (state.value is SignedIn) state = const AsyncData(SignedOut(notice: sessionExpiredNotice));
  }
}
