/**
 * Auth0 Action — trigger "Login / Post Login".
 * Nombre en Auth0: "MechMate: claims de identidad".
 *
 * Los access tokens de Auth0 no traen email/nombre por defecto. La API los
 * necesita para el registro automático de cuentas y para reclamar invitaciones
 * a talleres (solo con email VERIFICADO). Auth0 exige un prefijo propio para
 * claims agregados: usamos el identifier de la API. La API los lee en
 * apps/api/src/auth/jwt.strategy.ts (CLAIMS_NAMESPACE).
 *
 * Esta copia versionada es la fuente de verdad: si se cambia en el panel de
 * Auth0, actualizar también este archivo.
 */
exports.onExecutePostLogin = async (event, api) => {
  const ns = 'https://api.automecanica.do/';
  const user = event.user;

  if (user.email) {
    api.accessToken.setCustomClaim(`${ns}email`, user.email);
    api.accessToken.setCustomClaim(`${ns}email_verified`, user.email_verified === true);
  }
  if (user.name) api.accessToken.setCustomClaim(`${ns}name`, user.name);
  if (user.phone_number) api.accessToken.setCustomClaim(`${ns}phone_number`, user.phone_number);
};
