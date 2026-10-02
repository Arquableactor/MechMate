import 'package:auth0_flutter/auth0_flutter.dart';
import 'package:auth0_flutter/auth0_flutter_web.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config.dart';
import 'url_cleanup.dart';

/// Identidad del usuario (Auth0). La app solo necesita: restaurar la sesión,
/// iniciar/cerrar sesión y un access token vigente para la API.
abstract interface class AuthService {
  /// Restaura la sesión guardada (en web, también procesa el regreso del
  /// login). `true` = hay sesión.
  Future<bool> restore();

  /// Abre el login de Auth0 (`signup`: directo a crear cuenta). En web la
  /// página se va a Auth0 y vuelve; en móvil el Future termina al volver.
  Future<void> login({bool signup = false});

  Future<void> logout();

  /// Access token para la API, renovado si hace falta. `null` = sin sesión.
  Future<String?> accessToken();
}

final authServiceProvider = Provider<AuthService>((ref) => Auth0AuthService());

const _scopes = {'openid', 'profile', 'email', 'offline_access'};

/// Auth0 Universal Login. Web: tokens en localStorage con refresh tokens
/// rotativos (sobrevive recargas sin cookies de terceros). Android/iOS:
/// Keystore/Keychain vía el CredentialsManager del SDK.
class Auth0AuthService implements AuthService {
  Auth0AuthService()
    : _web = kIsWeb
          ? Auth0Web(
              AppConfig.auth0Domain,
              AppConfig.auth0ClientId,
              redirectUrl: Uri.base.origin,
              cacheLocation: CacheLocation.localStorage,
            )
          : null,
      _mobile = kIsWeb ? null : Auth0(AppConfig.auth0Domain, AppConfig.auth0ClientId);

  final Auth0Web? _web;
  final Auth0? _mobile;

  WebAuthentication get _webAuth => _mobile!.webAuthentication(scheme: AppConfig.androidAuthScheme);

  @override
  Future<bool> restore() async {
    final web = _web;
    if (web != null) {
      final credentials = await web.onLoad(audience: AppConfig.auth0Audience, scopes: _scopes, useRefreshTokens: true);
      // El regreso de Auth0 deja ?code=…&state=… en la URL: recargar con eso falla.
      cleanAuthRedirectFromUrl();
      return credentials != null;
    }
    return _mobile!.credentialsManager.hasValidCredentials();
  }

  @override
  Future<void> login({bool signup = false}) async {
    final parameters = signup ? const {'screen_hint': 'signup'} : const <String, String>{};
    final web = _web;
    if (web != null) {
      await web.loginWithRedirect(
        audience: AppConfig.auth0Audience,
        redirectUrl: Uri.base.origin,
        scopes: _scopes,
        parameters: parameters,
      );
      return;
    }
    await _webAuth.login(audience: AppConfig.auth0Audience, scopes: _scopes, parameters: parameters);
  }

  @override
  Future<void> logout() async {
    final web = _web;
    if (web != null) return web.logout(returnToUrl: Uri.base.origin);
    await _webAuth.logout();
  }

  @override
  Future<String?> accessToken() async {
    try {
      final web = _web;
      if (web != null) {
        if (!await web.hasValidCredentials()) return null;
        return (await web.credentials(audience: AppConfig.auth0Audience)).accessToken;
      }
      final manager = _mobile!.credentialsManager;
      if (!await manager.hasValidCredentials()) return null;
      return (await manager.credentials()).accessToken;
    } catch (error) {
      // Renovación fallida (refresh token revocado, sin red…): sin token; la
      // API responde 401 y la app pide iniciar sesión de nuevo.
      debugPrint('Auth: no se pudo obtener el token ($error)');
      return null;
    }
  }
}
