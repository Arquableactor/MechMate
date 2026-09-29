import type { FindingSeverity, PublicApprovalView } from '@repo/types';
import { formatMoney } from '../common/money';

/**
 * Página que ve el CLIENTE en su teléfono al abrir el enlace de aprobación.
 * Se arma en el servidor (se ve sin JavaScript); JS solo para enviar las
 * decisiones. Estilo del prototipo de MechMate (docs de diseño del repo).
 * TODO lo que viene de la DB pasa por `esc()` antes de entrar al HTML.
 */

/** Escapa para HTML (texto y atributos). */
export function esc(value: unknown): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const SEVERITY: Record<FindingSeverity, { label: string; cls: string }> = {
  urgent: { label: 'Urgente', cls: 'sev-urgent' },
  attention: { label: 'Atención', cls: 'sev-attention' },
  ok: { label: 'Bien', cls: 'sev-ok' },
};

const ITEM_STATE: Record<PublicApprovalView['items'][number]['approval_status'], string> = {
  approved: 'Incluido',
  declined: 'No aprobado',
  proposed: 'Pendiente',
};

const STATUS_BANNER: Record<Exclude<PublicApprovalView['status'], 'pending'>, string> = {
  completed: '¡Gracias! Recibimos tu respuesta. El taller ya puede empezar con lo que aprobaste.',
  revoked: 'Este enlace ya no está activo. Pide al taller el enlace más reciente.',
  expired: 'Este enlace venció. Pide al taller que te envíe uno nuevo.',
};

/** Encabezados de la página. La URL lleva el token: nada debe filtrarlo. */
export function pageHeaders(nonce: string): Record<string, string> {
  return {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
    // Sin Referer: el token no viaja a R2 (fotos) ni a Google Fonts.
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow',
    'Content-Security-Policy': [
      "default-src 'none'",
      `script-src 'nonce-${nonce}'`,
      `style-src 'nonce-${nonce}' https://fonts.googleapis.com`,
      'font-src https://fonts.gstatic.com',
      'img-src https: data:',
      "connect-src 'self'",
      "base-uri 'none'",
      "form-action 'none'",
      "frame-ancestors 'none'",
    ].join('; '),
  };
}

