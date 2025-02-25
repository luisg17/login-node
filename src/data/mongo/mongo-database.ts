import { MongoClient, Db } from 'mongodb';

interface Options {
  mongoUrl: string;
  dbName: string;
}

export class MongoDatabase {
  private static client: MongoClient;
  private static db: Db;

  static async connect(options: Options) {
    const { mongoUrl, dbName } = options;

    try {
      this.client = new MongoClient(mongoUrl);
      
      await this.client.connect();
      
      this.db = this.client.db(dbName);
      
      console.log('MongoDB connection successful');
      return true;

    } catch (error) {
      console.log('MongoDB connection error');
      throw error;
    }
  }

  static getDatabase(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  static async disconnect() {
    if (this.client) {
      await this.client.close();
      console.log('MongoDB connection closed');
    }
  }
}