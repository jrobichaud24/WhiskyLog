import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isAdmin: boolean("is_admin").default(false).notNull(),
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
  distillery: varchar("distillery").references(() => distilleries.id),
  name: text("name").notNull(),
  price: decimal("price", { precision: 8, scale: 2 }),
  abvPercent: decimal("abv_percent", { precision: 4, scale: 1 }),
  volumeCl: decimal("volume_cl", { precision: 6, scale: 1 }),
  filtration: text("filtration"),
  appearance: text("appearance"),
  description: text("description"),
  tastingNose: text("tasting_nose"),
  tastingTaste: text("tasting_taste"),
  tastingFinish: text("tasting_finish"),
  productUrl: text("product_url"),
  productImage: text("product_image"),
  createdByUserId: varchar("created_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User products table - for tracking user's personal whisky collection with products
export const userProducts = pgTable("user_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  rating: integer("rating"), // 1-10 scale
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
  firstName: true,
  lastName: true,
  isAdmin: true,
});

export const insertDistillerySchema = createInsertSchema(distilleries).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserProductSchema = createInsertSchema(userProducts).omit({
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

export type InsertUserProduct = z.infer<typeof insertUserProductSchema>;
export type UserProduct = typeof userProducts.$inferSelect;

// Badges table - different achievement badges users can earn
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // Lucide icon name
  category: text("category").notNull(), // e.g., "collection", "tasting", "exploration"
  rarity: text("rarity").notNull().default("common"), // common, rare, epic, legendary
  requirement: text("requirement").notNull(), // Description of how to earn the badge
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User badges table - tracks which badges each user has earned
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: varchar("badge_id").notNull().references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
  progress: integer("progress").default(0), // For badges with progress tracking
  maxProgress: integer("max_progress").default(1), // Total needed to complete badge
});

// App Reviews table
export const appReviews = pgTable("app_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-10 scale
  title: varchar("title", { length: 255 }).notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const appReviewsRelations = relations(appReviews, ({ one }) => ({
  user: one(users, {
    fields: [appReviews.userId],
    references: [users.id],
  }),
}));

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

export const insertAppReviewSchema = createInsertSchema(appReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

export type InsertAppReview = z.infer<typeof insertAppReviewSchema>;
export type AppReview = typeof appReviews.$inferSelect;
