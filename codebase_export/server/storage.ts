import { db } from "@db";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "@db";
import {
  users,
  userProfiles,
  lessons,
  lessonProgress,
  buildings,
  buildingOwnership,
  shopItems,
  achievements,
  userAchievements,
  topics,
  topicProgress,
  questions,
  InsertUser
} from "@shared/schema";
import { eq, and, or } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User related
  createUser(user: InsertUser): Promise<Express.User>;
  getUser(id: number): Promise<Express.User | undefined>;
  getUserByUsername(username: string): Promise<Express.User | undefined>;
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
  
  // Achievements
  getAchievements(userId: number): Promise<any[]>;
  
  // Topics
  getTopics(userId: number): Promise<any[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // User related methods
  async createUser(user: InsertUser): Promise<Express.User> {
    const [newUser] = await db.insert(users).values(user).returning();
    
    // Create user profile with initial values
    await db.insert(userProfiles).values({
      userId: newUser.id,
      xp: 0,
      coins: 50,
      level: 1
    });
    
    return newUser;
  }
  
  async getUser(id: number): Promise<Express.User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id)
    });
    
    return user || undefined;
  }
  
  async getUserByUsername(username: string): Promise<Express.User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username)
    });
    
    return user || undefined;
  }
  
  async getUserWithData(id: number): Promise<any> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        profile: true
      }
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Format the user data for the frontend
    return {
      id: user.id,
      username: user.username,
      xp: user.profile?.xp || 0,
      coins: user.profile?.coins || 0,
      level: user.profile?.level || 1
    };
  }
  
  // Lessons
  async getLessons(userId: number): Promise<any[]> {
    const userLessons = await db.query.lessons.findMany({
      with: {
        progress: {
          where: eq(lessonProgress.userId, userId)
        }
      }
    });
    
    return userLessons.map(lesson => ({
      id: lesson.id,
      title: lesson.title,
      icon: lesson.icon,
      iconColor: lesson.iconColor,
      iconBg: lesson.iconBg,
      progress: lesson.progress.length > 0 
        ? lesson.progress[0].progress 
        : 0
    }));
  }
  
  async getLesson(lessonId: number, userId: number): Promise<any | undefined> {
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      with: {
        progress: {
          where: eq(lessonProgress.userId, userId)
        },
        questions: true
      }
    });
    
    if (!lesson) {
      return undefined;
    }
    
    return {
      id: lesson.id,
      title: lesson.title,
      topic: lesson.topic,
      description: lesson.description,
      totalQuestions: lesson.questions.length,
      currentQuestion: lesson.progress.length > 0 
        ? lesson.progress[0].currentQuestion 
        : 1,
      progress: lesson.progress.length > 0 
        ? lesson.progress[0].progress 
        : 0,
      questions: lesson.questions.map(q => ({
        id: q.id,
        text: q.question,
        image: q.image,
        answers: q.answers
      }))
    };
  }
  
  async completeLesson(lessonId: number, userId: number): Promise<any> {
    // Check if user already has progress for this lesson
    const existingProgress = await db.query.lessonProgress.findFirst({
      where: and(
        eq(lessonProgress.lessonId, lessonId),
        eq(lessonProgress.userId, userId)
      )
    });
    
    const userProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId)
    });
    
    if (!userProfile) {
      throw new Error("User profile not found");
    }
    
    // Reward user with XP and coins
    const xpReward = 25;
    const coinReward = 10;
    
    if (existingProgress) {
      // Update progress
      await db.update(lessonProgress)
        .set({
          progress: 100,
          completed: true,
          updatedAt: new Date()
        })
        .where(eq(lessonProgress.id, existingProgress.id));
    } else {
      // Create new progress
      await db.insert(lessonProgress).values({
        userId,
        lessonId,
        progress: 100,
        currentQuestion: 5, // Assuming 5 questions per lesson
        completed: true
      });
    }
    
    // Update user profile
    await db.update(userProfiles)
      .set({
        xp: userProfile.xp + xpReward,
        coins: userProfile.coins + coinReward
      })
      .where(eq(userProfiles.userId, userId));
    
    return {
      progress: 100,
      completed: true,
      rewards: {
        xp: xpReward,
        coins: coinReward
      }
    };
  }
  
  // Buildings
  async getBuildings(userId: number): Promise<any[]> {
    const userBuildings = await db.query.buildings.findMany({
      with: {
        ownership: {
          where: eq(buildingOwnership.userId, userId)
        },
        lessons: {
          with: {
            progress: {
              where: eq(lessonProgress.userId, userId)
            }
          }
        }
      }
    });
    
    return userBuildings.map(building => {
      // Calculate progress based on lessons
      const totalLessons = building.lessons.length;
      let completedLessons = 0;
      let remainingQuizzes = 0;
      
      building.lessons.forEach(lesson => {
        if (lesson.progress.length > 0 && lesson.progress[0].completed) {
          completedLessons++;
        } else {
          remainingQuizzes++;
        }
      });
      
      const progress = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0;
      
      return {
        id: building.id,
        name: building.name,
        description: building.description,
        icon: building.icon,
        type: building.type,
        position: building.position,
        color: building.color,
        width: building.width,
        height: building.height,
        owned: building.ownership.length > 0,
        dailyReward: building.dailyReward,
        progress,
        lessons: {
          total: totalLessons,
          completed: completedLessons
        },
        quizzes: {
          total: totalLessons,
          remaining: remainingQuizzes
        }
      };
    });
  }
  
  // Shop
  async getShopItems(userId: number): Promise<any[]> {
    const items = await db.query.shopItems.findMany({
      with: {
        buildings: {
          with: {
            ownership: {
              where: eq(buildingOwnership.userId, userId)
            }
          }
        }
      }
    });
    
    return items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      type: item.type,
      icon: item.icon,
      color: item.color,
      owned: item.buildings && item.buildings.ownership && item.buildings.ownership.length > 0
    }));
  }
  
  async purchaseItem(itemId: number, userId: number): Promise<any> {
    // Get the item
    const item = await db.query.shopItems.findFirst({
      where: eq(shopItems.id, itemId)
    });
    
    if (!item) {
      throw new Error("Item not found");
    }
    
    // Get user profile
    const userProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, userId)
    });
    
    if (!userProfile) {
      throw new Error("User profile not found");
    }
    
    // Check if user has enough coins
    if (userProfile.coins < item.price) {
      throw new Error("Not enough coins");
    }
    
    // Create building if it's a building item
    if (item.type === 'Buildings') {
      const building = await db.query.buildings.findFirst({
        where: eq(buildings.shopItemId, itemId)
      });
      
      if (building) {
        // Check if user already owns this building
        const existingOwnership = await db.query.buildingOwnership.findFirst({
          where: and(
            eq(buildingOwnership.buildingId, building.id),
            eq(buildingOwnership.userId, userId)
          )
        });
        
        if (existingOwnership) {
          throw new Error("You already own this building");
        }
        
        // Create ownership
        await db.insert(buildingOwnership).values({
          userId,
          buildingId: building.id
        });
      }
    }
    
    // Deduct coins from user
    await db.update(userProfiles)
      .set({
        coins: userProfile.coins - item.price
      })
      .where(eq(userProfiles.userId, userId));
    
    return {
      success: true,
      item: {
        id: item.id,
        name: item.name,
        type: item.type
      },
      newCoins: userProfile.coins - item.price
    };
  }
  
  // Achievements
  async getAchievements(userId: number): Promise<any[]> {
    const userAchievementsList = await db.query.achievements.findMany({
      with: {
        userAchievements: {
          where: eq(userAchievements.userId, userId)
        }
      }
    });
    
    return userAchievementsList.map(achievement => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      iconColor: achievement.iconColor,
      iconBg: achievement.iconBg,
      reward: achievement.reward,
      unlocked: achievement.userAchievements.length > 0,
      date: achievement.userAchievements.length > 0 
        ? achievement.userAchievements[0].achievedAt 
        : null
    }));
  }
  
  // Topics
  async getTopics(userId: number): Promise<any[]> {
    const userTopics = await db.query.topics.findMany({
      with: {
        progress: {
          where: eq(topicProgress.userId, userId)
        },
        lessons: {
          with: {
            progress: {
              where: eq(lessonProgress.userId, userId)
            }
          }
        }
      }
    });
    
    return userTopics.map(topic => {
      // Calculate progress based on lessons
      const totalLessons = topic.lessons.length;
      let completedLessons = 0;
      
      topic.lessons.forEach(lesson => {
        if (lesson.progress.length > 0 && lesson.progress[0].completed) {
          completedLessons++;
        }
      });
      
      const progress = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0;
      
      return {
        id: topic.id,
        name: topic.name,
        progress,
        lessons: {
          total: totalLessons,
          completed: completedLessons
        }
      };
    });
  }
}

export const storage = new DatabaseStorage();
