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

// Distilleries table - master list of all Scottish distilleries
export const distilleries = pgTable("distilleries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  region: text("region").notNull(), // Speyside, Highland, Islay, Lowland, Campbeltown, Islands
  country: text("country").notNull().default("Scotland"),
  founded: integer("founded"), // Year founded
  status: text("status").default("active"), // active, closed, demolished
  website: text("website"),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table - all whisky products from all distilleries
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  distilleryId: varchar("distillery_id").notNull().references(() => distilleries.id),
  age: integer("age"), // Age statement in years, null for NAS (No Age Statement)
  abv: decimal("abv", { precision: 4, scale: 1 }).notNull(), // Alcohol by volume
  caskType: text("cask_type"), // Bourbon, Sherry, Port, etc.
  bottler: text("bottler"), // OB (Official Bottling) or IB (Independent Bottling)
  vintage: integer("vintage"), // Year distilled
  bottled: integer("bottled"), // Year bottled  
  limitedEdition: boolean("limited_edition").default(false),
  description: text("description"),
  tastingNotes: text("tasting_notes"),
  imageUrl: text("image_url"),
  price: decimal("price", { precision: 8, scale: 2 }), // Retail price
  availability: text("availability").default("available"), // available, discontinued, limited
  createdAt: timestamp("created_at").defaultNow(),
});

// Keep whiskies table for backward compatibility, but reference products
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

// Schema validations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertDistillerySchema = createInsertSchema(distilleries).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertWhiskySchema = createInsertSchema(whiskies).omit({
  id: true,
  createdAt: true,
});

export const insertUserWhiskySchema = createInsertSchema(userWhiskies).omit({
  id: true,
  createdAt: true,
});

// Bulk import schemas
export const bulkDistillerySchema = z.array(insertDistillerySchema);
export const bulkProductSchema = z.array(insertProductSchema);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDistillery = z.infer<typeof insertDistillerySchema>;
export type Distillery = typeof distilleries.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertWhisky = z.infer<typeof insertWhiskySchema>;
export type Whisky = typeof whiskies.$inferSelect;

export type InsertUserWhisky = z.infer<typeof insertUserWhiskySchema>;
export type UserWhisky = typeof userWhiskies.$inferSelect;
