// Run inside the enacoach folder:  node patch-ai3.js
const fs = require('fs');
const fail = (m) => { console.error('FAILED: ' + m + ' (nothing was changed)'); process.exit(1); };
const self = fs.readFileSync(__filename, 'utf8');
const blk = (n) => self.split('<<' + n)[1].split(n + '>>')[0].replace(/^\r?\n/, '').replace(/\r?\n$/, '');

let s = fs.readFileSync('server.js', 'utf8');
let w = fs.readFileSync('public/chat-widget.js', 'utf8');
if (s.indexOf('function stripAgentTalk') < 0) fail('run patch-ai.js first');
const doServer = s.indexOf('[[PAY:TOTAL]]') < 0;
const doWidget = w.indexOf('pc-poster') < 0;
if (!doServer && !doWidget) { console.log('Already updated. Nothing to do.'); process.exit(0); }

if (doServer) {
  const i1 = s.indexOf('Style: professional, warm and confident.');
  const j1 = s.indexOf('Answer what was asked straight away');
  if (i1 < 0 || j1 < i1) fail('style text not found in server.js');
  s = s.slice(0, i1) + blk('STYLE') + ' ' + s.slice(j1);

  const i3 = s.indexOf('3. Payment details:'), j3 = s.indexOf('4. December:');
  if (i3 < 0 || j3 < i3) fail('rule 3 not found in server.js');
  s = s.slice(0, i3) + blk('RULE3') + '\n' + s.slice(j3);

  const r1 = "text = text.replace(/\\[\\[(PAY|HOLD|HANDOFF)\\]\\]/gi, '').trim().slice(0, 900);";
  const r1n = "text = text.replace(/\\[\\[(PAY(?::\\s*\\d+)?|HOLD|HANDOFF)\\]\\]/gi, '').trim().slice(0, 900);";
  if (s.indexOf(r1) < 0) fail('cleanup line not found');
  s = s.split(r1).join(r1n);

  const r2 = "const wantPay = /\\[\\[PAY\\]\\]/i.test(text), handoff = /\\[\\[(HOLD|HANDOFF)\\]\\]/i.test(text);";
  const r2n = "const payM = /\\[\\[PAY(?::\\s*(\\d+))?\\]\\]/i.exec(text), wantPay = !!payM, handoff = /\\[\\[(HOLD|HANDOFF)\\]\\]/i.test(text);";
  if (s.indexOf(r2) < 0) fail('wantPay line not found');
  s = s.split(r2).join(r2n);

  const ia = s.indexOf('  if (wantPay) {'), ib = s.indexOf('  if (handoff) aiHold[c.id] = true;');
  if (ia < 0 || ib < ia) fail('payment block not found');
  s = s.slice(0, ia) + blk('PAYSRV') + '\n' + s.slice(ib);

  const r3 = "name: clip(p.name, 60), amount: clip(p.amount, 12),";
  if (s.indexOf(r3) < 0) fail('agent payment line not found');
  s = s.split(r3).join("name: clip(p.name, 60) || 'ENA COACH', amount: clip(p.amount, 12),");
}

if (doWidget) {
  const dh = w.indexOf('document.head.appendChild(css);');
  const bt = dh < 0 ? -1 : w.lastIndexOf('`;', dh);
  if (bt < 0) fail('css block not found in chat-widget.js');
  w = w.slice(0, bt) + blk('CSS') + '\n' + w.slice(bt);

  let p1 = w.indexOf('  function digits(s)');
  if (p1 < 0) p1 = w.indexOf('  function payment(p) {');
  const p2 = w.indexOf('  function bookingCard(b) {');
  if (p1 < 0 || p2 < p1) fail('payment function not found in chat-widget.js');
  w = w.slice(0, p1) + blk('PAYWID') + '\n' + w.slice(p2);

  const g1 = 'Hello! 👋 Tell us where you are travelling from, to, and the date, and we will book your ticket.';
  if (w.indexOf(g1) >= 0) w = w.split(g1).join('Welcome to ENA Coach. How may we assist you today? Kindly share your departure town, destination and travel date, and we will gladly arrange your booking.');

  const a1 = 'document.body.appendChild(box); document.body.appendChild(lbl); document.body.appendChild(btn);';
  if (w.indexOf(a1) < 0) fail('append line not found in chat-widget.js');
  if (w.indexOf("getElementById('enc-av')") < 0) w = w.split(a1).join(a1 + '\n' + blk('AVATAR'));
}

