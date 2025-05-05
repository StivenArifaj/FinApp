import session from "express-session";
import { Notification, UserSettings } from "@shared/schema";

export interface IStorage {
  // User related
  createUser(user: any): Promise<Express.User>;
  getUser(id: number): Promise<Express.User | undefined>;
  getUserByUsername(username: string): Promise<Express.User | undefined>;
  getUserByEmail(email: string): Promise<Express.User | undefined>;
  updateLastLogin(userId: number): Promise<void>;
  getUserWithData(id: number): Promise<any>;
  
  // Lessons
  getLessons(userId: number): Promise<any[]>;
  getLesson(lessonId: number, userId: number): Promise<any | undefined>;
  completeLesson(lessonId: number, userId: number): Promise<any>;
  
  // Buildings
  getBuildings(userId: number): Promise<any[]>;
  
  // Shop
  getShopItems(userId: number): Promise<any[]>;
  purchaseItem(itemId: number, userId: number): Promise<any>;
  
  // Topics
  getTopics(userId: number): Promise<any[]>;
  
  // Notifications
  getNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  clearAllNotifications(userId: number): Promise<void>;
  createNotification(userId: number, notification: { title: string; message: string; type: string }): Promise<Notification>;
  
  // Settings
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  
  // Session store
  sessionStore: session.SessionStore;
} 