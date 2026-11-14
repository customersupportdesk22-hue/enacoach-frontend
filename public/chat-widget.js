(function () {
  if (window.ENAChat) return;
  var base = document.currentScript.src.replace(/\/chat-widget\.js.*$/, '');
  var css = document.createElement('style');
  css.textContent = `
#enc-btn{position:fixed;right:16px;bottom:90px;width:60px;height:60px;border-radius:50%;background:#25D366;color:#fff;border:0;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(37,211,102,.55);z-index:99998}
#enc-btn::before{content:"";position:absolute;inset:0;border-radius:50%;background:#25D366;animation:encPulse 1.8s ease-out infinite;z-index:-1}
#enc-btn::after{content:"";position:absolute;top:2px;right:2px;width:14px;height:14px;background:#4ade80;border:2px solid #fff;border-radius:50%}
@keyframes encPulse{0%{transform:scale(1);opacity:.6}100%{transform:scale(1.7);opacity:0}}
#enc-bd{position:absolute;top:-4px;left:-4px;min-width:22px;height:22px;padding:0 6px;border-radius:11px;background:#ef4444;color:#fff;font:700 13px/22px system-ui,sans-serif;text-align:center;border:2px solid #fff;display:none}
#enc-lbl{position:fixed;right:88px;bottom:104px;background:#fff;color:#075E54;padding:8px 12px;border-radius:18px;font:600 13px system-ui,sans-serif;box-shadow:0 4px 12px rgba(0,0,0,.18);z-index:99998}
#enc-box{position:fixed;inset:0;width:100%;height:100vh;height:100dvh;background:#f0f2f5;display:none;flex-direction:column;overflow:hidden;z-index:99999;font-family:system-ui,sans-serif}
#enc-box header{background:#FF5C00;color:#fff;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 10px;display:flex;align-items:center;gap:10px}
#enc-back{background:none;border:0;color:#fff;font-size:26px;line-height:1;padding:4px 8px;cursor:pointer}
#enc-av{width:40px;height:40px;border-radius:50%;background:#ff5c00;display:flex;align-items:center;justify-content:center;font-weight:700}
#enc-ti{display:flex;flex-direction:column;line-height:1.25}
#enc-ti b{font-size:16px}
#enc-ti small{font-size:12px;color:#b9f5d0}
#enc-msgs{flex:1;overflow-y:auto;padding:14px;background:#efeae2;display:flex;flex-direction:column;gap:8px}
.enc-m{white-space:pre-wrap;max-width:80%;padding:9px 12px;border-radius:14px;font-size:15px;line-height:1.35;word-wrap:break-word;box-shadow:0 1px 1px rgba(0,0,0,.08)}
.enc-c{align-self:flex-end;background:#d9fdd3;color:#111;border-bottom-right-radius:4px}
.enc-a{align-self:flex-start;background:#fff;color:#111;border-bottom-left-radius:4px}
.enc-t{max-width:95%;padding:0;border:2px dashed #ff5c00;background:#fff;color:#111}
.tk{padding:10px}.tk h4{margin:0 0 6px;color:#ff5c00}.tk td{padding:2px 8px 2px 0;font-size:14px}.tk td:first-child{color:#6b7280}
.tk .go{margin-top:8px;width:100%}
.enc-p{max-width:95%;padding:0;border:2px solid #25D366;background:#fff;color:#111}
.pay{padding:12px}.pay h4{margin:0 0 8px;color:#075E54}.pay table{width:100%}.pay td{padding:4px 0;font-size:14px;vertical-align:middle}.pay td:first-child{color:#6b7280;padding-right:10px}
.pay .cp{background:#e7fbe9;color:#075E54;border:1px solid #25D366;border-radius:12px;padding:3px 10px;font-size:12px;margin-left:6px}
.pay .amt{font-size:20px;color:#075E54}
.pay p{margin:8px 0 0;font-size:12px;color:#6b7280}
#enc-chips{display:none;gap:6px;padding:8px 12px 0;overflow-x:auto;white-space:nowrap;background:#fff}
#enc-chips span{background:#e7fbe9;color:#075E54;border:1px solid #25D366;border-radius:16px;padding:6px 12px;font-size:13px;flex:0 0 auto}
#enc-form,#enc-send{padding:10px 12px calc(env(safe-area-inset-bottom,0px) + 10px);display:flex;gap:8px;background:#fff;border-top:1px solid #eee}
#enc-send{border-top:0}
#enc-form{flex-direction:column;gap:10px;padding-top:16px}
#enc-box textarea{flex:1;padding:12px 14px;border:1px solid #d1d5db;border-radius:22px;font:16px/1.35 system-ui,sans-serif;outline:0;resize:none;max-height:120px;min-width:0}
#enc-send{align-items:flex-end}
#enc-box input{flex:1;padding:12px;border:1px solid #d1d5db;border-radius:22px;font-size:16px;outline:0}
#enc-box button.go{background:#25D366;color:#fff;border:0;border-radius:22px;padding:12px 20px;font-weight:700;font-size:15px}
body.enc-open{overflow:hidden}
#enc-box.kb #enc-send{padding-bottom:10px}
#enc-lbl{transition:opacity .6s,transform .6s}
#enc-lbl.gone{opacity:0;transform:translateX(10px);pointer-events:none}
.enc-b{max-width:92%;padding:0;background:#d9fdd3;color:#111;border-bottom-right-radius:4px;align-self:flex-end}
.bk{padding:10px 12px}.bk h4{margin:0 0 6px;color:#075E54;font-size:14px}.bk td{padding:2px 8px 2px 0;font-size:13px;vertical-align:top}.bk td:first-child{color:#6b7280}
.bk .st{margin-top:6px;font-size:12px;font-weight:700;color:#b45309}.bk .st.ok{color:#047857}
#enc-at{background:none;border:0;font-size:24px;padding:8px 4px;align-self:flex-end;cursor:pointer}
.enc-img{padding:4px}
.enc-img img{display:block;width:220px;max-width:100%;border-radius:10px;cursor:pointer;background:#eee;min-height:60px}
#enc-lb,#enc-prev{position:absolute;inset:0;background:rgba(0,0,0,.92);display:none;align-items:center;justify-content:center;flex-direction:column;z-index:7;padding:16px;gap:12px}
#enc-lb img,#enc-prev img{max-width:100%;max-height:68%;object-fit:contain;border-radius:8px}
#enc-lb img{max-height:92%}
#enc-prev input{flex:none;width:100%;max-width:420px}
#enc-prev .pb{display:flex;gap:10px;width:100%;max-width:420px}
#enc-prev .pb button{flex:1;border-radius:22px;padding:12px;font-weight:700;font-size:15px;border:0}
#enc-prev .pb .x{background:#fff;color:#111}
#enc-msgs,#enc-chips{scrollbar-width:none;-ms-overflow-style:none}
#enc-msgs::-webkit-scrollbar,#enc-chips::-webkit-scrollbar{display:none;width:0;height:0}
.enc-m{position:relative;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.enc-un{font-style:italic;color:#6b7280;background:#f3f4f6;border:1px dashed #d1d5db;box-shadow:none}
.enc-lk{position:absolute;bottom:-11px;right:10px;background:#fff;border-radius:12px;padding:0 6px;font-size:13px;line-height:20px;box-shadow:0 1px 3px rgba(0,0,0,.25)}
.enc-liked{margin-bottom:10px}
.enc-sel{outline:2px solid #25D366}
#enc-menu{position:absolute;inset:0;background:rgba(0,0,0,.4);display:none;align-items:flex-end;z-index:5}
.enc-mc{width:100%;background:#fff;border-radius:18px 18px 0 0;padding:8px 8px calc(env(safe-area-inset-bottom,0px) + 10px)}
.enc-mc button{display:flex;align-items:center;gap:12px;width:100%;background:none;border:0;padding:15px 14px;font:16px system-ui,sans-serif;text-align:left;color:#111;border-radius:10px}
.enc-mc button:active{background:#f0f2f5}
.enc-mc .dg{color:#dc2626}
.enc-pv{padding:8px 14px 10px;font-size:13px;color:#6b7280;border-bottom:1px solid #eee;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#enc-toast{position:absolute;left:50%;bottom:90px;transform:translateX(-50%);background:#111;color:#fff;padding:8px 16px;border-radius:999px;font-size:13px;opacity:0;transition:opacity .2s;pointer-events:none;z-index:6}
.enc-p{width:300px;max-width:92%;border:2px solid #075E54;border-radius:14px;overflow:hidden}
.pc-h{background:#075E54;color:#fff;padding:10px 12px;display:flex;align-items:center;gap:10px}
.pc-lh{display:flex;flex:none}
.pc-lg{width:40px;height:40px;border-radius:50%;background:#fff;object-fit:contain}
.pc-lf{width:40px;height:40px;border-radius:50%;background:#ff5c00;color:#fff;font:700 18px/40px system-ui,sans-serif;text-align:center}
.pc-bn{font:800 16px system-ui,sans-serif;letter-spacing:.5px}
.pc-bs{font:12px system-ui,sans-serif;color:#b9f5d0}
.pc-b{padding:12px;background:#f7fbf8;text-align:center}
.pc-l{font:700 12px system-ui,sans-serif;color:#dc2626;letter-spacing:.8px;margin:8px 0 6px}
.pc-d{display:flex;justify-content:center;gap:4px;flex-wrap:wrap}
.pc-d span{min-width:26px;padding:4px 0;border:2px solid #16a34a;border-radius:4px;background:#fff;font:800 20px system-ui,sans-serif;color:#111}
.pc-cp{margin-top:6px;background:#e7fbe9;color:#075E54;border:1px solid #25D366;border-radius:12px;padding:3px 12px;font-size:12px}
.pc-nm{display:inline-block;min-width:60%;padding:6px 10px;border:2px solid #16a34a;border-radius:4px;background:#fff;font:800 17px system-ui,sans-serif;color:#111}
.pc-am{margin-top:12px;background:#075E54;color:#fff;border-radius:10px;padding:8px;font:800 22px system-ui,sans-serif}
.pc-am small{display:block;font:600 11px system-ui,sans-serif;color:#b9f5d0;letter-spacing:.6px}
.pc-nt{margin-top:8px;font:12px/1.35 system-ui,sans-serif;color:#6b7280}
`;
  document.head.appendChild(css);

  var box = document.createElement('div'); box.id = 'enc-box';
  box.innerHTML = '<header><button id="enc-back" aria-label="Back">←</button><div id="enc-av">E</div>' +
    '<div id="enc-ti"><b>ENA Coach Support</b><small>● Online</small></div></header>' +
    '<div id="enc-msgs"></div>' +
    '<div id="enc-form"><input id="enc-n" placeholder="Your name"><input id="enc-p" placeholder="Phone (07xx...)" type="tel"><button class="go" id="enc-start">Start chat</button></div>' +
    '<div id="enc-chips"><span>🎫 Book a ticket</span><span>💰 Check price</span><span>🕒 Departure times</span></div>' +
    '<div id="enc-send" style="display:none"><textarea id="enc-t" rows="1" placeholder="Type a message..."></textarea><button class="go" id="enc-s">Send</button></div>';
  var btn = document.createElement('button'); btn.id = 'enc-btn'; btn.setAttribute('aria-label', 'Chat with us');
  btn.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24" fill="#fff"><path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>';
  var bd = document.createElement('span'); bd.id = 'enc-bd'; btn.appendChild(bd);
  var lbl = document.createElement('div'); lbl.id = 'enc-lbl'; lbl.textContent = 'Chat with us 💬';
  document.body.appendChild(box); document.body.appendChild(lbl); document.body.appendChild(btn);
  (function () {
    var av = document.getElementById('enc-av'), im = new Image();
    im.onload = function () { av.textContent = ''; av.style.background = '#fff'; im.style.cssText = 'width:100%;height:100%;border-radius:50%;object-fit:contain'; av.appendChild(im); };
    im.src = base + '/logo.png';
  })();

  var $ = function (id) { return document.getElementById(id); };
  var msgs = $('enc-msgs'), socket, pushed = false, unread = 0, AC;
  function unlock() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) {} }
  document.addEventListener('pointerdown', unlock);
  function note(f, t, d, v) { var o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(AC.destination);
    g.gain.setValueAtTime(0.0001, AC.currentTime + t); g.gain.exponentialRampToValueAtTime(v, AC.currentTime + t + .02);
    g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + t + d); o.start(AC.currentTime + t); o.stop(AC.currentTime + t + d + .02); }
  function tone(k) { try { unlock(); if (!AC) return; if (k === 'in') { note(880, 0, .18, .35); note(1175, .16, .28, .35); } else note(660, 0, .12, .18); } catch (e) {} }
  function setBadge() { bd.textContent = unread > 9 ? '9+' : unread; bd.style.display = unread ? 'block' : 'none'; }
  var id = localStorage.getItem('enc_id') || ('c' + Math.random().toString(36).slice(2, 12));
  localStorage.setItem('enc_id', id);

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function rows(t) { return [['Ticket No', t.no], ['Passenger', t.name], ['Phone', t.phone], ['From', t.from], ['To', t.to],
    ['Date', t.date], ['Departure', t.time], ['Bus', t.bus], ['Seat', t.seat], ['Fare', 'KES ' + t.price]]; }
  function ticket(t) {
    var d = document.createElement('div'); d.className = 'enc-m enc-a enc-t';
    d.innerHTML = '<div class="tk"><h4>🎫 ENA COACH TICKET</h4><table>' +
      rows(t).filter(function (r) { return r[1]; }).map(function (r) { return '<tr><td>' + r[0] + '</td><td><b>' + esc(r[1]) + '</b></td></tr>'; }).join('') +
      '</table><button class="go">Print / Save PDF</button></div>';
    d.querySelector('button').onclick = function () {
      var w = window.open('', '_blank');
      w.document.write('<title>' + esc(t.no) + '</title><body style="font-family:sans-serif;max-width:420px;margin:20px auto;border:3px dashed #ff5c00;padding:16px"><h2 style="color:#ff5c00">ENA COACH TICKET</h2><table cellpadding=5>' +
        rows(t).filter(function (r) { return r[1]; }).map(function (r) { return '<tr><td>' + r[0] + '</td><td><b>' + esc(r[1]) + '</b></td></tr>'; }).join('') +
        '</table><p>Show this ticket when boarding.</p>');
      w.document.close(); w.print();
    };
    return d;
  }

  function bookingCard(b) {
    var d = document.createElement('div'); d.className = 'enc-m enc-b';
    var r = [['Ref', b.ref], ['Passenger', b.pax], ['Route', b.from + ' → ' + b.to], ['Date', b.date], ['Time', b.time], ['Seat', b.seat], ['Amount', 'KES ' + b.amount]];
    var paid = b.status === 'paid';
    d.innerHTML = '<div class="bk"><h4>🎫 My booking</h4><table>' +
      r.map(function (x) { return '<tr><td>' + x[0] + '</td><td><b>' + esc(x[1]) + '</b></td></tr>'; }).join('') +
      '</table><div class="st' + (paid ? ' ok' : '') + '">' + (paid ? '✅ Paid - ticket issued' : '⏳ Awaiting payment') + '</div></div>';
    return d;
  }
  var store = {};
  // pc-poster
  function fmt(n) { var v = Number(String(n).replace(/[^0-9.]/g, '')); return v ? v.toLocaleString('en-US') : String(n); }
  function payment(p) {
    var d = document.createElement('div'); d.className = 'enc-m enc-a';
    d.style.cssText = 'width:300px;max-width:92%;padding:0;border:2px solid #2f9e44;border-radius:14px;overflow:hidden;background:#fff';
    function row(label, val, size, fill) {
      var r = document.createElement('div'); r.style.cssText = 'padding:8px 12px 0;text-align:center';
      var l = document.createElement('div'); l.textContent = label; l.style.cssText = 'color:#e5252a;font:bold 12px Arial,sans-serif;letter-spacing:.5px';
      var v = document.createElement('div'); v.textContent = val;
      v.style.cssText = 'margin:4px 0 6px;border:2px solid #2f9e44;border-radius:8px;padding:8px 6px;font:bold ' + size + 'px Arial,sans-serif;letter-spacing:1px;word-break:break-all;' + (fill ? 'background:#2f9e44;color:#fff' : 'background:#fff;color:#111');
      r.appendChild(l); r.appendChild(v); return r;
    }
    var h = document.createElement('div'); h.style.cssText = 'background:#2f9e44;color:#fff;padding:10px 12px;display:flex;align-items:center;gap:10px';
    var lg = document.createElement('img'); lg.src = base + '/logo.png?v=2'; lg.style.cssText = 'width:38px;height:38px;border-radius:50%;background:#fff;object-fit:contain';
    var t = document.createElement('div'); t.innerHTML = '<b style="font:bold 17px Arial,sans-serif">ENA COACH</b><br><span style="font:11px Arial,sans-serif;color:#d7f5dd">OFFICIAL PAYMENT DETAILS</span>';
    h.appendChild(lg); h.appendChild(t); d.appendChild(h);
    d.appendChild(row(String(p.accountLabel || 'Paybill').toUpperCase() + ' NUMBER', String(p.number || ''), 26));
    if (p.account) d.appendChild(row('ACCOUNT NUMBER', String(p.account), 22));
    d.appendChild(row('ACCOUNT NAME', String(p.name || 'ENA COACH'), 20));
    if (p.amount) d.appendChild(row('AMOUNT TO PAY', 'KES ' + fmt(p.amount), 24, true));
    var bar = document.createElement('div'); bar.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;padding:6px 12px 4px';
    function cp(label, v) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = label;
      b.style.cssText = 'background:#e7fbe9;color:#075E54;border:1px solid #25D366;border-radius:12px;padding:5px 12px;font:13px system-ui,sans-serif';
      b.onclick = function () { if (navigator.clipboard) navigator.clipboard.writeText(v); b.textContent = 'Copied'; setTimeout(function () { b.textContent = label; }, 1500); };
      bar.appendChild(b);
    }
    cp('Copy ' + String(p.accountLabel || 'Paybill').toLowerCase(), String(p.number || ''));
    if (p.account) cp('Copy account', String(p.account));
    d.appendChild(bar);
    var n = document.createElement('div'); n.textContent = 'Pay via M-Pesa, then reply here with your confirmation message.';
    n.style.cssText = 'padding:0 12px 10px;text-align:center;color:#475569;font:12px Arial,sans-serif';
    d.appendChild(n);
    return d;
  }

  function build(m) {
    var d;
    if (m.type === 'booking' && m.booking) d = bookingCard(m.booking);
    else if (m.type === 'payment') d = payment(m.payment);
    else if (m.type === 'ticket') d = ticket(m.ticket);
    else if (m.type === 'image' && m.file) d = imageBubble(m);
    else { d = document.createElement('div'); d.className = 'enc-m ' + (m.from === 'client' ? 'enc-c' : 'enc-a') + (m.unsent ? ' enc-un' : ''); d.textContent = m.text; }
    if (m.id) { d.setAttribute('data-id', m.id); store[m.id] = m; }
    if (m.likes && m.likes.client) { d.classList.add('enc-liked'); var h = document.createElement('span'); h.className = 'enc-lk'; h.textContent = '\u2764\uFE0F'; d.appendChild(h); }
    return d;
  }
  function imageBubble(m) {
    var d = document.createElement('div'); d.className = 'enc-m enc-img ' + (m.from === 'client' ? 'enc-c' : 'enc-a');
    var im = document.createElement('img'), src = base + '/chatfile/' + encodeURIComponent(m.file);
    im.src = src; im.alt = 'Photo';
    im.onload = function () { if (msgs.lastChild === d) msgs.scrollTop = msgs.scrollHeight; };
    im.onclick = function () { if (Date.now() - menuAt > 700) viewImg(src); };
    d.appendChild(im);
    if (m.caption) { var cp = document.createElement('div'); cp.textContent = m.caption; cp.style.cssText = 'margin:6px 6px 2px'; d.appendChild(cp); }
    return d;
  }
  function add(m) { msgs.appendChild(build(m)); msgs.scrollTop = msgs.scrollHeight; }
  // last agent message the customer has actually seen (kept on this phone, used for the red badge)
  function getSeen() { try { return +localStorage.getItem('enc_seen') || 0; } catch (e) { return 0; } }
  function setSeen(t) { try { if (t > getSeen()) localStorage.setItem('enc_seen', String(t)); } catch (e) {} }
  var lastT = 0;
  function findEl(mid) { return msgs.querySelector('[data-id="' + mid + '"]'); }

  /* ---- press & hold a message: Like / Copy / Unsend / Delete ---- */
  var menu = document.createElement('div'); menu.id = 'enc-menu'; menu.innerHTML = '<div class="enc-mc"></div>'; box.appendChild(menu);
  var toastEl = document.createElement('div'); toastEl.id = 'enc-toast'; box.appendChild(toastEl);
  var menuOpen = false, menuAt = 0, selEl = null, selId = null, lpTimer, lpX = 0, lpY = 0;
  function toast(t) { toastEl.textContent = t; toastEl.style.opacity = 1; clearTimeout(toastEl._h); toastEl._h = setTimeout(function () { toastEl.style.opacity = 0; }, 1300); }
  function copyText(t) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t);
      else { var ta = document.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;opacity:0'; box.appendChild(ta); ta.select(); document.execCommand('copy'); box.removeChild(ta); }
      toast('Copied');
    } catch (e) {}
  }
  function closeMenu() {
    menuOpen = false; menu.style.display = 'none';
    if (selEl) selEl.classList.remove('enc-sel'); selEl = null;
  }
  function openMenu(b) {
    var mid = b.getAttribute('data-id'), m = store[mid];
    if (!m || menuOpen) return;
    menuOpen = true; menuAt = Date.now(); selEl = b; selId = mid; b.classList.add('enc-sel');
    try { navigator.vibrate && navigator.vibrate(15); } catch (e) {}
    var liked = !!(m.likes && m.likes.client), mine = m.from === 'client' && !m.unsent;
    var h = '<div class="enc-pv">' + esc(m.text || '') + '</div>';
    if (!m.unsent) h += '<button data-a="like">' + (liked ? '\uD83D\uDC94 Remove like' : '\u2764\uFE0F Like') + '</button>' + (m.type === 'image' ? '' : '<button data-a="copy">\uD83D\uDCCB Copy</button>');
    if (mine) h += '<button data-a="unsend">\u21A9\uFE0F Unsend</button>';
    h += '<button data-a="del" class="dg">\uD83D\uDDD1\uFE0F Delete</button><button data-a="x">Cancel</button>';
    menu.firstChild.innerHTML = h; menu.style.display = 'flex';
  }
  menu.onclick = function (e) {
    if (Date.now() - menuAt < 350) return;
    var a = e.target.closest ? e.target.closest('[data-a]') : null;
    if (!a) { if (e.target === menu) closeMenu(); return; }
    var act = a.getAttribute('data-a'), mid = selId, m = store[mid];
    closeMenu();
    if (!m || act === 'x') return;
    if (act === 'copy') return copyText(m.text || '');
    if (!socket) return;
    if (act === 'like') socket.emit('like', mid);
    else if (act === 'unsend') socket.emit('unsend', mid);
    else if (act === 'del') socket.emit('delete', mid);
  };
  function cancelLP() { clearTimeout(lpTimer); }
  function bubbleOf(t) { return t && t.closest ? t.closest('.enc-m') : null; }
  msgs.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') return;
    var b = bubbleOf(e.target);
    if (!b || !b.getAttribute('data-id') || e.target.closest('button')) return;
    lpX = e.clientX; lpY = e.clientY; cancelLP();
    lpTimer = setTimeout(function () { openMenu(b); }, 450);
  });
  msgs.addEventListener('pointermove', function (e) { if (Math.abs(e.clientX - lpX) > 10 || Math.abs(e.clientY - lpY) > 10) cancelLP(); });
  ['pointerup', 'pointercancel', 'pointerleave', 'scroll'].forEach(function (ev) { msgs.addEventListener(ev, cancelLP); });
  msgs.addEventListener('contextmenu', function (e) {
    var b = bubbleOf(e.target); if (!b) return;
    e.preventDefault();
    if (b.getAttribute('data-id')) openMenu(b);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen) closeMenu(); });

  /* ---- send a photo / screenshot (e.g. payment proof) ---- */
  var sendBar = $('enc-send'), at = document.createElement('button'), fi = document.createElement('input');
  at.id = 'enc-at'; at.type = 'button'; at.setAttribute('aria-label', 'Attach photo'); at.textContent = '\uD83D\uDCCE';
  fi.type = 'file'; fi.accept = 'image/*'; fi.style.display = 'none';
  sendBar.insertBefore(at, sendBar.firstChild); sendBar.appendChild(fi);
  var prev = document.createElement('div'); prev.id = 'enc-prev';
  prev.innerHTML = '<img alt=""><input id="enc-cap" placeholder="Add a message (optional)" maxlength="200"><div class="pb"><button type="button" class="x">Cancel</button><button type="button" class="go ok">Send</button></div>';
  box.appendChild(prev);
  var lb = document.createElement('div'); lb.id = 'enc-lb'; lb.innerHTML = '<img alt="">'; box.appendChild(lb);
  var pendingImg = null;
  function viewImg(src) { lb.firstChild.src = src; lb.style.display = 'flex'; }
  lb.onclick = function () { lb.style.display = 'none'; };
  function closeOverlays() { lb.style.display = 'none'; prev.style.display = 'none'; pendingImg = null; }
  function compress(file, cb) {
    var img = new Image(), url = URL.createObjectURL(file);
    img.onload = function () {
      var r = Math.min(1, 1600 / Math.max(img.width, img.height)), cv = document.createElement('canvas');
      cv.width = Math.max(1, Math.round(img.width * r)); cv.height = Math.max(1, Math.round(img.height * r));
      var cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      var q = 0.8, out = cv.toDataURL('image/jpeg', q);
      while (out.length > 1000000 && q > 0.35) { q -= 0.1; out = cv.toDataURL('image/jpeg', q); }
      cb(out.length > 1900000 ? null : out);
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    img.src = url;
  }
  at.onclick = function () { if (!socket) return toast('Please wait, connecting...'); fi.click(); };
  fi.onchange = function () {
    var f = fi.files && fi.files[0]; fi.value = '';
    if (!f) return;
    if (!/^image\//.test(f.type)) return toast('Please choose a photo or screenshot');
    toast('Preparing photo...');
    compress(f, function (d) {
      if (!d) return toast('Could not use that image');
      pendingImg = d; prev.querySelector('img').src = d; $('enc-cap').value = ''; prev.style.display = 'flex';
    });
  };
  prev.querySelector('.x').onclick = closeOverlays;
  prev.querySelector('.ok').onclick = function () {
    if (!pendingImg) return;
    if (!socket || !socket.connected) return toast('Not connected. Please try again.');
    socket.emit('file', { data: pendingImg, caption: $('enc-cap').value.trim() });
    tone('out'); closeOverlays(); toast('Sending...');
  };

  function connect(name, phone) {
    if (socket || connecting) { applyStartUI(); return; }
    connecting = true;
    var s = document.createElement('script');
    s.src = base + '/socket.io/socket.io.js';
    s.onload = function () {
      socket = io(base, {
        transports: ['websocket', 'polling'], reconnection: true, reconnectionDelay: 500, reconnectionDelayMax: 3000, timeout: 8000,
        auth: function (cb) { cb({ id: id, name: localStorage.getItem('enc_n') || name, phone: localStorage.getItem('enc_ph') || phone }); }
      });
      socket.on('history', function (h) {
        msgs.innerHTML = ''; store = {}; closeMenu(); h.forEach(add);
        h.forEach(function (m) { if (m.t > lastT) lastT = m.t; });
        if (!h.length) add({ from: 'agent', text: 'Welcome to ENA Coach. How may we assist you today? Kindly share your departure town, destination and travel date, and we will gladly arrange your booking.' });
        if (box.style.display === 'flex') setSeen(lastT);
        else {
          // customer came back to the site: count agent messages sent while they were away
          var seen = getSeen(); unread = h.filter(function (m) { return m.from === 'agent' && m.t > seen; }).length; setBadge(); sync();
        }
        flushOut();
      });
      socket.on('msg', function (m) {
        if (m.id && store[m.id]) return; // already shown
        add(m); if (m.t > lastT) lastT = m.t;
        if (m.type === 'ticket' && m.ticket) { try { window.dispatchEvent(new CustomEvent('enaTicket', { detail: m.ticket })); } catch (e) {} }
        if (m.from === 'agent') {
          if (box.style.display === 'flex') setSeen(m.t);
          else { tone('in'); try { navigator.vibrate && navigator.vibrate([150, 80, 150]); } catch (e) {} unread++; setBadge(); sync(); }
          if (box.style.display === 'flex' && !m.auto) { tone('in'); try { navigator.vibrate && navigator.vibrate([150, 80, 150]); } catch (e) {} }
        }
      });
      socket.on('fileError', function (t) { toast(t); });
      socket.on('msgUpdate', function (m) {
        var old = findEl(m.id), n = build(m);
        if (old) msgs.replaceChild(n, old); else add(m);
      });
      socket.on('msgDelete', function (mid) {
        if (menuOpen && selId === mid) closeMenu();
        var e = findEl(mid); if (e) msgs.removeChild(e); delete store[mid];
      });
    };
    document.head.appendChild(s);
    applyStartUI();
  }
  function applyStartUI() { $('enc-form').style.display = 'none'; $('enc-chips').style.display = 'flex'; $('enc-send').style.display = 'flex'; }
  // actions waiting for the socket to be ready (e.g. booking opened straight after "Proceed to Payment")
  var outbox = [], connecting = false;
  function flushOut() { if (!socket || !socket.connected) return; while (outbox.length) outbox.shift()(); }

  function openChat() {
    box.style.display = 'flex'; btn.style.display = 'none'; lbl.style.display = 'none'; lblGone = true;
    document.body.classList.add('enc-open'); unread = 0; setBadge(); setSeen(lastT); baseH = 0; fit();
    if (!pushed) { history.pushState({ enc: 1 }, ''); pushed = true; }
    var n = localStorage.getItem('enc_n'); if (n && !socket) connect(n, localStorage.getItem('enc_ph'));
  }
  function closeUI() {
    closeMenu(); closeOverlays(); box.style.display = 'none';
    document.body.classList.remove('enc-open'); box.style.height = ''; box.style.top = ''; box.classList.remove('kb'); sync();
    if (afterClose) { var f = afterClose; afterClose = null; try { f(); } catch (e) {} }
  }
  var afterClose = null;
  function closeChat() { if (pushed) { pushed = false; history.back(); } else closeUI(); }
  window.addEventListener('popstate', function () { if (box.style.display === 'flex') { pushed = false; closeUI(); } });

  var baseH = 0;
  function fit() {
    if (box.style.display !== 'flex') return;
    var vv = window.visualViewport; if (!vv) return;
    baseH = Math.max(baseH, vv.height + vv.offsetTop);
    box.style.height = vv.height + 'px'; box.style.top = vv.offsetTop + 'px'; box.style.bottom = 'auto';
    box.classList.toggle('kb', vv.height < baseH - 120);
    msgs.scrollTop = msgs.scrollHeight;
  }
  if (window.visualViewport) { visualViewport.addEventListener('resize', fit); visualViewport.addEventListener('scroll', fit); }
  window.addEventListener('resize', fit);
  $('enc-t').addEventListener('focus', function () { setTimeout(fit, 150); setTimeout(fit, 400); });
  btn.onclick = openChat;
  lbl.onclick = openChat;
  $('enc-back').onclick = closeChat;
  $('enc-start').onclick = function () {
    var n = $('enc-n').value.trim(), p = $('enc-p').value.trim();
    if (!n || !p) return alert('Enter your name and phone');
    localStorage.setItem('enc_n', n); localStorage.setItem('enc_ph', p); connect(n, p);
  };
  Array.prototype.forEach.call($('enc-chips').children, function (c) {
    c.onclick = function () { if (socket) socket.emit('msg', c.textContent.replace(/^\S+\s/, '')); };
  });
  function send() { var v = $('enc-t').value.trim(); if (v && socket) { $('enc-t').focus(); tone('out'); socket.emit('msg', v); $('enc-t').value = ''; $('enc-t').style.height = 'auto'; } }
  $('enc-s').onclick = send;
  $('enc-t').oninput = function () { this.style.height = 'auto'; this.style.height = Math.min(this.scrollHeight, 120) + 'px'; };
  $('enc-t').onkeydown = function (e) { if (e.key === 'Enter' && !e.shiftKey && window.matchMedia('(pointer:fine)').matches) { e.preventDefault(); send(); } };
  // show the button and label on the Home screen only
  function onHome() {
    var h = document.getElementById('screen-home');
    return !!(h && h.classList.contains('active'));
  }
  function sync() {
    if (box.style.display === 'flex') return;
    [lbl, btn].forEach(function (el) { if (!document.body.contains(el)) document.body.appendChild(el); });
    var home = onHome(), showBtn = home || unread > 0;
    if (home && !lblTimer && !lblGone) lblTimer = setTimeout(function () { lblGone = true; lbl.classList.add('gone'); setTimeout(function () { lbl.style.display = 'none'; }, 700); }, 7000);
    lbl.style.display = (home && !lblGone && !unread) ? 'block' : 'none';
    btn.style.display = showBtn ? 'flex' : 'none';
  }
  var lblTimer = null, lblGone = false;
  setInterval(sync, 400); sync();
  // returning customers reconnect in the background so replies still reach them
  if (localStorage.getItem('enc_n')) connect(localStorage.getItem('enc_n'), localStorage.getItem('enc_ph'));
  // reconnect right away when the phone wakes up / comes back online, so new messages never need a refresh
  var hiddenAt = 0;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    if (socket && Date.now() - hiddenAt > 4000) { socket.disconnect(); socket.connect(); }
  });
  window.addEventListener('online', function () { if (socket) { socket.disconnect(); socket.connect(); } });
  setInterval(function () { if (socket && !socket.connected) socket.connect(); }, 5000);
  // called by the booking page when the customer presses "Proceed to Payment"
  function openBooking(b, done) {
    try { if (b.pax && !localStorage.getItem('enc_n')) localStorage.setItem('enc_n', String(b.pax).split(',')[0].trim()); } catch (e) {}
    try { if (b.phone && !localStorage.getItem('enc_ph')) localStorage.setItem('enc_ph', b.phone); } catch (e) {}
    afterClose = done || null;
    openChat();
    $('enc-t').placeholder = 'Type the M-Pesa number you will pay with...';
    outbox.push(function () { socket.emit('booking', b); });
    flushOut();
  }
  window.ENAChat = { open: openChat, openBooking: openBooking };
})();
