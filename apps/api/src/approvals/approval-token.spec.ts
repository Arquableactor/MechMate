import { signApprovalToken, verifyApprovalToken } from './approval-token';

const ID = '01920000-0000-7000-8000-00000000abcd';
const SECRET = 'secreto-de-prueba-32-bytes-o-mas!!';

describe('token de aprobación (HMAC)', () => {
  it('firma y verifica: devuelve el id', () => {
    const token = signApprovalToken(ID, SECRET);
    expect(token).toMatch(new RegExp(`^${ID}\\.[A-Za-z0-9_-]{43}$`));
    expect(verifyApprovalToken(token, SECRET)).toBe(ID);
  });

  it('SEGURIDAD: sin el secreto no se puede fabricar ni reusar para otro id', () => {
    const token = signApprovalToken(ID, SECRET);
    const otherId = '01920000-0000-7000-8000-00000000ffff';
    expect(verifyApprovalToken(token, 'otro-secreto')).toBeNull();
    expect(verifyApprovalToken(`${otherId}.${token.split('.')[1]}`, SECRET)).toBeNull();
    expect(verifyApprovalToken(signApprovalToken(otherId, 'adivinado'), SECRET)).toBeNull();
  });

  it.each(['', 'sin-punto', '.solo-firma', `${ID}.`, `${ID}.abc`, 'no-uuid.firmafirmafirma', `${ID}.${'a'.repeat(300)}`])(
    'token malformado → null: %p',
    (token) => {
      expect(verifyApprovalToken(token, SECRET)).toBeNull();
    },
  );

  it('un solo carácter cambiado en la firma lo invalida', () => {
    const token = signApprovalToken(ID, SECRET);
    const last = token.at(-1) === 'A' ? 'B' : 'A';
    expect(verifyApprovalToken(token.slice(0, -1) + last, SECRET)).toBeNull();
  });
});
