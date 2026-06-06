import dns from "node:dns";
import { Db, MongoClient } from "mongodb";

// On Windows, router DNS can reject MongoDB Atlas SRV lookups.
// Use public DNS locally, but leave Vercel/Linux production on system DNS.
if (process.platform === "win32" && !process.env.VERCEL) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing. Add it to .env.local and to Vercel Environment Variables.");
  }
  return uri;
}

export function getClientPromise() {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(getMongoUri());
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getClientPromise();
  return client.db(process.env.MONGODB_DB || "dairy_flat_air");
}
