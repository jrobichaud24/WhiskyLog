import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertWhiskySchema, 
  insertUserWhiskySchema, 
  insertUserSchema,
  insertDistillerySchema,
  insertProductSchema,
  bulkDistillerySchema,
  bulkProductSchema
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import session from "express-session";

// Extend session interface
declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure sessions
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  }));
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Create user
      const user = await storage.createUser(validatedData);
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // Find user by username or email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
      
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      
      if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists for security
        return res.json({ message: "If an account with that email exists, a password reset has been processed" });
      }
      
      const success = await storage.updateUserPassword(user.id, newPassword);
      if (success) {
        res.json({ message: "Password reset successfully" });
      } else {
        res.status(500).json({ message: "Failed to reset password" });
      }
      
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  // Whisky routes
  app.get("/api/whiskies", async (req, res) => {
    try {
      const whiskies = await storage.getWhiskies();
      res.json(whiskies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch whiskies" });
    }
  });

  app.get("/api/whiskies/:id", async (req, res) => {
    try {
      const whisky = await storage.getWhisky(req.params.id);
      if (!whisky) {
        return res.status(404).json({ message: "Whisky not found" });
      }
      res.json(whisky);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch whisky" });
    }
  });

  app.post("/api/whiskies", async (req, res) => {
    try {
      const validatedData = insertWhiskySchema.parse(req.body);
      const whisky = await storage.createWhisky(validatedData);
      res.status(201).json(whisky);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid whisky data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create whisky" });
    }
  });

  // User whisky routes (ratings, collections, etc.)
  app.get("/api/user-whiskies/:userId", async (req, res) => {
    try {
      const userWhiskies = await storage.getUserWhiskies(req.params.userId);
      res.json(userWhiskies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user whiskies" });
    }
  });

  app.post("/api/user-whiskies", async (req, res) => {
    try {
      const validatedData = insertUserWhiskySchema.parse(req.body);
      
      // Check if user whisky already exists
      const existing = await storage.getUserWhisky(validatedData.userId, validatedData.whiskyId);
      if (existing) {
        return res.status(409).json({ message: "User whisky already exists" });
      }

      const userWhisky = await storage.createUserWhisky(validatedData);
      res.status(201).json(userWhisky);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user whisky data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user whisky" });
    }
  });

  // Distillery routes
  app.get("/api/distilleries", async (req, res) => {
    try {
      const distilleries = await storage.getDistilleries();
      res.json(distilleries);
    } catch (error) {
      console.error("Get distilleries error:", error);
      res.status(500).json({ message: "Failed to fetch distilleries" });
    }
  });

  app.get("/api/distilleries/:id", async (req, res) => {
    try {
      const distillery = await storage.getDistillery(req.params.id);
      if (!distillery) {
        return res.status(404).json({ message: "Distillery not found" });
      }
      res.json(distillery);
    } catch (error) {
      console.error("Get distillery error:", error);
      res.status(500).json({ message: "Failed to fetch distillery" });
    }
  });

  app.post("/api/distilleries", async (req, res) => {
    try {
      const validatedData = insertDistillerySchema.parse(req.body);
      const distillery = await storage.createDistillery(validatedData);
      res.status(201).json(distillery);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid distillery data", errors: error.errors });
      }
      console.error("Create distillery error:", error);
      res.status(500).json({ message: "Failed to create distillery" });
    }
  });

  // Bulk import distilleries from spreadsheet
  app.post("/api/distilleries/bulk", async (req, res) => {
    try {
      const validatedData = bulkDistillerySchema.parse(req.body);
      const distilleries = await storage.bulkCreateDistilleries(validatedData);
      res.status(201).json({
        message: `Successfully imported ${distilleries.length} distilleries`,
        distilleries
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid distillery data", 
          errors: error.errors 
        });
      }
      console.error("Bulk create distilleries error:", error);
      res.status(500).json({ message: "Failed to import distilleries" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Get products error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Get product error:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get("/api/distilleries/:distilleryId/products", async (req, res) => {
    try {
      const products = await storage.getProductsByDistillery(req.params.distilleryId);
      res.json(products);
    } catch (error) {
      console.error("Get products by distillery error:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      console.error("Create product error:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Bulk import products from spreadsheet
  app.post("/api/products/bulk", async (req, res) => {
    try {
      const validatedData = bulkProductSchema.parse(req.body);
      const products = await storage.bulkCreateProducts(validatedData);
      res.status(201).json({
        message: `Successfully imported ${products.length} products`,
        products
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          errors: error.errors 
        });
      }
      console.error("Bulk create products error:", error);
      res.status(500).json({ message: "Failed to import products" });
    }
  });

  app.put("/api/user-whiskies/:id", async (req, res) => {
    try {
      const updates = req.body;
      const userWhisky = await storage.updateUserWhisky(req.params.id, updates);
      
      if (!userWhisky) {
        return res.status(404).json({ message: "User whisky not found" });
      }

      res.json(userWhisky);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user whisky" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
