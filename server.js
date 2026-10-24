import { MongoClient } from 'mongodb';
import { Resend } from 'resend';

// Standard CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    // 1. Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Helper for JSON responses
    const json = (data, status = 200) => new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

    try {
      // --- ROUTE: / (Health Check) ---
      if (path === '/' && request.method === 'GET') {
        return new Response('🚌 ENA Coach Backend is running on Cloudflare!', { headers: corsHeaders });
      }

      // Setup MongoDB Connection
      const uri = env.MONGODB_URI; 
      if (!uri) throw new Error("Missing MONGODB_URI secret");
      
      const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
      await client.connect();
      const db = client.db('enacoach');

      // --- ROUTE: /api/settings ---
      if (path === '/api/settings') {
        const collection = db.collection('settings');

        if (request.method === 'GET') {
          const settings = await collection.findOne({ _id: 'global' });
          await client.close();
          return json(settings || { type: 'paybill', number: '756756', account: '1769003', override: 0 });
        }

        if (request.method === 'POST') {
          const body = await request.json();
          await collection.updateOne(
            { _id: 'global' }, 
            { $set: body }, 
            { upsert: true }
          );
          await client.close();
          return json({ success: true });
        }
      }

      // --- ROUTE: /api/notify (Telegram) ---
      if (path === '/api/notify' && request.method === 'POST') {
        const body = await request.json();
        const { ref, passengers, route, date, time, amount } = body;
        
        const BOT_TOKEN = env.TELEGRAM_TOKEN;
        const CHAT_ID = env.TELEGRAM_CHAT_ID;

        if (!BOT_TOKEN || !CHAT_ID) return json({ error: 'Telegram config missing' }, 500);

        const text = `🚌 *NEW BOOKING ALERT*\n\n*Ref:* ${ref}\n*Passengers:* ${passengers}\n*Route:* ${route}\n*Date:* ${date}\n*Time:* ${time}\n*Amount:* KES ${amount}`;
        
        const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await fetch(tgUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: CHAT_ID, text: text })
        });
        
        const data = await response.json();
        await client.close();
        if (!data.ok) return json({ error: data.description }, 400);
        return json({ success: true });
      }

      // --- ROUTE: /api/send-code (Resend Email) ---
      if (path === '/api/send-code' && request.method === 'POST') {
        const { email } = await request.json();
        const collection = db.collection('users');

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save to DB
        await collection.updateOne(
          { email: email },
          { $set: { verificationCode: code, codeExpiry: Date.now() + 300000 } },
          { upsert: true }
        );

        // Send Email via Resend
        const resend = new Resend(env.RESEND_API_KEY);
        const { error } = await resend.emails.send({
          from: 'ENA Coach <onboarding@resend.dev>', 
          to: [email],
          subject: 'ENA Coach - Email Verification Code',
          html: `<p>Your ENA Coach verification code is: <strong>${code}</strong></p>`
        });

        await client.close();
        if (error) return json({ error: 'Failed to send email' }, 500);
        return json({ success: true });
      }

      // --- ROUTE: /api/verify-register ---
      if (path === '/api/verify-register' && request.method === 'POST') {
        const { name, email, phone, password, code } = await request.json();
        const collection = db.collection('users');

        const user = await collection.findOne({ email: email });

        if (!user || user.verificationCode !== code) {
            await client.close();
            return json({ error: 'Invalid verification code' }, 400);
        }
        
        if (Date.now() > user.codeExpiry) {
            await client.close();
            return json({ error: 'Code has expired' }, 400);
        }

        await collection.updateOne(
            { email: email },
            { $set: { name, phone, password, verified: true }, $unset: { verificationCode: "", codeExpiry: "" } }
        );
        
        await client.close();
        return json({ success: true });
      }

      await client.close();
      return json({ error: 'Route not found' }, 404);

    } catch (e) {
      console.error(e);
      return json({ error: e.message }, 500);
    }
  }
};