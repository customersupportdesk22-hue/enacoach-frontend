// api/notify.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ref, passengers, route, date, time, amount } = req.body;

  const BOT_TOKEN = process.env.TELEGRAM_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: 'Telegram credentials not configured' });
  }

  const text = `🚌 *NEW BOOKING ALERT*\n\n*Ref:* ${ref}\n*Passengers:* ${passengers}\n*Route:* ${route}\n*Date:* ${date}\n*Time:* ${time}\n*Amount:* KES ${amount}\n\n_Check WhatsApp for payment confirmation._`;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();
    if (!data.ok) {
      return res.status(400).json({ error: data.description });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to connect to Telegram' });
  }
}