function layout(title: string, nonce: string, body: string, script = ''): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="no-referrer">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" nonce="${nonce}">
<style nonce="${nonce}">${CSS}</style>
</head>
<body><main>${body}</main>${script ? `<script nonce="${nonce}">${script}</script>` : ''}</body>
</html>`;
}

export function renderApprovalPage(view: PublicApprovalView, token: string, nonce: string): string {
  const money = (cents: string) => formatMoney(BigInt(cents), view.currency);
  const pending = view.status === 'pending';
  const proposed = view.items.filter((i) => i.approval_status === 'proposed');

  const findings = view.findings.length
    ? `<section><h2>Lo que encontramos</h2>${view.findings
        .map(
          (f) => `<article class="card finding">
  <div class="row"><span class="mono muted">${esc(f.area)}</span><span class="chip ${SEVERITY[f.severity].cls}">${SEVERITY[f.severity].label}</span></div>
  <h3>${esc(f.title)}</h3>
  ${f.notes ? `<p class="muted">${esc(f.notes)}</p>` : ''}
  ${
    f.photo_urls.length
      ? `<div class="photos">${f.photo_urls
          .map((u) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer"><img src="${esc(u)}" alt="Foto: ${esc(f.title)}" loading="lazy"></a>`)
          .join('')}</div>`
      : ''
  }
</article>`,
        )
        .join('')}</section>`
    : '';

  const lines = view.items
    .map((i) => {
      const tag = i.type === 'labor' ? 'MO' : 'PZ';
      const decision =
        i.approval_status === 'proposed' && pending
          ? `<fieldset class="choice" data-item="${esc(i.id)}">
    <legend class="sr">¿Aprobar ${esc(i.description)}?</legend>
    <label><input type="radio" name="d-${esc(i.id)}" value="approved"><span class="yes">Aprobar</span></label>
    <label><input type="radio" name="d-${esc(i.id)}" value="declined"><span class="no">No, gracias</span></label>
  </fieldset>`
          : `<span class="state state-${esc(i.approval_status)}">${ITEM_STATE[i.approval_status]}</span>`;
      return `<li class="line ${i.approval_status === 'declined' ? 'declined' : ''}">
  <span class="tag tag-${tag}">${tag}</span>
  <div class="grow"><div class="desc">${esc(i.description)}</div><div class="mono muted small">× ${esc(i.quantity)}</div></div>
  <div class="amount mono">${money(i.total_cents)}</div>
  <div class="decision">${decision}</div>
</li>`;
    })
    .join('');

  const banner =
    view.status === 'pending'
    ? proposed.length
      ? `<p class="note">Aprueba o rechaza cada reparación propuesta. Solo se cobra lo que apruebes.</p>`
      : ''
    : `<p class="banner banner-${esc(view.status)}">${esc(STATUS_BANNER[view.status])}</p>`;

  const body = `
<header>
  <div class="mono muted small">${esc(view.shop_name)}</div>
  <h1>Hola ${esc(view.customer_first_name)}, este es el presupuesto de tu vehículo</h1>
</header>
<section class="card dark">
  <div class="mono label">Orden ${esc(view.work_order_code)}</div>
  <div class="vehicle">${esc(view.vehicle)}</div>
</section>
${banner}
${findings}
<section>
  <h2>Presupuesto</h2>
  <ul class="card lines">${lines}</ul>
  <div class="card totals">
    <div class="row"><span class="muted">Subtotal</span><span class="mono">${money(view.subtotal_cents)}</span></div>
    <div class="row"><span class="muted">ITBIS</span><span class="mono">${money(view.tax_cents)}</span></div>
    <div class="row total"><span>Total</span><span>${money(view.total_cents)}</span></div>
    <p class="muted small">No incluye lo que rechaces.</p>
  </div>
</section>
${
  pending && proposed.length
    ? `<div class="submit"><p id="msg" class="small" role="status"></p><button id="send" type="button">Enviar mi respuesta</button></div>`
    : ''
}
<footer class="muted small">Enlace personal de ${esc(view.shop_name)} · válido hasta ${esc(new Date(view.expires_at).toLocaleDateString('es-DO', { timeZone: 'America/Santo_Domingo' }))} · MechMate</footer>`;

  const script =
    pending && proposed.length
      ? `(function(){
  var btn=document.getElementById('send'), msg=document.getElementById('msg');
  btn.addEventListener('click', function(){
    var sets=document.querySelectorAll('fieldset[data-item]'), decisions=[];
    for (var i=0;i<sets.length;i++){ var c=sets[i].querySelector('input:checked'); if(c) decisions.push({item_id:sets[i].getAttribute('data-item'), decision:c.value}); }
    if(!decisions.length){ msg.textContent='Elige Aprobar o No, gracias en al menos una reparación.'; return; }
    btn.disabled=true; msg.textContent='Enviando…';
    fetch('/v1/public/approvals/'+encodeURIComponent(${JSON.stringify(token)})+'/decisions',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({decisions:decisions})})
      .then(function(r){ if(!r.ok) return r.json().then(function(e){ throw new Error(e.message||'Error'); }); location.reload(); })
      .catch(function(e){ btn.disabled=false; msg.textContent='No se pudo enviar: '+e.message; });
  });
})();`
      : '';

  return layout(`Presupuesto ${view.work_order_code} · ${view.shop_name}`, nonce, body, script);
}

export function renderErrorPage(message: string, nonce: string): string {
  return layout(
    'Enlace no disponible · MechMate',
    nonce,
    `<header><h1>Enlace no disponible</h1></header><p class="banner banner-revoked">${esc(message)}</p><footer class="muted small">MechMate</footer>`,
  );
}

const CSS = `
:root{--bg:#E7E8E3;--card:#fff;--ink:#15181C;--muted:#59636B;--line:#DCDED8;--dark:#17191A;--ok:#1C8C57;--ok-bg:#D7EFE2;--warn:#B77600;--warn-bg:#FCEBC4;--bad:#D2382F;--bad-bg:#F8DCD9}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.45 'Space Grotesk',system-ui,sans-serif}
main{max-width:560px;margin:0 auto;padding:20px 16px 40px}
h1{font-size:22px;line-height:1.2;margin:6px 0 16px}h2{font-size:17px;margin:24px 0 10px}h3{font-size:16px;margin:8px 0 4px}
.mono{font-family:'IBM Plex Mono',ui-monospace,monospace}.muted{color:var(--muted)}.small{font-size:13px}.label{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#A5B5BF}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin:0 0 10px}
.dark{background:var(--dark);border-color:var(--dark);color:#E8ECEE}.vehicle{font-size:18px;font-weight:600;margin-top:4px}
.row{display:flex;justify-content:space-between;align-items:center;gap:8px}
.chip{font-size:12px;font-weight:600;padding:3px 9px;border-radius:999px}
.sev-urgent{color:var(--bad);background:var(--bad-bg)}.sev-attention{color:var(--warn);background:var(--warn-bg)}.sev-ok{color:var(--ok);background:var(--ok-bg)}
.photos{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px}.photos img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;display:block;background:var(--line)}
.lines{list-style:none;padding:4px 16px}.line{display:grid;grid-template-columns:auto 1fr auto;gap:4px 12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)}.line:last-child{border-bottom:0}
.line.declined .desc,.line.declined .amount{color:var(--muted);text-decoration:line-through}
.tag{font:600 11px 'IBM Plex Mono',monospace;padding:4px 6px;border-radius:6px;background:#E8ECEE;color:#454B4F}.tag-PZ{background:var(--ok-bg);color:var(--ok)}
.desc{font-weight:600}.amount{font-weight:600}.decision{grid-column:1/-1}
.choice{border:0;margin:6px 0 0;padding:0;display:flex;gap:8px}.choice label{flex:1}.choice input{position:absolute;opacity:0}
.choice span{display:block;text-align:center;padding:10px;border-radius:10px;border:1.5px solid var(--line);font-weight:600;cursor:pointer}
.choice input:checked+.yes{border-color:var(--ok);background:var(--ok-bg);color:var(--ok)}.choice input:checked+.no{border-color:var(--bad);background:var(--bad-bg);color:var(--bad)}
.choice input:focus-visible+span{outline:2px solid var(--ink);outline-offset:2px}
.state{font:600 12px 'IBM Plex Mono',monospace}.state-approved{color:var(--ok)}.state-declined{color:var(--bad)}.state-proposed{color:var(--warn)}
.totals .row{padding:4px 0}.total{font-size:22px;font-weight:700;border-top:1px solid var(--line);margin-top:6px;padding-top:10px!important}
.note{background:var(--card);border-left:4px solid var(--warn);padding:10px 12px;border-radius:8px}
.banner{padding:12px 14px;border-radius:10px;font-weight:600}.banner-completed{background:var(--ok-bg);color:var(--ok)}.banner-revoked,.banner-expired{background:var(--bad-bg);color:var(--bad)}
.submit{position:sticky;bottom:0;padding:12px 0 4px;background:linear-gradient(transparent,var(--bg) 30%)}
button{width:100%;padding:15px;border:0;border-radius:12px;background:var(--dark);color:#fff;font:600 17px 'Space Grotesk',sans-serif;cursor:pointer}button:disabled{opacity:.6}
#msg{min-height:1.2em;margin:0 0 8px;color:var(--bad)}footer{margin-top:28px;text-align:center}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
`;
