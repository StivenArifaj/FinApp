# Key Files for FinCity Financial Education App

## Main App and Entry Points

### client/src/main.tsx
```tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

### client/src/App.tsx
```tsx
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CityMapPage from "@/pages/city-map-page";
import LessonPage from "@/pages/lesson-page";
import GamePage from "@/pages/game-page";
import ShopPage from "@/pages/shop-page";
import ProfilePage from "@/pages/profile-page";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/city-map" component={CityMapPage} />
      <ProtectedRoute path="/lesson/:id" component={LessonPage} />
      <ProtectedRoute path="/game/:id" component={GamePage} />
      <ProtectedRoute path="/shop" component={ShopPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-light relative overflow-hidden">
      <Router />
      <Toaster />
    </div>
  );
}

export default App;
```

## Server-side Code

### server/index.ts
```typescript
import express from 'express';
import { json } from 'express';
import { serveStatic, setupVite, log } from './vite';
import { registerRoutes } from './routes';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  try {
    const app = express();
    const PORT = parseInt(process.env.PORT || '5000', 10);

    // Basic middlewares
    app.use(json());

    // Register API routes
    const server = await registerRoutes(app);

    // Development setup - only needed for local dev
    if (process.env.NODE_ENV !== 'production') {
      await setupVite(app, server);
    } 
    // Production - serve static files
    else {
      serveStatic(app);

      // In production, serve the index.html for any unmatched routes
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/index.html'));
      });
    }

    // Error handling must be after all other middlewares and routes
    app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      const status = err.status || 500;
      const message = err.message || 'Something went wrong';
      log(`Error: ${message}`, 'error');
      res.status(status).json({ error: message });
    });

    // Start the server
    server.listen(PORT, () => {
      log(`serving on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
```

## Schema and Database

### shared/schema.ts (partial)
```typescript
import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users & Authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

// ... other tables ...

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Create an extended user type that includes profile data
export type UserWithProfile = User & {
  xp?: number;
  coins?: number;
  level?: number;
};
```

## Authentication

### server/auth.ts (partial)
```typescript
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      } else {
        return done(null, user);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user);
  });

  // Authentication routes
  app.post("/api/register", async (req, res, next) => {
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const user = await storage.createUser({
      ...req.body,
      password: await hashPassword(req.body.password),
    });

    req.login(user, (err) => {
      if (err) return next(err);
      res.status(201).json(user);
    });
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
```

## React Query Setup

### client/src/lib/queryClient.ts
```typescript
import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorText = res.statusText;
    try {
      const data = await res.json();
      if (data.error) {
        errorText = data.error;
      }
    } catch (e) {
      // No JSON response, use statusText
    }
    throw new Error(errorText);
  }
  return res;
}

export async function apiRequest(
  method: string,
  path: string,
  body?: object
): Promise<Response> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(path, options);
  return throwIfResNotOk(res);
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => () => Promise<T | undefined> = ({ on401 }) => {
  return async ({ queryKey }: { queryKey: (string | number)[] }) => {
    const path = queryKey.join("/");
    try {
      const res = await fetch(path, {
        credentials: "include",
      });
      if (res.status === 401) {
        if (on401 === "throw") {
          throw new Error("Unauthorized");
        }
        return undefined;
      }
      await throwIfResNotOk(res);
      if (res.headers.get("Content-Length") === "0") {
        return undefined;
      }
      return await res.json();
    } catch (error) {
      throw error;
    }
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});
```

## Protected Routes

### client/src/lib/protected-route.tsx
```tsx
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "./queryClient";
import { UserWithProfile } from "@shared/schema";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  // Query for user data directly
  const {
    data: user,
    isLoading,
  } = useQuery<UserWithProfile | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />
}
```

## Auth Page

### client/src/pages/auth-page.tsx (partial)
```tsx
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { insertUserSchema, User as SelectUser } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Direct login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginValues) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      // Redirect to home page
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Direct register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterValues) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });
      // Redirect to home page
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form setup for login
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Form setup for registration
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(values);
  };
  
  const onRegisterSubmit = (values: RegisterValues) => {
    registerMutation.mutate(values);
  };

  // Rest of the component...
}
```