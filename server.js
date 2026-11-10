const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

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

(async () => {
  try {
    const c = await clientPromise;
    chatCol = c.db('enacoach').collection('chats');
    (await chatCol.find().toArray()).forEach((d) => {
      chatSessions[d._id] = { id: d._id, name: d.name, phone: d.phone, msgs: d.msgs || [], unread: d.unread || 0, last: d.last || 0 };
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
  s.on('read', (id) => {
    if (chatSessions[id]) { chatSessions[id].unread = 0; saveChat(chatSessions[id]); agents.emit('update', chatSessions[id]); }
  });
});

io.on('connection', (s) => {
  s.on('join', ({ id, name, phone }) => {
    if (!id) return;
    id = clip(id, 40);
    const c = chatSessions[id] || (chatSessions[id] = { id, name: '', phone: '', msgs: [], unread: 0, last: Date.now() });
    c.name = clip(name || c.name, 60);
    c.phone = clip(phone || c.phone, 20);
    s.join(id); s.data.id = id;
    s.emit('history', c.msgs);
    agents.emit('update', c); saveChat(c);
  });
  s.on('msg', (text) => {
    const c = chatSessions[s.data.id];
    if (!c || !text) return;
    const isFirst = !c.msgs.some((m) => m.from === 'client');
    pushMsg(c, { from: 'client', text: clip(text, 2000) });
    if (isFirst) chatTelegram(`💬 NEW CHAT\n${c.name} (${c.phone})\n"${clip(text, 200)}"\n\nReply: https://enacoach-frontend.onrender.com/agent.html`);
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
