// Printable HTML documents for members (certificate, access card, receipts).
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (n) => `R${Number(n).toLocaleString('en-ZA')}`;
const fmtDate = (d) => new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' });

const shell = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  *{box-sizing:border-box}body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;margin:0;background:#f3f4f6;color:#111827;padding:32px}
  .doc{max-width:760px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 20px 50px -20px rgba(6,78,59,.35)}
  .band{background:linear-gradient(135deg,#047857,#064e3b);color:#fff;padding:28px 36px;display:flex;justify-content:space-between;align-items:center}
  .band h1{margin:0;font-size:22px}.band p{margin:4px 0 0;opacity:.85;font-size:13px}
  .body{padding:36px}.row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:15px}
  .row span:first-child{color:#6b7280}.big{font-size:30px;font-weight:600;color:#065f46;margin:8px 0 24px}
  .foot{padding:20px 36px;background:#f9fafb;color:#6b7280;font-size:12px}
  .print{display:block;margin:24px auto 0;background:#059669;color:#fff;border:0;padding:12px 28px;border-radius:10px;font-size:15px;cursor:pointer}
  .card{max-width:420px;margin:0 auto;aspect-ratio:1.586;border-radius:18px;padding:24px;color:#fff;background:linear-gradient(135deg,#059669,#064e3b 70%);position:relative;overflow:hidden;box-shadow:0 25px 50px -12px rgba(6,78,59,.5)}
  .card:after{content:"";position:absolute;right:-60px;top:-60px;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.08)}
  @media print{body{background:#fff;padding:0}.print{display:none}.doc{box-shadow:none}}
</style></head><body>${body}<button class="print" onclick="window.print()">Print / Save as PDF</button></body></html>`;

export function renderDocument(type, { user, summary, contribution }) {
  const name = `${user.firstName} ${user.lastName}`;
  if (type === 'card') {
    return shell('Healthcare Access Card', `
      <div class="card">
        <div style="font-size:13px;opacity:.85;letter-spacing:.12em;text-transform:uppercase">African Admission</div>
        <div style="font-size:20px;font-weight:600;margin-top:4px">Healthcare Access Card</div>
        <div style="position:absolute;left:24px;bottom:24px">
          <div style="font-size:20px;font-weight:600">${esc(name)}</div>
          <div style="opacity:.85;font-size:14px;margin-top:4px">${esc(user.memberNumber)} · ${esc(summary.plan.name)}</div>
          <div style="opacity:.7;font-size:12px;margin-top:6px">Status: ${esc(summary.status)} · Issued ${fmtDate(new Date())}</div>
        </div>
      </div>`);
  }
  if (type === 'receipt') {
    return shell('Contribution Receipt', `
      <div class="doc"><div class="band"><div><h1>Contribution Receipt</h1><p>African Admission</p></div><div style="text-align:right;font-size:13px">${esc(contribution.reference)}</div></div>
      <div class="body"><div class="big">${money(contribution.amount)}</div>
        <div class="row"><span>Member</span><span>${esc(name)}</span></div>
        <div class="row"><span>Member number</span><span>${esc(user.memberNumber)}</span></div>
        <div class="row"><span>Plan</span><span>${esc(summary.plan.name)}</span></div>
        <div class="row"><span>Period</span><span>${esc(contribution.period)}</span></div>
        <div class="row"><span>Payment method</span><span>${esc(contribution.method.toUpperCase())}</span></div>
        <div class="row"><span>Confirmed</span><span>${fmtDate(contribution.paidAt || contribution.updatedAt || contribution.createdAt)}</span></div>
      </div><div class="foot">This receipt confirms a monthly contribution received by African Admission, a division of VINK Group (Pty) Ltd (reg. 2018/079316/07). Keep it for your records.</div></div>`);
  }
  return shell('Membership Certificate', `
    <div class="doc"><div class="band"><div><h1>Membership Certificate</h1><p>Healthcare & Education Access Platform</p></div><div style="font-size:13px">${esc(user.memberNumber)}</div></div>
    <div class="body" style="text-align:center;padding:48px 36px">
      <p style="color:#6b7280;margin:0">This certifies that</p>
      <div class="big" style="font-size:34px">${esc(name)}</div>
      <p style="color:#374151;max-width:520px;margin:0 auto 28px">is a registered member of African Admission on the <strong>${esc(summary.plan.name)}</strong> plan, with membership status <strong>${esc(summary.status)}</strong>.</p>
      <div class="row"><span>${user.idType === 'id' ? 'ID number' : 'Passport / permit'}</span><span>${esc(user.idNumber)}</span></div>
      <div class="row"><span>Nationality</span><span>${esc(user.nationality)}</span></div>
      <div class="row"><span>Member since</span><span>${fmtDate(user.createdAt)}</span></div>
      <div class="row"><span>Issued</span><span>${fmtDate(new Date())}</span></div>
    </div><div class="foot">African Admission is a division of VINK Group (Pty) Ltd, registration number 2018/079316/07. Not affiliated with any government entity.</div></div>`);
}
