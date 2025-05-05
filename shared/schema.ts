import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users & Authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  isEmailVerified: boolean("is_email_verified").default(false),
  verificationToken: text("verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  xp: integer("xp").default(0).notNull(),
  coins: integer("coins").default(50).notNull(),
  level: integer("level").default(1).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Lessons & Learning
export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  topic: text("topic").notNull(),
  topicId: integer("topic_id").references(() => topics.id),
  buildingId: integer("building_id").references(() => buildings.id),
  icon: text("icon").default("ri-book-fill").notNull(),
  iconColor: text("icon_color").default("text-primary").notNull(),
  iconBg: text("icon_bg").default("bg-primary/20").notNull(),
  xpReward: integer("xp_reward").default(25).notNull(),
  coinReward: integer("coin_reward").default(10).notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id).notNull(),
  question: text("question").notNull(),
  image: text("image"),
  answers: json("answers").notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessonProgress = pgTable("lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  lessonId: integer("lesson_id").references(() => lessons.id).notNull(),
  progress: integer("progress").default(0).notNull(),
  currentQuestion: integer("current_question").default(1).notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const topicProgress = pgTable("topic_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  topicId: integer("topic_id").references(() => topics.id).notNull(),
  progress: integer("progress").default(0).notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Buildings & Map
export const buildings = pgTable("buildings", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  position: json("position").notNull(),
  color: text("color").notNull(),
  icon: text("icon").notNull(),
  width: text("width").default("20").notNull(),
  height: text("height").default("20").notNull(),
  shopItemId: integer("shop_item_id").references(() => shopItems.id),
  dailyReward: integer("daily_reward").default(5).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const buildingOwnership = pgTable("building_ownership", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  buildingId: integer("building_id").references(() => buildings.id).notNull(),
  purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
});

// Shop & Items
export const shopItems = pgTable("shop_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  price: integer("price").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Achievements
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  iconColor: text("icon_color").notNull(),
  iconBg: text("icon_bg").notNull(),
  reward: integer("reward").default(10).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  achievementId: integer("achievement_id").references(() => achievements.id).notNull(),
  achievedAt: timestamp("achieved_at").defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").default("system").notNull(), // achievement, lesson, reward, system
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Settings
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
  soundEnabled: boolean("sound_enabled").default(true).notNull(),
  darkMode: boolean("dark_mode").default(false).notNull(),
  language: text("language").default("english").notNull(),
  helpTipsEnabled: boolean("help_tips_enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId]
  }),
  settings: one(userSettings, {
    fields: [users.id],
    references: [userSettings.userId]
  }),
  lessonProgress: many(lessonProgress),
  buildingOwnership: many(buildingOwnership),
  topicProgress: many(topicProgress),
  achievements: many(userAchievements),
  notifications: many(notifications)
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id]
  })
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  lessons: many(lessons),
  progress: many(topicProgress)
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  topic: one(topics, {
    fields: [lessons.topicId],
    references: [topics.id]
  }),
  building: one(buildings, {
    fields: [lessons.buildingId],
    references: [buildings.id]
  }),
  questions: many(questions),
  progress: many(lessonProgress)
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  lesson: one(lessons, {
    fields: [questions.lessonId],
    references: [lessons.id]
  })
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [lessonProgress.userId],
    references: [users.id]
  }),
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id]
  })
}));

export const topicProgressRelations = relations(topicProgress, ({ one }) => ({
  user: one(users, {
    fields: [topicProgress.userId],
    references: [users.id]
  }),
  topic: one(topics, {
    fields: [topicProgress.topicId],
    references: [topics.id]
  })
}));

export const buildingsRelations = relations(buildings, ({ one, many }) => ({
  shopItem: one(shopItems, {
    fields: [buildings.shopItemId],
    references: [shopItems.id]
  }),
  ownership: many(buildingOwnership),
  lessons: many(lessons)
}));

export const buildingOwnershipRelations = relations(buildingOwnership, ({ one }) => ({
  user: one(users, {
    fields: [buildingOwnership.userId],
    references: [users.id]
  }),
  building: one(buildings, {
    fields: [buildingOwnership.buildingId],
    references: [buildings.id]
  })
}));

export const shopItemsRelations = relations(shopItems, ({ many }) => ({
  buildings: many(buildings)
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements)
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id]
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id]
  })
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  })
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id]
  })
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.min(3, "Username must be at least 3 characters"),
  email: (schema) => schema.email("Please enter a valid email address").optional(),
  password: (schema) => schema.min(8, "Password must be at least 8 characters"),
  firstName: (schema) => schema.optional(),
  lastName: (schema) => schema.optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Create an extended user type that includes profile data
export type UserWithProfile = User & {
  xp?: number;
  coins?: number;
  level?: number;
};

// Additional types
export type Notification = typeof notifications.$inferSelect;
export type UserSettings = typeof userSettings.$inferSelect;
