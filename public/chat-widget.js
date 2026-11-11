(function () {
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
#enc-box header{background:#075E54;color:#fff;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 10px;display:flex;align-items:center;gap:10px}
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
body.enc-open{overflow:hidden}`;
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
      rows(t).map(function (r) { return '<tr><td>' + r[0] + '</td><td><b>' + esc(r[1]) + '</b></td></tr>'; }).join('') +
      '</table><button class="go">Print / Save PDF</button></div>';
    d.querySelector('button').onclick = function () {
      var w = window.open('', '_blank');
      w.document.write('<title>' + esc(t.no) + '</title><body style="font-family:sans-serif;max-width:420px;margin:20px auto;border:3px dashed #ff5c00;padding:16px"><h2 style="color:#ff5c00">ENA COACH TICKET</h2><table cellpadding=5>' +
        rows(t).map(function (r) { return '<tr><td>' + r[0] + '</td><td><b>' + esc(r[1]) + '</b></td></tr>'; }).join('') +
        '</table><p>Show this ticket when boarding.</p>');
      w.document.close(); w.print();
    };
    return d;
  }
  function payment(p) {
    var d = document.createElement('div'); d.className = 'enc-m enc-a enc-p';
    var r = [['Pay via', p.method || 'M-Pesa'], [p.accountLabel || 'Paybill', p.number, 1], ['Account', p.account, 1],
      ['Name', p.name]].filter(function (x) { return x[1]; });
    d.innerHTML = '<div class="pay"><h4>💳 PAYMENT DETAILS</h4><table>' +
      r.map(function (x) { return '<tr><td>' + esc(x[0]) + '</td><td><b>' + esc(x[1]) + '</b>' +
        (x[2] ? '<button class="cp" data-v="' + esc(x[1]) + '">Copy</button>' : '') + '</td></tr>'; }).join('') +
      '<tr><td>Amount</td><td><b class="amt">KES ' + esc(p.amount) + '</b></td></tr></table>' +
      '<p>' + esc(p.note || 'Send the payment, then reply here with the confirmation message.') + '</p></div>';
    Array.prototype.forEach.call(d.querySelectorAll('.cp'), function (b) {
      b.onclick = function () {
        var v = b.getAttribute('data-v');
        if (navigator.clipboard) navigator.clipboard.writeText(v);
        b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1500);
      };
    });
    return d;
  }
  function add(m) {
    var d;
    if (m.type === 'payment') d = payment(m.payment);
    else if (m.type === 'ticket') d = ticket(m.ticket);
    else { d = document.createElement('div'); d.className = 'enc-m ' + (m.from === 'client' ? 'enc-c' : 'enc-a'); d.textContent = m.text; }
    msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
  }
  function connect(name, phone) {
    var s = document.createElement('script');
    s.src = base + '/socket.io/socket.io.js';
    s.onload = function () {
      socket = io(base);
      socket.on('connect', function () { socket.emit('join', { id: id, name: name, phone: phone }); });
      socket.on('history', function (h) { msgs.innerHTML = ''; h.forEach(add);
        if (!h.length) add({ from: 'agent', text: 'Hello! 👋 Tell us where you are travelling from, to, and the date, and we will book your ticket.' }); });
      socket.on('msg', function (m) {
        add(m);
        if (m.from === 'agent') {
          tone('in'); try { navigator.vibrate && navigator.vibrate([150, 80, 150]); } catch (e) {}
          if (box.style.display !== 'flex') { unread++; setBadge(); }
        }
      });
    };
    document.head.appendChild(s);
    $('enc-form').style.display = 'none'; $('enc-chips').style.display = 'flex'; $('enc-send').style.display = 'flex';
  }

  function openChat() {
    box.style.display = 'flex'; btn.style.display = 'none'; lbl.style.display = 'none';
    document.body.classList.add('enc-open'); unread = 0; setBadge();
    if (!pushed) { history.pushState({ enc: 1 }, ''); pushed = true; }
    var n = localStorage.getItem('enc_n'); if (n && !socket) connect(n, localStorage.getItem('enc_ph'));
  }
  function closeUI() {
    box.style.display = 'none';
    document.body.classList.remove('enc-open'); sync();
  }
  function closeChat() { if (pushed) { pushed = false; history.back(); } else closeUI(); }
  window.addEventListener('popstate', function () { if (box.style.display === 'flex') { pushed = false; closeUI(); } });

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
  function send() { var v = $('enc-t').value.trim(); if (v && socket) { tone('out'); socket.emit('msg', v); $('enc-t').value = ''; $('enc-t').style.height = 'auto'; } }
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
    var show = onHome();
    lbl.style.display = show ? 'block' : 'none';
    btn.style.display = show ? 'flex' : 'none';
  }
  setInterval(sync, 400); sync();
  // returning customers reconnect in the background so replies still reach them
  if (localStorage.getItem('enc_n')) connect(localStorage.getItem('enc_n'), localStorage.getItem('enc_ph'));
  window.ENAChat = { open: openChat };
})();
