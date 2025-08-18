import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const whiskies = pgTable("whiskies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  distillery: text("distillery").notNull(),
  region: text("region").notNull(),
  age: integer("age"),
  abv: decimal("abv", { precision: 4, scale: 1 }),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userWhiskies = pgTable("user_whiskies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  whiskyId: varchar("whisky_id").notNull().references(() => whiskies.id),
  rating: integer("rating"), // 1-5 scale
  tastingNotes: text("tasting_notes"),
  owned: boolean("owned").default(false),
  wishlist: boolean("wishlist").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertWhiskySchema = createInsertSchema(whiskies).omit({
  id: true,
  createdAt: true,
});

export const insertUserWhiskySchema = createInsertSchema(userWhiskies).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertWhisky = z.infer<typeof insertWhiskySchema>;
export type Whisky = typeof whiskies.$inferSelect;
export type InsertUserWhisky = z.infer<typeof insertUserWhiskySchema>;
export type UserWhisky = typeof userWhiskies.$inferSelect;
