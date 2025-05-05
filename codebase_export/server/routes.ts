import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API routes - This endpoint is already defined in auth.ts, 
  // but we're extending it to include more user data
  app.get('/api/user-data', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const userData = await storage.getUserWithData(req.user.id);
    return res.json(userData);
  });
  
  // Lessons
  app.get('/api/lessons', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const lessons = await storage.getLessons(req.user.id);
    return res.json(lessons);
  });
  
  app.get('/api/lessons/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const lesson = await storage.getLesson(parseInt(req.params.id), req.user.id);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    return res.json(lesson);
  });
  
  app.post('/api/lessons/:id/complete', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const result = await storage.completeLesson(parseInt(req.params.id), req.user.id);
    return res.json(result);
  });
  
  // Buildings
  app.get('/api/buildings', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const buildings = await storage.getBuildings(req.user.id);
    return res.json(buildings);
  });
  
  // Shop
  app.get('/api/shop', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const shopItems = await storage.getShopItems(req.user.id);
    return res.json(shopItems);
  });
  
  app.post('/api/shop/purchase/:id', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
      const result = await storage.purchaseItem(parseInt(req.params.id), req.user.id);
      return res.json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: 'An error occurred' });
    }
  });
  
  // Achievements
  app.get('/api/achievements', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const achievements = await storage.getAchievements(req.user.id);
    return res.json(achievements);
  });
  
  // Topics
  app.get('/api/topics', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const topics = await storage.getTopics(req.user.id);
    return res.json(topics);
  });

  const httpServer = createServer(app);

  return httpServer;
}
