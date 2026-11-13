const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' }, pingInterval: 10000, pingTimeout: 10000, maxHttpBufferSize: 3e6 });

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serves chat-widget.js and agent.html

// Global error handlers to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

// MongoDB Connection
const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  console.error("Missing MONGODB_URI environment variable");
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 30000 });
  // Wrap in try/catch to handle connection failures gracefully
  global._mongoClientPromise = client.connect().catch(err => {
    console.error("MongoDB connection error:", err);
    throw err; 
  });
}
clientPromise = global._mongoClientPromise;

// Settings Endpoint
app.all('/api/settings', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db('enacoach');
    const collection = db.collection('settings');

    if (req.method === 'GET') {
      const settings = await collection.findOne({ _id: 'global' });
      return res.status(200).json(settings || { type: 'paybill', number: '756756', account: '1769003', override: 0 });
    }

    if (req.method === 'POST') {
      const { type, number, account, override } = req.body;
      await collection.updateOne({ _id: 'global' }, { $set: { type, number, account, override } }, { upsert: true });
      return res.status(200).json({ success: true });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// Telegram Endpoint
app.post('/api/notify', async (req, res) => {
    const { ref, passengers, route, date, time, amount } = req.body;
    const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) return res.status(500).json({ error: 'Telegram credentials not configured' });

    const text = `🚌 *NEW BOOKING ALERT*\n\n*Ref:* ${ref}\n*Passengers:* ${passengers}\n*Route:* ${route}\n*Date:* ${date}\n*Time:* ${time}\n*Amount:* KES ${amount}`;
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: text })
        });
        const data = await response.json();
        if (!data.ok) return res.status(400).json({ error: data.description });
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to connect to Telegram' });
    }
});
// House Viewing Telegram Endpoint
app.post('/api/notify-viewing', async (req, res) => {
    const { name, pickup, people, houseType, budget, date, time, meeting } = req.body;
    const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
        return res.status(500).json({ error: 'Telegram credentials not configured' });
    }

    const text = `🏠 *NEW HOUSE VIEWING BOOKING*\n\n` +
                 `*Name:* ${name}\n` +
                 `*Pickup:* ${pickup}\n` +
                 `*People:* ${people}\n` +
                 `*House Type:* ${houseType}\n` +
                 `*Budget:* KES ${budget}\n` +
                 `*Meeting:* ${meeting}\n` +
                 `*Date:* ${date}\n` +
                 `*Time:* ${time}\n\n` +
                 `*Fee:* KES 1,000`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: text })
        });
        const data = await response.json();
        
        if (!data.ok) return res.status(400).json({ error: data.description });
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to connect to Telegram' });
    }
});

// =====================  LIVE CHAT  =====================
const AGENT_PASSWORD = process.env.AGENT_PASSWORD || 'change-me';
const chatSessions = {}; // id -> { id, name, phone, msgs, unread, last }
let chatCol = null;
let chatFileCol = null;
const memFiles = {}; // fallback when the database is unavailable
const { randomBytes } = require('crypto');

(async () => {
  try {
    const c = await clientPromise;
    chatCol = c.db('enacoach').collection('chats');
    chatFileCol = c.db('enacoach').collection('chatFiles');
    (await chatCol.find().toArray()).forEach((d) => {
      chatSessions[d._id] = { id: d._id, name: d.name, phone: d.phone, msgs: d.msgs || [], unread: d.unread || 0, last: d.last || 0 };
      ensureIds(chatSessions[d._id]);
    });
    console.log('Chat history loaded');
  } catch (e) {
    console.error('Chat DB unavailable, using memory only:', e.message);
  }
})();

function saveChat(c) {
  if (!chatCol) return;
  chatCol.updateOne({ _id: c.id },
    { $set: { name: c.name, phone: c.phone, msgs: c.msgs, unread: c.unread, last: c.last } },
    { upsert: true }).catch(console.error);
}
const clip = (v, n) => String(v || '').slice(0, n);
const newId = () => 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const ensureIds = (c) => c.msgs.forEach((m) => { if (!m.id) m.id = newId(); });
const clientView = (c) => c.msgs.filter((m) => !m.hiddenForClient);

