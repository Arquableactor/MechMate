import type { PublicApprovalView } from '@repo/types';
import { esc, pageHeaders, renderApprovalPage, renderErrorPage } from './approval-page';

const XSS = '<script>alert(1)</script><img src=x onerror=alert(2)>';

const view = (over: Partial<PublicApprovalView> = {}): PublicApprovalView => ({
  status: 'pending',
  expires_at: '2026-10-06T16:00:00.000Z',
  shop_name: 'Taller Hermanos Pérez',
  work_order_code: 'OT-0001',
  vehicle: 'Toyota Corolla 2019 (A482901)',
  customer_first_name: 'María',
  currency: 'DOP',
  findings: [
    { area: 'Frenos', title: 'Pastillas al 20%', severity: 'urgent', notes: null, photo_urls: ['https://r2.example/f.jpg?X-Amz-Signature=abc'] },
  ],
  items: [
    { id: 'i1', type: 'labor', description: 'Diagnóstico', quantity: '1', total_cents: '100000', approval_status: 'approved' },
    { id: 'i2', type: 'part', description: 'Pastillas', quantity: '1', total_cents: '413000', approval_status: 'proposed' },
  ],
  subtotal_cents: '450000',
  tax_cents: '63000',
  total_cents: '513000',
  ...over,
});

describe('página de aprobación', () => {
  it('esc() neutraliza HTML y comillas', () => {
    expect(esc(`<a href="x" onclick='y'>&</a>`)).toBe('&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;');
  });

  it('pendiente: saludo, vehículo, hallazgo con foto, montos RD$, opciones y botón', () => {
    const html = renderApprovalPage(view(), 'tok.en', 'NONCE');
    expect(html).toContain('Hola María, este es el presupuesto de tu vehículo');
    expect(html).toContain('Toyota Corolla 2019 (A482901)');
    expect(html).toContain('Urgente');
    expect(html).toContain('src="https://r2.example/f.jpg?X-Amz-Signature=abc"');
    expect(html).toContain('RD$5,130.00');
    expect(html).toContain('data-item="i2"');
    expect(html).not.toContain('data-item="i1"'); // la ya aprobada no se decide
    expect(html).toContain('Enviar mi respuesta');
    expect(html).toContain('<script nonce="NONCE">');
    expect(html).toContain('"tok.en"'); // token como literal JSON dentro del script
  });

  it('SEGURIDAD: todo dato de la DB se escapa (sin HTML/JS inyectado)', () => {
    const html = renderApprovalPage(
      view({
        shop_name: XSS,
        customer_first_name: XSS,
        vehicle: XSS,
        findings: [{ area: XSS, title: XSS, severity: 'ok', notes: XSS, photo_urls: [`https://x/"onerror="alert(3)`] }],
        items: [{ id: `"><script>x</script>`, type: 'part', description: XSS, quantity: '1', total_cents: '1', approval_status: 'proposed' }],
      }),
      't',
      'N',
    );
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<img src=x');
    expect(html).not.toContain('"onerror="');
    expect(html).not.toContain('"><script>x');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    // Solo hay un <script>: el nuestro, con nonce.
    expect(html.match(/<script/g)).toHaveLength(1);
  });

  it('completada / revocada / vencida: mensaje y sin botón ni script', () => {
    for (const [status, text] of [
      ['completed', 'Recibimos tu respuesta'],
      ['revoked', 'ya no está activo'],
      ['expired', 'venció'],
    ] as const) {
      const html = renderApprovalPage(view({ status }), 't', 'N');
      expect(html).toContain(text);
      expect(html).not.toContain('Enviar mi respuesta');
      expect(html).not.toContain('<script');
    }
  });

  it('página de error: mensaje escapado', () => {
    expect(renderErrorPage(XSS, 'N')).toContain('&lt;script&gt;');
  });

  it('encabezados: sin Referer (el token está en la URL), CSP con nonce, no embebible, no cache', () => {
    const h = pageHeaders('N0NCE');
    expect(h['Referrer-Policy']).toBe('no-referrer');
    expect(h['Cache-Control']).toBe('no-store');
    expect(h['X-Robots-Tag']).toContain('noindex');
    expect(h['Content-Security-Policy']).toContain("script-src 'nonce-N0NCE'");
    expect(h['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(h['Content-Security-Policy']).toContain("default-src 'none'");
  });
});
