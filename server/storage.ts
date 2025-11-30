import {
  type User, type InsertUser,
  type Distillery, type InsertDistillery,
  type Product, type InsertProduct,
  type UserProduct, type InsertUserProduct,
  type AppReview, type InsertAppReview,
  type Badge, type InsertBadge,
  type UserBadge, type InsertUserBadge
} from "@shared/schema";
import { db } from "./db";
import { users, distilleries, products, userProducts, appReviews, badges, userBadges } from "@shared/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(userId: string, newPassword: string): Promise<boolean>;
  updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<boolean>;
  deleteUser(userId: string): Promise<boolean>;
  bulkDeleteUsers(userIds: string[]): Promise<boolean>;

  // Distillery operations
  getDistilleries(): Promise<Distillery[]>;
  getDistillery(id: string): Promise<Distillery | undefined>;
  getDistilleryByName(name: string): Promise<Distillery | undefined>;
  createDistillery(distillery: InsertDistillery & { id?: string }): Promise<Distillery>;
  bulkCreateDistilleries(distilleries: InsertDistillery[]): Promise<Distillery[]>;
  bulkDeleteDistilleries(ids: string[]): Promise<boolean>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByDistillery(distilleryId: string): Promise<Product[]>;
  getProductByNameAndDistillery(name: string, distilleryId: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  bulkCreateProducts(products: InsertProduct[]): Promise<Product[]>;
  bulkDeleteProducts(ids: string[]): Promise<boolean>;
  updateProductImage(id: string, imageUrl: string): Promise<Product | undefined>;

  // User product operations
  getUserProducts(userId: string): Promise<UserProduct[]>;
  getUserProduct(userId: string, productId: string): Promise<UserProduct | undefined>;
  createUserProduct(userProduct: InsertUserProduct): Promise<UserProduct>;
  updateUserProduct(id: string, userProduct: Partial<InsertUserProduct>): Promise<UserProduct | undefined>;
  deleteUserProduct(id: string): Promise<boolean>;

  // App review operations
  getAppReviews(): Promise<AppReview[]>;
  createAppReview(review: InsertAppReview): Promise<AppReview>;
  getUserAppReview(userId: string): Promise<AppReview | undefined>;

  // Badge operations
  getBadges(): Promise<Badge[]>;
  getBadge(id: string): Promise<Badge | undefined>;
  createBadge(badge: InsertBadge): Promise<Badge>;

  // User badge operations
  getUserBadges(userId: string): Promise<UserBadge[]>;
  getUserBadge(userId: string, badgeId: string): Promise<UserBadge | undefined>;
  createUserBadge(userBadge: InsertUserBadge): Promise<UserBadge>;
  updateUserBadgeProgress(id: string, progress: number): Promise<UserBadge | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Distillery operations
  async getDistilleries(): Promise<Distillery[]> {
    return await db.select().from(distilleries);
  }

  async getDistillery(id: string): Promise<Distillery | undefined> {
    const [distillery] = await db.select().from(distilleries).where(eq(distilleries.id, id));
    return distillery || undefined;
  }

  async getDistilleryByName(name: string): Promise<Distillery | undefined> {
    const [distillery] = await db.select().from(distilleries).where(eq(distilleries.name, name));
    return distillery || undefined;
  }

  async createDistillery(insertDistillery: InsertDistillery & { id?: string }): Promise<Distillery> {
    const [distillery] = await db
      .insert(distilleries)
      .values(insertDistillery)
      .returning();
    return distillery;
  }

  async bulkCreateDistilleries(insertDistilleries: InsertDistillery[]): Promise<Distillery[]> {
    const result = await db
      .insert(distilleries)
      .values(insertDistilleries)
      .returning();
    return result;
  }

  async bulkDeleteDistilleries(ids: string[]): Promise<boolean> {
    if (ids.length === 0) return true;
    const result = await db
      .delete(distilleries)
      .where(inArray(distilleries.id, ids))
      .returning();
    return result.length > 0;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductsByDistillery(distilleryId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.distillery, distilleryId));
  }

  async getProductByNameAndDistillery(name: string, distilleryId: string): Promise<Product | undefined> {
    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.name, name), eq(products.distillery, distilleryId)));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async bulkCreateProducts(insertProducts: InsertProduct[]): Promise<Product[]> {
    const result = await db
      .insert(products)
      .values(insertProducts)
      .returning();
    return result;
  }

  async bulkDeleteProducts(ids: string[]): Promise<boolean> {
    if (ids.length === 0) return true;
    const result = await db
      .delete(products)
      .where(inArray(products.id, ids))
      .returning();
    return result.length > 0;
  }

  async updateProductImage(id: string, imageUrl: string): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ productImage: imageUrl })
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);

    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: hashedPassword,
      })
      .returning();

    return user;
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId))
      .returning();

    return result.length > 0;
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<boolean> {
    const result = await db
      .update(users)
      .set({ isAdmin })
      .where(eq(users.id, userId))
      .returning();

    return result.length > 0;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    return result.length > 0;
  }

  async bulkDeleteUsers(userIds: string[]): Promise<boolean> {
    if (userIds.length === 0) return true;
    const result = await db
      .delete(users)
      .where(inArray(users.id, userIds))
      .returning();
    return result.length > 0;
  }

  // User product operations
  async getUserProducts(userId: string): Promise<UserProduct[]> {
    return await db.select().from(userProducts).where(eq(userProducts.userId, userId));
  }

  async getUserProduct(userId: string, productId: string): Promise<UserProduct | undefined> {
    const [userProduct] = await db
      .select()
      .from(userProducts)
      .where(and(eq(userProducts.userId, userId), eq(userProducts.productId, productId)));
    return userProduct || undefined;
  }

  async createUserProduct(insertUserProduct: InsertUserProduct): Promise<UserProduct> {
    const [userProduct] = await db
      .insert(userProducts)
      .values(insertUserProduct)
      .returning();
    return userProduct;
  }

  async updateUserProduct(id: string, updates: Partial<InsertUserProduct>): Promise<UserProduct | undefined> {
    const [userProduct] = await db
      .update(userProducts)
      .set(updates)
      .where(eq(userProducts.id, id))
      .returning();
    return userProduct || undefined;
  }

  async deleteUserProduct(id: string): Promise<boolean> {
    const result = await db
      .delete(userProducts)
      .where(eq(userProducts.id, id))
      .returning();
    return result.length > 0;
  }

  // App Reviews operations
  async getAppReviews(): Promise<AppReview[]> {
    const reviews = await db
      .select({
        id: appReviews.id,
        userId: appReviews.userId,
        rating: appReviews.rating,
        title: appReviews.title,
        comment: appReviews.comment,
        createdAt: appReviews.createdAt,
        updatedAt: appReviews.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(appReviews)
      .leftJoin(users, eq(appReviews.userId, users.id))
      .orderBy(desc(appReviews.createdAt));

    return reviews.map(review => ({
      ...review,
      user: review.user || undefined
    })) as AppReview[];
  }

  async createAppReview(insertAppReview: InsertAppReview): Promise<AppReview> {
    const [review] = await db
      .insert(appReviews)
      .values(insertAppReview)
      .returning();
    return review;
  }

  async getUserAppReview(userId: string): Promise<AppReview | undefined> {
    const [review] = await db
      .select()
      .from(appReviews)
      .where(eq(appReviews.userId, userId));
    return review || undefined;
  }

  // Badge operations
  async getBadges(): Promise<Badge[]> {
    return await db.select().from(badges).where(eq(badges.isActive, true));
  }

  async getBadge(id: string): Promise<Badge | undefined> {
    const [badge] = await db.select().from(badges).where(eq(badges.id, id));
    return badge || undefined;
  }

  async createBadge(insertBadge: InsertBadge): Promise<Badge> {
    const [badge] = await db
      .insert(badges)
      .values(insertBadge)
      .returning();
    return badge;
  }

  // User badge operations
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));
  }

  async getUserBadge(userId: string, badgeId: string): Promise<UserBadge | undefined> {
    const [userBadge] = await db
      .select()
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));
    return userBadge || undefined;
  }

  async createUserBadge(insertUserBadge: InsertUserBadge): Promise<UserBadge> {
    const [userBadge] = await db
      .insert(userBadges)
      .values(insertUserBadge)
      .returning();
    return userBadge;
  }

  async updateUserBadgeProgress(id: string, progress: number): Promise<UserBadge | undefined> {
    const [userBadge] = await db
      .update(userBadges)
      .set({ progress })
      .where(eq(userBadges.id, id))
      .returning();
    return userBadge || undefined;
  }
}

