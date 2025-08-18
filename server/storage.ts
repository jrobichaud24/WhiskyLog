import { type User, type InsertUser, type Whisky, type InsertWhisky, type UserWhisky, type InsertUserWhisky } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getWhiskies(): Promise<Whisky[]>;
  getWhisky(id: string): Promise<Whisky | undefined>;
  createWhisky(whisky: InsertWhisky): Promise<Whisky>;
  
  getUserWhiskies(userId: string): Promise<UserWhisky[]>;
  getUserWhisky(userId: string, whiskyId: string): Promise<UserWhisky | undefined>;
  createUserWhisky(userWhisky: InsertUserWhisky): Promise<UserWhisky>;
  updateUserWhisky(id: string, userWhisky: Partial<InsertUserWhisky>): Promise<UserWhisky | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private whiskies: Map<string, Whisky>;
  private userWhiskies: Map<string, UserWhisky>;

  constructor() {
    this.users = new Map();
    this.whiskies = new Map();
    this.userWhiskies = new Map();
    
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
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
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
    };
    this.whiskies.set(id, whisky);
    return whisky;
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
}

export const storage = new MemStorage();
