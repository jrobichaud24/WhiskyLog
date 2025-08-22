import { 
  type User, type InsertUser, 
  type Whisky, type InsertWhisky, 
  type UserWhisky, type InsertUserWhisky,
  type Distillery, type InsertDistillery,
  type Product, type InsertProduct,
  type UserProduct, type InsertUserProduct,
  type AppReview, type InsertAppReview
} from "@shared/schema";
import { db } from "./db";
import { users, whiskies, userWhiskies, distilleries, products, userProducts, appReviews } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
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
  
  // Distillery operations
  getDistilleries(): Promise<Distillery[]>;
  getDistillery(id: string): Promise<Distillery | undefined>;
  getDistilleryByName(name: string): Promise<Distillery | undefined>;
  createDistillery(distillery: InsertDistillery): Promise<Distillery>;
  bulkCreateDistilleries(distilleries: InsertDistillery[]): Promise<Distillery[]>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductsByDistillery(distilleryId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  bulkCreateProducts(products: InsertProduct[]): Promise<Product[]>;
  
  // Legacy whisky operations (for backward compatibility)
  getWhiskies(): Promise<Whisky[]>;
  getWhisky(id: string): Promise<Whisky | undefined>;
  createWhisky(whisky: InsertWhisky): Promise<Whisky>;
  
  // User whisky operations
  getUserWhiskies(userId: string): Promise<UserWhisky[]>;
  getUserWhisky(userId: string, whiskyId: string): Promise<UserWhisky | undefined>;
  createUserWhisky(userWhisky: InsertUserWhisky): Promise<UserWhisky>;
  updateUserWhisky(id: string, userWhisky: Partial<InsertUserWhisky>): Promise<UserWhisky | undefined>;
  
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

  async createDistillery(insertDistillery: InsertDistillery): Promise<Distillery> {
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

  async getWhiskies(): Promise<Whisky[]> {
    return await db.select().from(whiskies);
  }

  async getWhisky(id: string): Promise<Whisky | undefined> {
    const [whisky] = await db.select().from(whiskies).where(eq(whiskies.id, id));
    return whisky || undefined;
  }

  async createWhisky(insertWhisky: InsertWhisky): Promise<Whisky> {
    const [whisky] = await db
      .insert(whiskies)
      .values(insertWhisky)
      .returning();
    return whisky;
  }

  async getUserWhiskies(userId: string): Promise<UserWhisky[]> {
    return await db.select().from(userWhiskies).where(eq(userWhiskies.userId, userId));
  }

  async getUserWhisky(userId: string, whiskyId: string): Promise<UserWhisky | undefined> {
    const [userWhisky] = await db
      .select()
      .from(userWhiskies)
      .where(and(eq(userWhiskies.userId, userId), eq(userWhiskies.whiskyId, whiskyId)));
    return userWhisky || undefined;
  }

  async createUserWhisky(insertUserWhisky: InsertUserWhisky): Promise<UserWhisky> {
    const [userWhisky] = await db
      .insert(userWhiskies)
      .values(insertUserWhisky)
      .returning();
    return userWhisky;
  }

  async updateUserWhisky(id: string, updates: Partial<InsertUserWhisky>): Promise<UserWhisky | undefined> {
    const [userWhisky] = await db
      .update(userWhiskies)
      .set(updates)
      .where(eq(userWhiskies.id, id))
      .returning();
    return userWhisky || undefined;
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
}

// Keep MemStorage class for fallback/testing
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private whiskies: Map<string, Whisky>;
  private userWhiskies: Map<string, UserWhisky>;
  private distilleries: Map<string, Distillery>;
  private products: Map<string, Product>;
  private userProducts: Map<string, UserProduct>;

  constructor() {
    this.users = new Map();
    this.whiskies = new Map();
    this.userWhiskies = new Map();
    this.distilleries = new Map();
    this.products = new Map();
    this.userProducts = new Map();
    
    // Initialize with some sample whiskies
    this.initializeSampleWhiskies();
  }

  private initializeSampleWhiskies() {
    const sampleWhiskies: InsertWhisky[] = [
      {
        name: "Macallan 18 Year Old",
        distillery: "The Macallan",
        region: "Speyside",
        age: 18,
        abv: "43.0",
        description: "Rich, complex single malt with notes of dried fruit, ginger, and oak",
      },
      {
        name: "Glenfiddich 21 Year Old",
        distillery: "Glenfiddich",
        region: "Speyside",
        age: 21,
        abv: "40.0",
        description: "Elegant and refined with hints of honey, vanilla, and spice",
      },
      {
        name: "Ardbeg 10 Year Old",
        distillery: "Ardbeg",
        region: "Islay",
        age: 10,
        abv: "46.0",
        description: "Intensely peated with smoky, maritime flavors and citrus notes",
      },
      {
        name: "Lagavulin 16 Year Old",
        distillery: "Lagavulin",
        region: "Islay",
        age: 16,
        abv: "43.0",
        description: "Deep, rich, and peaty with layers of smoke and sweetness",
      },
      {
        name: "Glenlivet 25 Year Old",
        distillery: "The Glenlivet",
        region: "Speyside",
        age: 25,
        abv: "43.0",
        description: "Exceptionally smooth with tropical fruit and oak influence",
      },
      {
        name: "Oban 14 Year Old",
        distillery: "Oban",
        region: "Highland",
        age: 14,
        abv: "43.0",
        description: "Well-balanced with sea salt, orange peel, and light smoke",
      },
    ];

    sampleWhiskies.forEach(whisky => {
      this.createWhisky(whisky);
    });
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

  async getWhiskies(): Promise<Whisky[]> {
    return Array.from(this.whiskies.values());
  }

  async getWhisky(id: string): Promise<Whisky | undefined> {
    return this.whiskies.get(id);
  }

  async createWhisky(insertWhisky: InsertWhisky): Promise<Whisky> {
    const id = randomUUID();
    const whisky: Whisky = {
      ...insertWhisky,
      id,
      createdAt: new Date(),
      age: insertWhisky.age || null,
      abv: insertWhisky.abv || null,
      description: insertWhisky.description || null,
      imageUrl: insertWhisky.imageUrl || null,
    };
    this.whiskies.set(id, whisky);
    return whisky;
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

  async createDistillery(insertDistillery: InsertDistillery): Promise<Distillery> {
    const id = randomUUID();
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
    }));
  }

  async getUserWhiskies(userId: string): Promise<UserWhisky[]> {
    return Array.from(this.userWhiskies.values()).filter(
      (userWhisky) => userWhisky.userId === userId
    );
  }

  async getUserWhisky(userId: string, whiskyId: string): Promise<UserWhisky | undefined> {
    return Array.from(this.userWhiskies.values()).find(
      (userWhisky) => userWhisky.userId === userId && userWhisky.whiskyId === whiskyId
    );
  }

  async createUserWhisky(insertUserWhisky: InsertUserWhisky): Promise<UserWhisky> {
    const id = randomUUID();
    const userWhisky: UserWhisky = {
      ...insertUserWhisky,
      id,
      createdAt: new Date(),
      rating: insertUserWhisky.rating || null,
      tastingNotes: insertUserWhisky.tastingNotes || null,
      owned: insertUserWhisky.owned || false,
      wishlist: insertUserWhisky.wishlist || false,
    };
    this.userWhiskies.set(id, userWhisky);
    return userWhisky;
  }

  async updateUserWhisky(id: string, updates: Partial<InsertUserWhisky>): Promise<UserWhisky | undefined> {
    const existing = this.userWhiskies.get(id);
    if (!existing) return undefined;

    const updated: UserWhisky = { ...existing, ...updates };
    this.userWhiskies.set(id, updated);
    return updated;
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
}

export const storage = new DatabaseStorage();