// ---- customer photo / screenshot storage ----
async function putFile(id, type, buf) {
  if (chatFileCol) await chatFileCol.insertOne({ _id: id, type, data: buf.toString('base64'), t: Date.now() });
  else memFiles[id] = { type, buf };
}
async function getFile(id) {
  if (memFiles[id]) return memFiles[id];
  if (!chatFileCol) return null;
  const d = await chatFileCol.findOne({ _id: id });
  return d ? { type: d.type, buf: Buffer.from(d.data, 'base64') } : null;
}
function delFile(id) {
  delete memFiles[id];
  if (chatFileCol) chatFileCol.deleteOne({ _id: id }).catch(console.error);
}
app.get('/chatfile/:id', async (req, res) => {
  try {
    const f = await getFile(String(req.params.id).slice(0, 60));
    if (!f) return res.status(404).end();
    res.set({ 'Content-Type': f.type, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, max-age=86400', 'Cross-Origin-Resource-Policy': 'cross-origin' });
    res.send(f.buf);
  } catch (e) { res.status(500).end(); }
});

async function chatTelegram(text) {
  const T = process.env.TELEGRAM_TOKEN, C = process.env.TELEGRAM_CHAT_ID;
  if (!T || !C) return;
  try {
    await fetch(`https://api.telegram.org/bot${T}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: C, text })
    });
  } catch (e) { console.error('Telegram chat alert failed'); }
}

const agents = io.of('/agent');
agents.use((s, next) =>
  s.handshake.auth.password === AGENT_PASSWORD ? next() : next(new Error('Wrong password')));

function pushMsg(c, m) {
  m.t = Date.now();
  m.id = newId();
  c.msgs.push(m); c.last = m.t;
  if (m.from === 'client') c.unread++;
  io.to(c.id).emit('msg', m);
  agents.emit('update', c);
  saveChat(c);
}

agents.on('connection', (s) => {
  s.emit('sessions', Object.values(chatSessions));
  s.on('reply', ({ id, text }) => {
    const c = chatSessions[id];
    if (!c || !text) return;
    pushMsg(c, { from: 'agent', text: clip(text, 2000) });
  });
  s.on('ticket', ({ id, t }) => {
    const c = chatSessions[id];
    if (!c || !t) return;
    const ticket = {
      no: 'ENA' + Math.floor(100000 + Math.random() * 900000),
      name: clip(t.name, 60), phone: clip(t.phone, 20),
      from: clip(t.from, 40), to: clip(t.to, 40),
      date: clip(t.date, 20), time: clip(t.time, 10),
      bus: clip(t.bus, 20), seat: clip(t.seat, 10), price: clip(t.price, 12)
    };
    pushMsg(c, { from: 'agent', type: 'ticket', ticket, text: 'Ticket ' + ticket.no });
  });
  s.on('payment', ({ id, p }) => {
    const c = chatSessions[id];
    if (!c || !p) return;
    const payment = {
      method: clip(p.method, 30) || 'M-Pesa',
      accountLabel: clip(p.accountLabel, 20) || 'Paybill',
      number: clip(p.number, 30), account: clip(p.account, 40),
      name: clip(p.name, 60), amount: clip(p.amount, 12),
      note: clip(p.note, 200)
    };
    if (!payment.number || !payment.amount) return;
    pushMsg(c, { from: 'agent', type: 'payment', payment, text: 'Payment details: KES ' + payment.amount });
  });
  s.on('confirmPaid', ({ id, ref }) => {
    const c = chatSessions[id];
    if (!c) return;
    const m = c.msgs.find((x) => x.type === 'booking' && x.booking && x.booking.ref === ref);
    if (!m || m.booking.status === 'paid') return;
    m.booking.status = 'paid';
    io.to(c.id).emit('msgUpdate', m);
    const b = m.booking;
    const ticket = { no: b.ref, name: b.pax, phone: b.phone, from: b.from, to: b.to, date: b.date, time: b.time, bus: '', seat: b.seat, price: b.amount };
    pushMsg(c, { from: 'agent', type: 'ticket', ticket, text: 'Ticket ' + ticket.no });
    pushMsg(c, { from: 'agent', text: '✅ Payment received. Thank you! Your official ticket is above. Safe travels with ENA Coach 🚌' });
  });
  s.on('read', (id) => {
    // only act when there is something to mark as read (prevents an endless update <-> read loop)
    if (chatSessions[id] && chatSessions[id].unread) { chatSessions[id].unread = 0; saveChat(chatSessions[id]); agents.emit('update', chatSessions[id]); }
  });
});

io.on('connection', (s) => {
  function joinSession(p) {
    let { id, name, phone } = p || {};
    if (!id) return;
    id = clip(id, 40);
    const c = chatSessions[id] || (chatSessions[id] = { id, name: '', phone: '', msgs: [], unread: 0, last: Date.now() });
    c.name = clip(name || c.name, 60);
    c.phone = clip(phone || c.phone, 20);
    s.join(id); s.data.id = id;
    ensureIds(c);
    s.emit('history', clientView(c));
    agents.emit('update', c); saveChat(c);
  }
  s.on('join', joinSession);
  // join automatically on every (re)connect, so messages sent right after a reconnect are never lost
  if (s.handshake.auth && s.handshake.auth.id) joinSession(s.handshake.auth);

  // ---- customer pressed "Proceed to Payment": booking details arrive in the chat ----
  s.on('booking', (b) => {
    const c = chatSessions[s.data.id];
    if (!c || !b) return;
    const ref = clip(b.ref, 12);
    if (!/^ENA\d{6}$/.test(ref)) return;
    if (c.msgs.some((m) => m.type === 'booking' && m.booking && m.booking.ref === ref)) return; // already in chat
    const now = Date.now();
    s.data.bt = (s.data.bt || []).filter((t) => now - t < 60000);
    if (s.data.bt.length >= 5) return;
    s.data.bt.push(now);
    const booking = {
      ref, from: clip(b.from, 40), to: clip(b.to, 40), date: clip(b.date, 30), time: clip(b.time, 12),
      seat: clip(b.seat, 40), pax: clip(b.pax, 120), phone: clip(b.phone, 20), amount: clip(b.amount, 12), status: 'pending'
    };
    pushMsg(c, { from: 'client', type: 'booking', booking,
      text: `🎫 Booking ${ref}: ${booking.from} → ${booking.to}, ${booking.date} ${booking.time}, seat ${booking.seat}, KES ${booking.amount}` });
    chatTelegram(`💳 BOOKING CHAT - awaiting payment\n${booking.pax} (${booking.phone})\nRef: ${ref}\n${booking.from} → ${booking.to}\n${booking.date} ${booking.time}\nSeat: ${booking.seat}\nAmount: KES ${booking.amount}\n\nReply: https://enacoach-frontend.onrender.com/agent.html`);
    const sw = b.lang === 'sw';
    setTimeout(() => pushMsg(c, { from: 'agent', auto: true, text: sw
      ? `Karibu ${clip(booking.pax.split(',')[0], 40)}! 👋 Tumepokea uhifadhi wako ${ref}. Tafadhali tuandikie nambari ya simu ya M-Pesa utakayotumia kulipa, kisha subiri ombi la M-Pesa au maelezo ya malipo kutoka kwa wakala wetu. Tiketi yako rasmi itatumwa hapa baada ya malipo kuthibitishwa.`
      : `Welcome ${clip(booking.pax.split(',')[0], 40)}! 👋 We have received your booking ${ref}. Please type the M-Pesa phone number you will use to pay, then wait for an M-Pesa prompt or payment details from our agent. Your official ticket will be sent here once payment is confirmed.` }), 600);
  });
  s.on('msg', (text) => {
    const c = chatSessions[s.data.id];
    if (!c || !text) return;
    const isFirst = !c.msgs.some((m) => m.from === 'client');
    pushMsg(c, { from: 'client', text: clip(text, 2000) });
    if (isFirst) chatTelegram(`💬 NEW CHAT\n${c.name} (${c.phone})\n"${clip(text, 200)}"\n\nReply: https://enacoach-frontend.onrender.com/agent.html`);
    else chatTelegram(`💬 ${c.name} (${c.phone}):\n"${clip(text, 200)}"\n\nReply: https://enacoach-frontend.onrender.com/agent.html`);
  });

  // ---- customer sends a photo / screenshot (e.g. payment proof) ----
  s.on('file', async (p) => {
    try {
      const c = chatSessions[s.data.id];
      if (!c || !p || typeof p.data !== 'string' || p.data.length > 3e6) return;
      const now = Date.now();
      s.data.ft = (s.data.ft || []).filter((t) => now - t < 60000);
      if (s.data.ft.length >= 6) return s.emit('fileError', 'Too many uploads. Please wait a minute.');
      const mt = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+\/=]+)$/.exec(p.data);
      if (!mt) return s.emit('fileError', 'Please send a photo or screenshot (JPG or PNG).');
      const buf = Buffer.from(mt[2], 'base64');
      const isJpg = buf[0] === 0xFF && buf[1] === 0xD8;
      const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
      const isWebp = buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP';
      if (!(isJpg || isPng || isWebp) || buf.length > 1.5e6) return s.emit('fileError', 'That image could not be sent. Try a smaller screenshot.');
      s.data.ft.push(now);
      const fid = 'f' + randomBytes(12).toString('hex');
      await putFile(fid, mt[1], buf);
      const caption = clip(p.caption, 200);
      pushMsg(c, { from: 'client', type: 'image', file: fid, caption, text: '📷 Photo' + (caption ? ': ' + caption : '') });
      chatTelegram(`📎 ${c.name} (${c.phone}) sent a photo${caption ? ': "' + caption + '"' : ''}\n\nReply: https://enacoach-frontend.onrender.com/agent.html`);
    } catch (e) {
      console.error('Chat file upload failed:', e.message);
      s.emit('fileError', 'Upload failed. Please try again.');
    }
  });

  // ---- customer actions on a message (press & hold) ----
  const findMsg = (mid) => {
    const c = chatSessions[s.data.id];
    return c ? [c, c.msgs.find((m) => m.id === mid)] : [];
  };
  // Like / unlike a message
  s.on('like', (mid) => {
    const [c, m] = findMsg(mid);
    if (!m || m.unsent || m.hiddenForClient) return;
    m.likes = m.likes || {};
    if (m.likes.client) delete m.likes.client; else m.likes.client = true;
    if (!Object.keys(m.likes).length) delete m.likes;
    io.to(c.id).emit('msgUpdate', m); agents.emit('update', c); saveChat(c);
  });
  // Unsend: customer's own message, removed for everyone (agent sees it as unsent)
  s.on('unsend', (mid) => {
    const [c, m] = findMsg(mid);
    if (!m || m.from !== 'client' || m.unsent) return;
    m.unsent = true; m.text = '🚫 This message was unsent'; delete m.likes;
    if (m.file) delFile(m.file);
    delete m.file; delete m.type; delete m.caption;
    io.to(c.id).emit('msgUpdate', m); agents.emit('update', c); saveChat(c);
  });
  // Delete: removed from the customer's own chat view only
  s.on('delete', (mid) => {
    const [c, m] = findMsg(mid);
    if (!m) return;
    m.hiddenForClient = true;
    io.to(c.id).emit('msgDelete', mid); agents.emit('update', c); saveChat(c);
  });
});
// ===================  END LIVE CHAT  ===================

// Root Route
app.get('/', (req, res) => {
    res.send('🚌 ENA Coach Backend is running perfectly!');
});

// Start Server
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
