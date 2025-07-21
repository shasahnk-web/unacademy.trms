import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { batches, batchItems, apiResponses, users, type Batch, type InsertBatch, type BatchItem, type InsertBatchItem, type ApiResponse, type InsertApiResponse, type User, type InsertUser } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Use Neon database configuration
let databaseUrl = process.env.DATABASE_URL;

// If we have individual Neon environment variables, construct the URL
if (process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE) {
  const pgHost = process.env.PGHOST;
  const pgUser = process.env.PGUSER;
  const pgPassword = process.env.PGPASSWORD;
  const pgDatabase = process.env.PGDATABASE;
  const pgPort = process.env.PGPORT || '5432';
  
  databaseUrl = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/${pgDatabase}?sslmode=require`;
}

if (!databaseUrl) {
  throw new Error("DATABASE_URL or Neon database environment variables are required");
}

console.log('Connecting to database...');
const client = postgres(databaseUrl);
const db = drizzle(client);

export interface IStorage {
  // User methods (legacy)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Batch methods
  getAllBatches(): Promise<Batch[]>;
  getBatchByBatchId(batchId: string): Promise<Batch | undefined>;
  createBatch(batch: InsertBatch): Promise<Batch>;
  updateBatch(batchId: string, batch: Partial<InsertBatch>): Promise<Batch | undefined>;
  upsertBatch(batch: InsertBatch): Promise<Batch>;
  
  // Batch items methods
  getBatchItems(batchId: string): Promise<BatchItem[]>;
  createBatchItem(item: InsertBatchItem): Promise<BatchItem>;
  upsertBatchItems(batchId: string, items: InsertBatchItem[]): Promise<BatchItem[]>;
  
  // API response methods
  getLatestApiResponse(batchId: string, endpoint: string): Promise<ApiResponse | undefined>;
  createApiResponse(response: InsertApiResponse): Promise<ApiResponse>;
}

export class PostgresStorage implements IStorage {
  // Legacy user methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Batch methods
  async getAllBatches(): Promise<Batch[]> {
    return await db.select().from(batches).orderBy(desc(batches.createdAt));
  }

  async getBatchByBatchId(batchId: string): Promise<Batch | undefined> {
    const result = await db.select().from(batches).where(eq(batches.batchId, batchId)).limit(1);
    return result[0];
  }

  async createBatch(batch: InsertBatch): Promise<Batch> {
    const result = await db.insert(batches).values(batch).returning();
    return result[0];
  }

  async updateBatch(batchId: string, batch: Partial<InsertBatch>): Promise<Batch | undefined> {
    const result = await db.update(batches)
      .set({ ...batch, updatedAt: new Date() })
      .where(eq(batches.batchId, batchId))
      .returning();
    return result[0];
  }

  async upsertBatch(batch: InsertBatch): Promise<Batch> {
    const existing = await this.getBatchByBatchId(batch.batchId);
    
    if (existing) {
      return await this.updateBatch(batch.batchId, batch) || existing;
    } else {
      return await this.createBatch(batch);
    }
  }

  // Batch items methods
  async getBatchItems(batchId: string): Promise<BatchItem[]> {
    return await db.select().from(batchItems)
      .where(eq(batchItems.batchId, batchId))
      .orderBy(desc(batchItems.liveAt));
  }

  async createBatchItem(item: InsertBatchItem): Promise<BatchItem> {
    const result = await db.insert(batchItems).values(item).returning();
    return result[0];
  }

  async upsertBatchItems(batchId: string, items: InsertBatchItem[]): Promise<BatchItem[]> {
    // First delete existing items for this batch
    await db.delete(batchItems).where(eq(batchItems.batchId, batchId));
    
    // Then insert new items
    if (items.length === 0) return [];
    
    const result = await db.insert(batchItems).values(items).returning();
    return result;
  }

  // API response methods
  async getLatestApiResponse(batchId: string, endpoint: string): Promise<ApiResponse | undefined> {
    const result = await db.select().from(apiResponses)
      .where(eq(apiResponses.batchId, batchId))
      .orderBy(desc(apiResponses.createdAt))
      .limit(1);
    return result[0];
  }

  async createApiResponse(response: InsertApiResponse): Promise<ApiResponse> {
    const result = await db.insert(apiResponses).values(response).returning();
    return result[0];
  }
}

export const storage = new PostgresStorage();
