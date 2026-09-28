import type { InvitableShopRole } from '@repo/types';
import type { RenderedMessage } from './payment-templates';

const ROLE_LABEL: Record<InvitableShopRole, string> = {
  mechanic: 'mecánico',
  advisor: 'asesor de servicio',
};

/**
 * Invitación a un taller. Dos variantes: ya tenía cuenta verificada (entró al
 * instante) o todavía debe iniciar sesión con este email.
 */
export function shopInvitation(p: {
  shopName: string;
  role: InvitableShopRole;
  email: string;
  status: 'invited' | 'active';
  invitedByName: string | null;
}): RenderedMessage {
  const who = p.invitedByName ?? 'El dueño del taller';
  const role = ROLE_LABEL[p.role];

  if (p.status === 'active') {
    return {
      template: 'shop_member_added',
      subject: `Te agregaron a ${p.shopName} en MechMate`,
      body:
        `Hola,\n\n${who} te agregó a ${p.shopName} como ${role}.\n\n` +
        `Ya tienes acceso: abre MechMate y verás el taller en tu lista.\n\n— MechMate`,
    };
  }
  return {
    template: 'shop_invitation',
    subject: `Te invitaron a ${p.shopName} en MechMate`,
    body:
      `Hola,\n\n${who} te invitó a unirte a ${p.shopName} como ${role}.\n\n` +
      `Para aceptar, descarga MechMate e inicia sesión con este mismo email (${p.email}). ` +
      `Si te pide confirmar tu email, hazlo: la invitación se activa con el email verificado.\n\n` +
      `Si no esperabas esta invitación, ignora este mensaje.\n\n— MechMate`,
  };
}
