import { pgTable, text, serial, integer, boolean, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const batches = pgTable("batches", {
  id: uuid("id").defaultRandom().primaryKey(),
  batchId: text("batch_id").notNull().unique(),
  batchName: text("batch_name").notNull(),
  exam: text("exam"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  totalTeachers: integer("total_teachers").default(0),
  status: text("status").default("active"),
  teacherData: jsonb("teacher_data"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const batchItems = pgTable("batch_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  batchId: text("batch_id").notNull(),
  itemType: text("item_type").notNull(),
  title: text("title"),
  itemData: jsonb("item_data").notNull(),
  externalId: text("external_id"),
  liveAt: timestamp("live_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const apiResponses = pgTable("api_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  batchId: text("batch_id").notNull(),
  endpoint: text("endpoint").notNull(),
  responseData: jsonb("response_data").notNull(),
  statusCode: integer("status_code").notNull(),
  responseTimeMs: integer("response_time_ms"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const insertBatchSchema = createInsertSchema(batches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBatchItemSchema = createInsertSchema(batchItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApiResponseSchema = createInsertSchema(apiResponses).omit({
  id: true,
  createdAt: true,
});

export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batches.$inferSelect;
export type InsertBatchItem = z.infer<typeof insertBatchItemSchema>;
export type BatchItem = typeof batchItems.$inferSelect;
export type InsertApiResponse = z.infer<typeof insertApiResponseSchema>;
export type ApiResponse = typeof apiResponses.$inferSelect;

// Legacy schema for compatibility
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