// Keep MemStorage class for fallback/testing
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private distilleries: Map<string, Distillery>;
  private products: Map<string, Product>;
  private userProducts: Map<string, UserProduct>;

  constructor() {
    this.users = new Map();
    this.distilleries = new Map();
    this.products = new Map();
    this.userProducts = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      isAdmin: insertUser.isAdmin || false,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;

    user.password = newPassword;
    this.users.set(userId, user);
    return true;
  }

  async updateUserAdminStatus(userId: string, isAdmin: boolean): Promise<boolean> {
    const user = this.users.get(userId);
    if (!user) return false;

    user.isAdmin = isAdmin;
    this.users.set(userId, user);
    return true;
  }

  async deleteUser(userId: string): Promise<boolean> {
    return this.users.delete(userId);
  }

  async bulkDeleteUsers(userIds: string[]): Promise<boolean> {
    userIds.forEach(id => this.users.delete(id));
    return true;
  }

  // Distillery operations
  async getDistilleries(): Promise<Distillery[]> {
    return [];
  }

  async getDistillery(id: string): Promise<Distillery | undefined> {
    return undefined;
  }

  async getDistilleryByName(name: string): Promise<Distillery | undefined> {
    return undefined;
  }

  async createDistillery(insertDistillery: InsertDistillery & { id?: string }): Promise<Distillery> {
    const id = insertDistillery.id || randomUUID();
    const distillery: Distillery = {
      ...insertDistillery,
      id,
      createdAt: new Date(),
      status: insertDistillery.status || "active",
      country: insertDistillery.country || "Scotland",
      founded: insertDistillery.founded || null,
      website: insertDistillery.website || null,
      description: insertDistillery.description || null,
      imageUrl: insertDistillery.imageUrl || null,
    };
    return distillery;
  }

  async bulkCreateDistilleries(distilleries: InsertDistillery[]): Promise<Distillery[]> {
    return distilleries.map(d => ({
      ...d,
      id: randomUUID(),
      createdAt: new Date(),
      status: d.status || "active",
      country: d.country || "Scotland",
      founded: d.founded || null,
      website: d.website || null,
      description: d.description || null,
      imageUrl: d.imageUrl || null,
    }));
  }

  async bulkDeleteDistilleries(ids: string[]): Promise<boolean> {
    ids.forEach(id => this.distilleries.delete(id));
    return true;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return [];
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return undefined;
  }

  async getProductsByDistillery(distilleryId: string): Promise<Product[]> {
    return [];
  }

  async getProductByNameAndDistillery(name: string, distilleryId: string): Promise<Product | undefined> {
    return undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      distillery: insertProduct.distillery || null,
      price: insertProduct.price || null,
      abvPercent: insertProduct.abvPercent || null,
      volumeCl: insertProduct.volumeCl || null,
      filtration: insertProduct.filtration || null,
      appearance: insertProduct.appearance || null,
      description: insertProduct.description || null,
      tastingNose: insertProduct.tastingNose || null,
      tastingTaste: insertProduct.tastingTaste || null,
      tastingFinish: insertProduct.tastingFinish || null,
      productUrl: insertProduct.productUrl || null,
      productImage: insertProduct.productImage || null,
      createdByUserId: insertProduct.createdByUserId || null,
    };
    return product;
  }

  async bulkCreateProducts(products: InsertProduct[]): Promise<Product[]> {
    return products.map(p => ({
      ...p,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      distillery: p.distillery || null,
      price: p.price || null,
      abvPercent: p.abvPercent || null,
      volumeCl: p.volumeCl || null,
      filtration: p.filtration || null,
      appearance: p.appearance || null,
      description: p.description || null,
      tastingNose: p.tastingNose || null,
      tastingTaste: p.tastingTaste || null,
      tastingFinish: p.tastingFinish || null,
      productUrl: p.productUrl || null,
      productImage: p.productImage || null,
      createdByUserId: p.createdByUserId || null,
    }));
  }

  async bulkDeleteProducts(ids: string[]): Promise<boolean> {
    ids.forEach(id => this.products.delete(id));
    return true;
  }

  async updateProductImage(id: string, imageUrl: string): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    product.productImage = imageUrl;
    this.products.set(id, product);
    return product;
  }

  // User product operations (stub implementations)
  async getUserProducts(userId: string): Promise<UserProduct[]> {
    return Array.from(this.userProducts.values()).filter(
      (userProduct) => userProduct.userId === userId
    );
  }

  async getUserProduct(userId: string, productId: string): Promise<UserProduct | undefined> {
    return Array.from(this.userProducts.values()).find(
      (userProduct) => userProduct.userId === userId && userProduct.productId === productId
    );
  }

  async createUserProduct(insertUserProduct: InsertUserProduct): Promise<UserProduct> {
    const id = randomUUID();
    const userProduct: UserProduct = {
      ...insertUserProduct,
      id,
      createdAt: new Date(),
      rating: insertUserProduct.rating || null,
      tastingNotes: insertUserProduct.tastingNotes || null,
      owned: insertUserProduct.owned || false,
      wishlist: insertUserProduct.wishlist || false,
    };
    this.userProducts.set(id, userProduct);
    return userProduct;
  }

  async updateUserProduct(id: string, updates: Partial<InsertUserProduct>): Promise<UserProduct | undefined> {
    const existing = this.userProducts.get(id);
    if (!existing) return undefined;

    const updated: UserProduct = { ...existing, ...updates };
    this.userProducts.set(id, updated);
    return updated;
  }

  async deleteUserProduct(id: string): Promise<boolean> {
    return this.userProducts.delete(id);
  }

  // App review operations (not implemented in memory storage)
  async getAppReviews(): Promise<AppReview[]> {
    return [];
  }

  async createAppReview(review: InsertAppReview): Promise<AppReview> {
    const id = randomUUID();
    const appReview: AppReview = {
      ...review,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return appReview;
  }

  async getUserAppReview(userId: string): Promise<AppReview | undefined> {
    return undefined;
  }

  // Badge operations (not implemented in memory storage)
  async getBadges(): Promise<Badge[]> {
    return [];
  }

  async getBadge(id: string): Promise<Badge | undefined> {
    return undefined;
  }

  async createBadge(badge: InsertBadge): Promise<Badge> {
    const id = randomUUID();
    const newBadge: Badge = {
      ...badge,
      id,
      createdAt: new Date(),
      rarity: badge.rarity || "common",
      isActive: badge.isActive !== undefined ? badge.isActive : true,
    };
    return newBadge;
  }

  // User badge operations (not implemented in memory storage)
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return [];
  }

  async getUserBadge(userId: string, badgeId: string): Promise<UserBadge | undefined> {
    return undefined;
  }

  async createUserBadge(userBadge: InsertUserBadge): Promise<UserBadge> {
    const id = randomUUID();
    const newUserBadge: UserBadge = {
      ...userBadge,
      id,
      earnedAt: new Date(),
      progress: userBadge.progress || 0,
      maxProgress: userBadge.maxProgress || 1,
    };
    return newUserBadge;
  }

  async updateUserBadgeProgress(id: string, progress: number): Promise<UserBadge | undefined> {
    return undefined;
  }
}

export const storage = new DatabaseStorage();
