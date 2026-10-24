// api/settings.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to Vercel Environment Variables");
}

// Use a global variable to cache the connection
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
      maxPoolSize: 10 // Limit connections
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production (Vercel), reuse the connection across warm invocations
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 30000,
      maxPoolSize: 10
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
}

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('enacoach');
    const collection = db.collection('settings');

    if (req.method === 'GET') {
      const settings = await collection.findOne({ _id: 'global' });
      return res.status(200).json(settings || {
        type: 'paybill', number: '756756', account: '1769003', override: 0
      });
    }

    if (req.method === 'POST') {
      const { type, number, account, override } = req.body;
      await collection.updateOne(
        { _id: 'global' }, 
        { $set: { type, number, account, override } }, 
        { upsert: true }
      );
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error("MongoDB Connection Error:", e); // This will show in Vercel logs
    return res.status(500).json({ error: 'Database connection failed' });
  }
}