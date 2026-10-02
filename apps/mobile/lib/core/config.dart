/// Configuración de compilación: `flutter run --dart-define=CLAVE=valor`.
/// Ninguno de estos valores es secreto (van dentro de la app).
abstract final class AppConfig {
  /// Raíz de la API (sin `/v1`: las rutas del contrato ya lo incluyen).
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://automecanica-api.onrender.com',
  );

  /// Tenant de Auth0.
  static const auth0Domain = String.fromEnvironment('AUTH0_DOMAIN', defaultValue: 'arquableactor.us.auth0.com');

  /// Client ID de la aplicación de Auth0 (público). El valor por defecto es la
  /// app "MechMate App (web)" (Single Page Application). Para Android/iOS se
  /// pasa el de una app Native: `--dart-define=AUTH0_CLIENT_ID=...`.
  static const auth0ClientId = String.fromEnvironment(
    'AUTH0_CLIENT_ID',
    defaultValue: 'bAR8dgf3aiUEjTIhHBb6zK2Da8taVrCG',
  );

  /// Identificador de la API en Auth0: el token sale con esta audiencia.
  static const auth0Audience = String.fromEnvironment('AUTH0_AUDIENCE', defaultValue: 'https://api.automecanica.do');

  /// Esquema de retorno del login en Android (= `auth0Scheme` del manifest).
  static const androidAuthScheme = 'com.mechmate.mechmate';
}
