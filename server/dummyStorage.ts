import session from "express-session";
import { IStorage } from "./storage.interface";
import { Notification, UserSettings } from "@shared/schema";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Dummy data
const dummyUsers = [
  {
    id: 1,
    username: "testuser",
    email: "test@example.com",
    password: "", // Will be hashed in initialize()
    firstName: null,
    lastName: null,
    isEmailVerified: false,
    verificationToken: null,
    resetToken: null,
    resetTokenExpiry: null,
    passwordResetToken: null,
    passwordResetExpires: null,
    createdAt: new Date(),
    lastLogin: new Date(),
    updatedAt: new Date()
  }
];

const dummyUserProfiles = [
  {
    userId: 1,
    xp: 100,
    coins: 500,
    level: 2
  }
];

const dummyLessons = [
  {
    id: 1,
    title: "Introduction to Programming",
    topic: "Programming Basics",
    description: "Learn the fundamentals of programming",
    icon: "code",
    iconColor: "blue",
    iconBg: "lightblue",
    questions: [
      {
        id: 1,
        question: "What is a variable?",
        image: null,
        answers: ["A container for storing data", "A type of function", "A programming language", "A computer part"]
      }
    ]
  },
  {
    id: 2,
    title: "HTML Basics",
    topic: "Web Development",
    description: "Learn the basics of HTML",
    icon: "html",
    iconColor: "orange",
    iconBg: "lightorange",
    questions: [
      {
        id: 2,
        question: "What does HTML stand for?",
        image: null,
        answers: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Hyper Text Modern Language"]
      }
    ]
  }
];

const dummyBuildings = [
  {
    id: 1,
    name: "Code Academy",
    description: "Learn programming basics",
    icon: "school",
    type: "education",
    position: { x: 0, y: 0 },
    color: "#4CAF50",
    width: 2,
    height: 2,
    dailyReward: 50,
    lessons: [1, 2]
  }
];

const dummyShopItems = [
  {
    id: 1,
    name: "Premium Course",
    price: 1000,
    type: "course",
    icon: "star",
    color: "gold"
  }
];

const dummyTopics = [
  {
    id: 1,
    name: "Programming Basics",
    lessons: [1]
  },
  {
    id: 2,
    name: "Web Development",
    lessons: [2]
  }
];

const dummyNotifications = [
  {
    id: 1,
    userId: 1,
    title: "Welcome!",
    message: "Welcome to the learning platform",
    type: "info",
    read: false,
    createdAt: new Date()
  }
];

export class DummyStorage implements IStorage {
  sessionStore: session.Store;
  private initialized: boolean = false;

  constructor() {
    this.sessionStore = new session.MemoryStore();
  }

  private async initialize() {
    if (!this.initialized) {
      // Hash the dummy user's password
      const hashed = await hashPassword("password");
      dummyUsers[0].password = hashed;
      this.initialized = true;
    }
  }

  // User related methods
  async createUser(user: any): Promise<Express.User> {
    await this.initialize();
    const newUser = {
      ...user,
      id: dummyUsers.length + 1,
      createdAt: new Date(),
      lastLogin: new Date(),
      updatedAt: new Date()
    };
    
    // Hash the password before storing
    newUser.password = await hashPassword(user.password);
    
    dummyUsers.push(newUser as Express.User);
    return newUser;
  }

  async getUser(id: number): Promise<Express.User | undefined> {
    await this.initialize();
    return dummyUsers.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<Express.User | undefined> {
    await this.initialize();
    return dummyUsers.find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<Express.User | undefined> {
    await this.initialize();
    return dummyUsers.find(u => u.email === email);
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.initialize();
    const user = dummyUsers.find(u => u.id === userId);
    if (user) {
      user.lastLogin = new Date();
      user.updatedAt = new Date();
    }
  }

  async getUserWithData(id: number): Promise<any> {
    await this.initialize();
    const user = await this.getUser(id);
    if (!user) return null;
    
    const profile = dummyUserProfiles.find(p => p.userId === id);
    return {
      ...user,
      profile: profile || {
        xp: 0,
        coins: 0,
        level: 1
      }
    };
  }

  // Lessons
  async getLessons(userId: number): Promise<any[]> {
    return dummyLessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      icon: lesson.icon,
      iconColor: lesson.iconColor,
      iconBg: lesson.iconBg,
      progress: 0 // Dummy progress
    }));
  }

  async getLesson(lessonId: number, userId: number): Promise<any | undefined> {
    const lesson = dummyLessons.find(l => l.id === lessonId);
    if (!lesson) return undefined;

    return {
      id: lesson.id,
      title: lesson.title,
      topic: lesson.topic,
      description: lesson.description,
      totalQuestions: lesson.questions.length,
      currentQuestion: 1,
      progress: 0,
      questions: lesson.questions
    };
  }

  async completeLesson(lessonId: number, userId: number): Promise<any> {
    return { success: true };
  }

  // Buildings
  async getBuildings(userId: number): Promise<any[]> {
    return dummyBuildings.map(building => ({
      ...building,
      owned: true,
      progress: 50,
      lessons: {
        total: building.lessons.length,
        completed: Math.floor(building.lessons.length / 2)
      },
      quizzes: {
        total: building.lessons.length,
        remaining: Math.ceil(building.lessons.length / 2)
      }
    }));
  }

  // Shop
  async getShopItems(userId: number): Promise<any[]> {
    return dummyShopItems.map(item => ({
      ...item,
      owned: false
    }));
  }

  async purchaseItem(itemId: number, userId: number): Promise<any> {
    return { success: true };
  }

  // Topics
  async getTopics(userId: number): Promise<any[]> {
    return dummyTopics.map(topic => ({
      id: topic.id,
      name: topic.name,
      progress: 50,
      lessons: {
        total: topic.lessons.length,
        completed: Math.floor(topic.lessons.length / 2)
      }
    }));
  }

  // Notifications
  async getNotifications(userId: number): Promise<Notification[]> {
    return dummyNotifications.filter(n => n.userId === userId);
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    const notification = dummyNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  async clearAllNotifications(userId: number): Promise<void> {
    // In dummy implementation, we'll just mark all as read
    dummyNotifications
      .filter(n => n.userId === userId)
      .forEach(n => n.read = true);
  }

  async createNotification(userId: number, notification: { title: string; message: string; type: string }): Promise<Notification> {
    const newNotification = {
      id: dummyNotifications.length + 1,
      userId,
      ...notification,
      read: false,
      createdAt: new Date()
    };
    dummyNotifications.push(newNotification);
    return newNotification;
  }

  // Settings
  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    return {
      id: 1,
      userId,
      notificationsEnabled: true,
      soundEnabled: true,
      darkMode: false,
      language: "english",
      helpTipsEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}