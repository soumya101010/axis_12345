import { MongoClient } from "mongodb";
import dns from "dns";

// Force use of Google's public DNS servers to resolve MongoDB Atlas SRV records
// System DNS may block SRV queries for mongodb+srv:// connections on some networks
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

function getClientPromise(): Promise<MongoClient> {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
    }

    if (process.env.NODE_ENV === "development") {
        let globalWithMongo = global as typeof globalThis & {
            _mongoClientPromise?: Promise<MongoClient>;
        };

        if (!globalWithMongo._mongoClientPromise) {
            client = new MongoClient(uri, options);
            globalWithMongo._mongoClientPromise = client.connect();
        }
        return globalWithMongo._mongoClientPromise;
    } else {
        client = new MongoClient(uri, options);
        return client.connect();
    }
}

// Lazy: only connect when actually imported and used at runtime
clientPromise = typeof process !== 'undefined' && process.env.MONGODB_URI
    ? getClientPromise()
    : (new Promise(() => { }) as Promise<MongoClient>); // no-op during build

export default clientPromise;
