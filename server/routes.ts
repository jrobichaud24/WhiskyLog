import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWhiskySchema, insertUserWhiskySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
