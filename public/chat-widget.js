(function () {
  var base = document.currentScript.src.replace(/\/chat-widget\.js.*$/, '');
  var css = document.createElement('style');
  css.textContent = `
#enc-btn{position:fixed;right:16px;bottom:90px;width:58px;height:58px;border-radius:50%;background:#ff5c00;color:#fff;border:0;font-size:26px;box-shadow:0 4px 14px rgba(0,0,0,.3);z-index:99999}
#enc-box{position:fixed;right:12px;bottom:90px;width:min(360px,calc(100vw - 24px));height:min(520px,75vh);background:#fff;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.3);display:none;flex-direction:column;overflow:hidden;z-index:99999;font-family:system-ui,sans-serif}
#enc-box header{background:#ff5c00;color:#fff;padding:14px;font-weight:700;display:flex;justify-content:space-between}
#enc-box header span{cursor:pointer}
#enc-msgs{flex:1;overflow-y:auto;padding:12px;background:#f6f7f9;display:flex;flex-direction:column;gap:8px}
.enc-m{max-width:80%;padding:9px 12px;border-radius:14px;font-size:15px;line-height:1.35;word-wrap:break-word}
.enc-c{align-self:flex-end;background:#ff5c00;color:#fff}
.enc-a{align-self:flex-start;background:#fff;color:#111;border:1px solid #e5e7eb}
.enc-t{max-width:95%;padding:0;border:2px dashed #ff5c00;background:#fff;color:#111}
.tk{padding:10px}.tk h4{margin:0 0 6px;color:#ff5c00}.tk td{padding:2px 8px 2px 0;font-size:14px}.tk td:first-child{color:#6b7280}
.tk .go{margin-top:8px;width:100%}
#enc-chips{display:none;gap:6px;padding:6px 10px 0;flex-wrap:wrap}
#enc-chips span{background:#fff3ec;color:#ff5c00;border:1px solid #ff5c00;border-radius:16px;padding:5px 10px;font-size:13px}
#enc-form,#enc-send{padding:10px;display:flex;gap:8px;border-top:1px solid #eee}
#enc-form{flex-direction:column}
#enc-box input{flex:1;padding:11px;border:1px solid #d1d5db;border-radius:10px;font-size:15px}
#enc-box button.go{background:#ff5c00;color:#fff;border:0;border-radius:10px;padding:11px 16px;font-weight:700}`;
  document.head.appendChild(css);

  var box = document.createElement('div'); box.id = 'enc-box';
  box.innerHTML = '<header>Chat with ENA Coach <span id="enc-x">✕</span></header>' +
    '<div id="enc-msgs"></div>' +
    '<div id="enc-form"><input id="enc-n" placeholder="Your name"><input id="enc-p" placeholder="Phone (07xx...)" type="tel"><button class="go" id="enc-start">Start chat</button></div>' +
    '<div id="enc-chips"><span>🎫 Book a ticket</span><span>💰 Check price</span><span>🕒 Departure times</span></div>' +
    '<div id="enc-send" style="display:none"><input id="enc-t" placeholder="Type a message..."><button class="go" id="enc-s">Send</button></div>';
  var btn = document.createElement('button'); btn.id = 'enc-btn'; btn.textContent = '💬';
  document.body.appendChild(box); document.body.appendChild(btn);

  var $ = function (id) { return document.getElementById(id); };
  var msgs = $('enc-msgs'), socket;
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
  function add(m) {
    var d;
    if (m.type === 'ticket') d = ticket(m.ticket);
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
      socket.on('msg', add);
    };
    document.head.appendChild(s);
    $('enc-form').style.display = 'none'; $('enc-chips').style.display = 'flex'; $('enc-send').style.display = 'flex';
  }
  btn.onclick = function () { box.style.display = 'flex'; btn.style.display = 'none';
    var n = localStorage.getItem('enc_n'); if (n && !socket) connect(n, localStorage.getItem('enc_ph')); };
  $('enc-x').onclick = function () { box.style.display = 'none'; btn.style.display = 'block'; };
  $('enc-start').onclick = function () {
    var n = $('enc-n').value.trim(), p = $('enc-p').value.trim();
    if (!n || !p) return alert('Enter your name and phone');
    localStorage.setItem('enc_n', n); localStorage.setItem('enc_ph', p); connect(n, p);
  };
  Array.prototype.forEach.call($('enc-chips').children, function (c) {
    c.onclick = function () { if (socket) socket.emit('msg', c.textContent.replace(/^\S+\s/, '')); };
  });
  function send() { var v = $('enc-t').value.trim(); if (v && socket) { socket.emit('msg', v); $('enc-t').value = ''; } }
  $('enc-s').onclick = send;
  $('enc-t').onkeydown = function (e) { if (e.key === 'Enter') send(); };
  window.ENAChat = { open: function () { btn.onclick(); } };
})();