if (doServer) { fs.writeFileSync('server.js.bak3', fs.readFileSync('server.js')); fs.writeFileSync('server.js', s); }
if (doWidget) { fs.writeFileSync('public/chat-widget.js.bak3', fs.readFileSync('public/chat-widget.js')); fs.writeFileSync('public/chat-widget.js', w); }
console.log('Updated: ' + (doServer ? 'server.js ' : '') + (doWidget ? 'public/chat-widget.js' : ''));
process.exit(0);

/*<<STYLE
Style: VERY professional and courteous, like a senior customer service executive of a reputable coach company. Greet the customer by name the first time when you know it. Use complete, polite, grammatically correct sentences, never slang and never short forms such as pls or kk, and at most one emoji per message (only 🙏 or ✅, and only when natural). Keep replies to 1 to 3 short sentences, plain text only, no markdown. Reply in the customer's language (English or Kiswahili), always in polite standard language even when the customer writes slang or Sheng. When a booking is complete you may close with: Thank you for choosing ENA Coach.
STYLE>>*/

/*<<RULE3
3. Payment details: when the customer asks how to pay, asks for the payment details, or is ready to pay, and you already know the route and the number of passengers, end your message with the exact marker [[PAY:TOTAL]], where TOTAL is the total fare in KES as digits only, for example [[PAY:3400]]. If there is an unpaid booking in this chat, use the marker [[PAY]] instead. The system then attaches the official payment poster showing the paybill number, the account number, the account name ENA COACH and the amount. NEVER type payment numbers yourself. Before the marker write one short professional line, for example: Kindly complete your payment using the details below, then reply with your M-Pesa confirmation message. If you do not yet know the route or the number of passengers, ask for them first and do not use the marker.
RULE3>>*/

/*<<PAYSRV
  if (wantPay) {
    const b = pendingBooking(c);
    const amt = b ? b.amount : (payM[1] || '');
    const key = (b ? b.ref : c.id) + ':' + amt;
    if (Date.now() - (aiPaySent[key] || 0) > 60000) {
      const s = await getPay();
      aiPaySent[key] = Date.now();
      const payment = {
        method: 'M-Pesa', accountLabel: s.type === 'till' ? 'Till' : s.type === 'phone' ? 'Phone' : 'Paybill',
        number: clip(s.number, 30), account: s.type === 'paybill' ? clip(s.account, 40) : '', name: 'ENA COACH', amount: clip(amt, 12),
        note: (b ? 'Booking ' + b.ref + '. ' : '') + 'Kindly complete your payment, then reply here with the M-Pesa confirmation message.'
      };
      pushMsg(c, { from: 'agent', ai: true, type: 'payment', payment, text: 'Payment details' + (payment.amount ? ': KES ' + payment.amount : '') });
    }
  }
PAYSRV>>*/

/*<<CSS
.enc-p{width:300px;max-width:92%;padding:4px;border:2px solid #2f9e44;border-radius:14px;overflow:hidden;background:#fff}
.pc-img{display:block;width:100%;height:auto;border-radius:10px}
.pc-bar{display:flex;gap:6px;flex-wrap:wrap;padding:8px 2px 4px}
.pc-cp{display:inline-block;text-decoration:none;background:#e7fbe9;color:#075E54;border:1px solid #25D366;border-radius:12px;padding:5px 12px;font:13px system-ui,sans-serif}
CSS>>*/

