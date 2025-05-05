import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    // Check for existing users to avoid duplicates
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, "demo")
    });
    
    if (!existingUser) {
      // Create a demo user
      const [user] = await db.insert(schema.users).values({
        username: "demo",
        password: await hashPassword("password")
      }).returning();
      
      // Create user profile
      await db.insert(schema.userProfiles).values({
        userId: user.id,
        xp: 240,
        coins: 380,
        level: 4
      });
      
      console.log(`Created demo user with ID: ${user.id}`);
      
      // Create topics
      const topics = [
        { name: "Budgeting", description: "Learn to manage your money effectively", order: 1 },
        { name: "Banking & Cards", description: "Understand payment methods and banking", order: 2 },
        { name: "Savings", description: "Learn how to save money for the future", order: 3 },
        { name: "Online Safety", description: "Protect yourself from financial scams", order: 4 }
      ];
      
      const topicRecords = await Promise.all(topics.map(async (topic) => {
        const [topicRecord] = await db.insert(schema.topics).values(topic).returning();
        return topicRecord;
      }));
      
      console.log(`Created ${topicRecords.length} topics`);
      
      // Create lessons
      const lessons = [
        { 
          title: "Banking & Cards", 
          description: "Learn about different types of payment cards", 
          topic: "Banking & Cards", 
          topicId: topicRecords[1].id, 
          icon: "ri-bank-card-line",
          iconColor: "text-accent",
          iconBg: "bg-accent/20",
          order: 1
        },
        { 
          title: "Budgeting", 
          description: "Learn how to create and maintain a budget", 
          topic: "Budgeting", 
          topicId: topicRecords[0].id, 
          icon: "ri-money-dollar-circle-line",
          iconColor: "text-primary",
          iconBg: "bg-primary/20",
          order: 1
        }
      ];
      
      const lessonRecords = await Promise.all(lessons.map(async (lesson) => {
        const [lessonRecord] = await db.insert(schema.lessons).values(lesson).returning();
        return lessonRecord;
      }));
      
      console.log(`Created ${lessonRecords.length} lessons`);
      
      // Create lesson progress
      await db.insert(schema.lessonProgress).values([
        {
          userId: user.id,
          lessonId: lessonRecords[0].id,
          progress: 65,
          currentQuestion: 3,
          completed: false
        },
        {
          userId: user.id,
          lessonId: lessonRecords[1].id,
          progress: 30,
          currentQuestion: 2,
          completed: false
        }
      ]);
      
      // Create topics progress
      await db.insert(schema.topicProgress).values(
        topicRecords.map((topic, index) => ({
          userId: user.id,
          topicId: topic.id,
          progress: index === 0 ? 60 : index === 1 ? 65 : index === 2 ? 25 : 0,
          completed: false
        }))
      );
      
      // Create questions
      const bankingQuestions = [
        {
          lessonId: lessonRecords[0].id,
          question: "What is the main difference between a debit card and a credit card?",
          answers: [
            { id: 1, text: "A debit card has a different color than a credit card.", correct: false },
            { id: 2, text: "A debit card uses your own money from your account, while a credit card borrows money that you have to pay back later.", correct: true },
            { id: 3, text: "A credit card can only be used online, while a debit card can be used in stores.", correct: false },
            { id: 4, text: "There is no difference, they're just different names for the same thing.", correct: false }
          ],
          order: 1
        }
      ];
      
      await db.insert(schema.questions).values(bankingQuestions);
      
      // Create buildings
      const shopItems = [
        {
          name: "Investment Center",
          description: "Learn about investing and growing your money",
          type: "Buildings",
          price: 250,
          icon: "ri-building-fill",
          color: "primary"
        },
        {
          name: "Housing Center",
          description: "Understand rent, mortgages and housing costs",
          type: "Buildings",
          price: 300,
          icon: "ri-home-4-fill",
          color: "green-500"
        },
        {
          name: "Credit Bureau",
          description: "Learn about credit scores and loans",
          type: "Buildings",
          price: 200,
          icon: "ri-bank-fill",
          color: "purple-500"
        },
        {
          name: "Security Center",
          description: "Protect your financial information",
          type: "Buildings",
          price: 180,
          icon: "ri-shield-check-fill",
          color: "red-500"
        }
      ];
      
      const shopItemRecords = await Promise.all(shopItems.map(async (item) => {
        const [itemRecord] = await db.insert(schema.shopItems).values(item).returning();
        return itemRecord;
      }));
      
      // Create buildings
      const buildings = [
        {
          name: "Bank",
          description: "Learn about payment methods, bank accounts, and how to manage cards.",
          type: "bank",
          position: { top: "15%", left: "30%" },
          color: "primary",
          icon: "ri-bank-fill",
          width: "20",
          height: "28",
          dailyReward: 10
        },
        {
          name: "Shop",
          description: "Learn about consumer choices and responsible spending.",
          type: "shop",
          position: { top: "20%", right: "30%" },
          color: "secondary",
          icon: "ri-shopping-bag-fill",
          width: "20",
          height: "24",
          dailyReward: 8
        },
        {
          name: "Savings",
          description: "Learn how to save money and plan for the future.",
          type: "savings",
          position: { bottom: "20%", left: "35%" },
          color: "accent",
          icon: "ri-safe-2-fill",
          width: "20",
          height: "20",
          dailyReward: 5
        },
        {
          name: "School",
          description: "Learn financial education fundamentals.",
          type: "school",
          position: { bottom: "25%", right: "32%" },
          color: "blue-500",
          icon: "ri-book-open-fill",
          width: "24",
          height: "24",
          dailyReward: 12
        }
      ];
      
      const buildingRecords = await Promise.all(buildings.map(async (building) => {
        const [buildingRecord] = await db.insert(schema.buildings).values(building).returning();
        return buildingRecord;
      }));
      
      // Set up building ownership for the user
      await db.insert(schema.buildingOwnership).values(
        buildingRecords.map(building => ({
          userId: user.id,
          buildingId: building.id
        }))
      );
      
      // Create achievements
      const achievements = [
        {
          name: "First Lesson",
          description: "Complete your first lesson",
          icon: "ri-award-fill",
          iconColor: "text-secondary",
          iconBg: "bg-secondary/20",
          reward: 50
        },
        {
          name: "Coin Collector",
          description: "Collect 100 coins",
          icon: "ri-money-dollar-circle-fill",
          iconColor: "text-primary",
          iconBg: "bg-primary/20",
          reward: 25
        },
        {
          name: "Budget Master",
          description: "Complete all budgeting lessons",
          icon: "ri-money-dollar-circle-fill",
          iconColor: "text-accent",
          iconBg: "bg-accent/20",
          reward: 75
        }
      ];
      
      const achievementRecords = await Promise.all(achievements.map(async (achievement) => {
        const [achievementRecord] = await db.insert(schema.achievements).values(achievement).returning();
        return achievementRecord;
      }));
      
      // Set first two achievements as unlocked for the user
      await db.insert(schema.userAchievements).values([
        {
          userId: user.id,
          achievementId: achievementRecords[0].id
        },
        {
          userId: user.id,
          achievementId: achievementRecords[1].id
        }
      ]);
      
      // Create initial notifications
      const notifications = [
        {
          userId: user.id,
          title: "Welcome to Financial Learning!",
          message: "Start your journey to financial literacy. Complete lessons to earn rewards!",
          type: "system",
          read: false
        },
        {
          userId: user.id,
          title: "First Lesson Achievement Unlocked!",
          message: "You've earned the First Lesson achievement and received 50 coins!",
          type: "achievement",
          read: false
        },
        {
          userId: user.id,
          title: "New Buildings Available",
          message: "Visit the shop to purchase new buildings for your city!",
          type: "system",
          read: true
        }
      ];
      
      await db.insert(schema.notifications).values(notifications);
      
      // Create default user settings
      await db.insert(schema.userSettings).values({
        userId: user.id,
        notificationsEnabled: true,
        soundEnabled: true,
        darkMode: false,
        language: "english",
        helpTipsEnabled: true
      });
      
      console.log("Database seeded successfully!");
    } else {
      console.log("Database already contains data. Skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
