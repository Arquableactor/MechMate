import 'package:web/web.dart' as web;

/// Quita `?code=…&state=…` (regreso de Auth0) de la barra de direcciones sin
/// recargar: conserva la ruta y el `#/…` de la app.
void cleanAuthRedirectFromUrl() {
  final location = web.window.location;
  final query = Uri.splitQueryString(location.search.replaceFirst('?', ''));
  if (!query.containsKey('code') && !query.containsKey('error')) return;
  web.window.history.replaceState(null, '', '${location.pathname}${location.hash}');
}