/*<<PAYWID
  // pc-poster
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  // draws the payment poster as a real image, so customers can save or share it
  function poster(p, cb) {
    var W = 900, M = 40, IW = W - 2 * M, G = '#2f9e44', R = '#e5252a', F = 'Arial, Helvetica, sans-serif';
    var num = String(p.number || ''), acc = String(p.account || ''), nm = String(p.name || 'ENA COACH');
    var amt = p.amount ? 'KES ' + fmt(p.amount) : '';
    var lab = String(p.accountLabel || 'Paybill').toUpperCase() + ' NUMBER';
    var H = 170 + 250 + (acc ? 230 : 0) + 230 + (amt ? 240 : 0) + 150;
    function draw(logo) {
      var cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      var x = cv.getContext('2d');
      function rr(a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
      function label(t, y) { x.fillStyle = R; x.font = 'bold 46px ' + F; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillText(t, W / 2, y); }
      function box(t, y, h, fill, ink, size) {
        rr(M, y, IW, h, 10); x.fillStyle = fill; x.fill(); x.lineWidth = 7; x.strokeStyle = G; x.stroke();
        var fs = size; x.font = 'bold ' + fs + 'px ' + F;
        while (x.measureText(t).width > IW - 60 && fs > 24) { fs -= 2; x.font = 'bold ' + fs + 'px ' + F; }
        x.fillStyle = ink; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(t, W / 2, y + h / 2 + 4);
      }
      x.fillStyle = '#f1f5fb'; x.fillRect(0, 0, W, H);
      x.fillStyle = G; x.fillRect(0, 0, W, 170);
      x.beginPath(); x.arc(100, 85, 58, 0, Math.PI * 2); x.fillStyle = '#fff'; x.fill();
      if (logo) { x.save(); x.beginPath(); x.arc(100, 85, 54, 0, Math.PI * 2); x.clip(); x.drawImage(logo, 46, 31, 108, 108); x.restore(); }
      else { x.beginPath(); x.arc(100, 85, 54, 0, Math.PI * 2); x.fillStyle = '#ff5c00'; x.fill(); x.fillStyle = '#fff'; x.font = 'bold 64px ' + F; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('E', 100, 90); }
      x.fillStyle = '#fff'; x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.font = 'bold 72px ' + F; x.fillText('ENA COACH', 190, 100);
      x.font = 'bold 28px ' + F; x.fillStyle = '#d7f5dd'; x.fillText('OFFICIAL PAYMENT DETAILS', 192, 142);
      var y = 170;
      label(lab, y + 80);
      var n = Math.max(1, num.length), gap = 14, bw = Math.min(100, Math.floor((IW - (n - 1) * gap) / n)), bh = 120;
      var sx = (W - (n * bw + (n - 1) * gap)) / 2;
      for (var i = 0; i < num.length; i++) {
        rr(sx + i * (bw + gap), y + 105, bw, bh, 8); x.fillStyle = '#fff'; x.fill(); x.lineWidth = 7; x.strokeStyle = G; x.stroke();
        x.fillStyle = '#111'; x.font = 'bold ' + Math.min(88, Math.round(bw * 0.9)) + 'px ' + F; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText(num.charAt(i), sx + i * (bw + gap) + bw / 2, y + 105 + bh / 2 + 4);
      }
      y += 250;
      if (acc) { label('ACCOUNT NUMBER', y + 70); box(acc, y + 95, 110, '#fff', '#111', 72); y += 230; }
      label('ACCOUNT NAME', y + 70); box(nm, y + 95, 110, '#fff', '#111', 72); y += 230;
      if (amt) { label('AMOUNT TO PAY', y + 70); box(amt, y + 95, 120, G, '#fff', 84); y += 240; }
      x.strokeStyle = G; x.lineWidth = 4; x.beginPath(); x.moveTo(M, y + 20); x.lineTo(W - M, y + 20); x.stroke();
      x.fillStyle = '#475569'; x.font = '26px ' + F; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
      x.fillText('Pay via M-Pesa, then reply in this chat', W / 2, y + 70);
      x.fillText('with your confirmation message.', W / 2, y + 105);
      try { cb(cv.toDataURL('image/png')); } catch (e) { if (logo) draw(null); }
    }
    var lg = new Image(); lg.crossOrigin = 'anonymous';
    lg.onload = function () { draw(lg); };
    lg.onerror = function () { draw(null); };
    lg.src = base + '/logo.png';
  }
  function payment(p) {
    var d = document.createElement('div'); d.className = 'enc-m enc-a enc-p';
    var im = document.createElement('img'); im.className = 'pc-img'; im.alt = 'ENA Coach payment details';
    im.onload = function () { if (msgs.lastChild === d) msgs.scrollTop = msgs.scrollHeight; };
    var bar = document.createElement('div'); bar.className = 'pc-bar';
    function cp(label, v) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'pc-cp'; b.textContent = label;
      b.onclick = function () { if (navigator.clipboard) navigator.clipboard.writeText(v); b.textContent = 'Copied'; setTimeout(function () { b.textContent = label; }, 1500); };
      bar.appendChild(b);
    }
    cp('Copy ' + String(p.accountLabel || 'Paybill').toLowerCase(), String(p.number));
    if (p.account) cp('Copy account', String(p.account));
    var sv = document.createElement('a'); sv.className = 'pc-cp'; sv.textContent = 'Save image'; sv.download = 'ENA-Coach-payment.png'; bar.appendChild(sv);
    d.appendChild(im); d.appendChild(bar);
    poster(p, function (u) { im.src = u; sv.href = u; });
    return d;
  }
PAYWID>>*/

/*<<AVATAR
  (function () {
    var av = document.getElementById('enc-av'), im = new Image();
    im.onload = function () { av.textContent = ''; av.style.background = '#fff'; im.style.cssText = 'width:100%;height:100%;border-radius:50%;object-fit:contain'; av.appendChild(im); };
    im.src = base + '/logo.png';
  })();
AVATAR>>*/
