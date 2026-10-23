// api/settings.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to Vercel Environment Variables");
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('enacoach');
  const collection = db.collection('settings');

  if (req.method === 'GET') {
    try {
      const settings = await collection.findOne({ _id: 'global' });
      return res.status(200).json(settings || {
        type: 'paybill', number: '756756', account: '1769003', override: 0
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { type, number, account, override } = req.body;
      await collection.updateOne(
        { _id: 'global' }, 
        { $set: { type, number, account, override } }, 
        { upsert: true }
      );
      return res.status(200).json({ success: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
