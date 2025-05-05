# FinCity Financial Education App - Complete Codebase

## File: client/index.html

```
html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>FinCity - Financial Education App</title>
    <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    <!-- This script injects a replit badge into the page, please feel free to remove this line -->
    <script type="text/javascript" src="https://replit.com/public/js/replit-badge-v3.js"></script>
  </body>
</html>
```

## File: client/src/App.tsx

```
typescript
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

## File: client/src/components/achievement-card.tsx

```
typescript
interface AchievementProps {
  achievement: {
    id: number;
    name: string;
    icon: string;
    iconColor: string;
    iconBg: string;
    unlocked: boolean;
  };
}

export default function AchievementCard({ achievement }: AchievementProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-3 text-center flex-1">
      <div className={`w-12 h-12 mx-auto ${achievement.iconBg} rounded-full flex items-center justify-center mb-2`}>
        <i className={`${achievement.icon} ${achievement.iconColor} text-xl`}></i>
      </div>
      <h5 className={`text-xs font-medium ${!achievement.unlocked ? 'text-gray-400' : ''}`}>
        {achievement.name}
      </h5>
    </div>
  );
}
```

## File: client/src/components/bottom-nav.tsx

```
typescript
import { Link } from "wouter";

interface BottomNavProps {
  active: "home" | "city-map" | "shop" | "profile";
}

export default function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="bg-white flex justify-around shadow-md">
      <Link href="/">
        <a className={`py-3 px-4 flex flex-col items-center ${active === "home" ? "text-primary" : "text-dark/50"}`}>
          <i className="ri-home-5-fill text-xl"></i>
          <span className="text-xs mt-1">Home</span>
        </a>
      </Link>
      <Link href="/city-map">
        <a className={`py-3 px-4 flex flex-col items-center ${active === "city-map" ? "text-primary" : "text-dark/50"}`}>
          <i className="ri-map-pin-line text-xl"></i>
          <span className="text-xs mt-1">City</span>
        </a>
      </Link>
      <Link href="/shop">
        <a className={`py-3 px-4 flex flex-col items-center ${active === "shop" ? "text-primary" : "text-dark/50"}`}>
          <i className="ri-store-2-line text-xl"></i>
          <span className="text-xs mt-1">Shop</span>
        </a>
      </Link>
      <Link href="/profile">
        <a className={`py-3 px-4 flex flex-col items-center ${active === "profile" ? "text-primary" : "text-dark/50"}`}>
          <i className="ri-user-line text-xl"></i>
          <span className="text-xs mt-1">Profile</span>
        </a>
      </Link>
    </nav>
  );
}
```

## File: client/src/components/building-card.tsx

```
typescript
interface BuildingProps {
  building: {
    id: number;
    name: string;
    type: string;
    position: { top: string; left: string; right?: string; bottom?: string; };
    color: string;
    icon: string;
    width: string;
    height: string;
    locked?: boolean;
  };
  onClick: () => void;
}

export default function BuildingCard({ building, onClick }: BuildingProps) {
  const isLocked = building.locked || false;
  
  return (
    <div 
      className={`map-building absolute ${isLocked ? 'opacity-60' : ''} cursor-pointer`}
      style={{
        top: building.position.top,
        left: building.position.left,
        right: building.position.right,
        bottom: building.position.bottom,
        width: building.width,
        height: building.height
      }}
      onClick={onClick}
    >
      <div className={`bg-${building.color} rounded-lg h-full w-full flex flex-col items-center justify-end p-2 shadow-lg`}>
        {isLocked ? (
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
            <i className="ri-lock-fill text-white text-3xl"></i>
          </div>
        ) : (
          <>
            {building.type === "bank" && (
              <>
                <div className="bg-primary-dark absolute top-0 left-0 right-0 h-4 rounded-t-lg"></div>
                <div className="absolute top-6 left-2 right-2 h-12 flex flex-col">
                  <div className="h-2 bg-white/30 mb-1 rounded"></div>
                  <div className="h-2 bg-white/30 mb-1 rounded"></div>
                  <div className="h-2 bg-white/30 rounded"></div>
                </div>
              </>
            )}
            
            {building.type === "shop" && (
              <div className="absolute top-4 left-2 right-2 h-8 flex items-center justify-center">
                <i className="ri-store-2-fill text-white/70 text-2xl"></i>
              </div>
            )}
            
            {building.type === "school" && (
              <>
                <div className="absolute top-0 left-0 right-0 h-5 rounded-t-lg bg-blue-600"></div>
                <div className="absolute top-7 left-3 right-3 h-8 bg-white/30 rounded"></div>
              </>
            )}
            
            {building.type === "savings" && (
              <div className="absolute top-2 left-2 right-2 h-6 bg-white/20 rounded"></div>
            )}
          </>
        )}
        
        <i className={`${building.icon} text-white text-xl mb-1`}></i>
        <span className="text-white text-xs font-medium">{building.name}</span>
      </div>
    </div>
  );
}
```

## File: client/src/components/lesson-card.tsx

```
typescript
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";

interface LessonProps {
  lesson: {
    id: number;
    title: string;
    icon: string;
    iconColor: string;
    iconBg: string;
    progress: number;
  };
}

export default function LessonCard({ lesson }: LessonProps) {
  return (
    <Link href={`/lesson/${lesson.id}`}>
      <a className="block bg-white rounded-xl shadow-sm p-4 mb-3">
        <div className="flex items-center">
          <div className={`w-12 h-12 ${lesson.iconBg} rounded-full flex items-center justify-center mr-4`}>
            <i className={`${lesson.icon} ${lesson.iconColor} text-xl`}></i>
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-1">{lesson.title}</h4>
            <div className="flex justify-between items-center">
              <Progress value={lesson.progress} className="w-3/4 h-2" />
              <span className="text-xs text-dark/60">{lesson.progress}%</span>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}
```

## File: client/src/components/progress-bar.tsx

```
typescript
import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  progress: number;
  showText?: boolean;
  className?: string;
}

export default function ProgressBar({ progress, showText = true, className }: ProgressBarProps) {
  return (
    <div className={className}>
      <Progress value={progress} className="h-2" />
      {showText && (
        <div className="flex justify-between text-xs mt-1 text-dark/60">
          <span>{progress}% complete</span>
        </div>
      )}
    </div>
  );
}
```

## File: client/src/components/user-header.tsx

```
typescript
import { useAuth } from "@/hooks/use-auth";

export default function UserHeader() {
  const { user } = useAuth();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
          <span className="text-primary font-bold">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
        </div>
        <div>
          <h2 className="font-bold text-dark">{user?.username || 'User'}</h2>
          <div className="flex items-center text-xs">
            <span className="flex items-center text-yellow-600 mr-2">
              <i className="ri-star-fill mr-1"></i> <span>{user?.xp || 0} XP</span>
            </span>
            <span className="flex items-center text-amber-500">
              <i className="ri-coin-fill mr-1"></i> <span>{user?.coins || 0}</span>
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <button className="w-9 h-9 rounded-full bg-light flex items-center justify-center mr-2">
          <i className="ri-notification-3-line text-dark/60"></i>
        </button>
        <button className="w-9 h-9 rounded-full bg-light flex items-center justify-center">
          <i className="ri-settings-4-line text-dark/60"></i>
        </button>
      </div>
    </div>
  );
}
```

## File: client/src/hooks/use-auth.tsx

```
typescript
import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";

// Using direct toast function, not hook
import { toast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Query for user data
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

## File: client/src/hooks/use-mobile.tsx

```
typescript
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
```

## File: client/src/hooks/use-toast.ts

```
typescript
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
```

## File: client/src/index.css

```
css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 97%;
    --foreground: 222 14% 21%;
    
    --card: 0 0% 100%;
    --card-foreground: 222 14% 21%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 222 14% 21%;
    
    --primary: 230 83% 60%;
    --primary-foreground: 0 0% 100%;
    
    --secondary: 44 100% 58%;
    --secondary-foreground: 0 0% 100%;
    
    --accent: 341 100% 68%;
    --accent-foreground: 0 0% 100%;
    
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    
    --destructive: 0 91% 65%;
    --destructive-foreground: 0 0% 100%;
    
    --success: 122 39% 49%;
    --success-foreground: 0 0% 100%;
    
    --warning: 45 100% 51%;
    --warning-foreground: 0 0% 100%;
    
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 230 83% 60%;
    
    --radius: 0.75rem;
  }
 
  .dark {
    --background: 222 14% 21%;
    --foreground: 0 0% 97%;
    
    --card: 222 14% 18%;
    --card-foreground: 0 0% 97%;
    
    --popover: 222 14% 18%;
    --popover-foreground: 0 0% 97%;
    
    --primary: 230 83% 60%;
    --primary-foreground: 0 0% 97%;
    
    --secondary: 44 100% 58%;
    --secondary-foreground: 0 0% 97%;
    
    --accent: 341 100% 68%;
    --accent-foreground: 0 0% 97%;
    
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    
    --destructive: 0 91% 65%;
    --destructive-foreground: 0 0% 97%;
    
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 230 83% 60%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply font-sans antialiased bg-background text-foreground;
    font-family: 'Quicksand', sans-serif;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Quicksand', sans-serif;
  }
  
  p, span, div {
    font-family: 'Poppins', sans-serif;
  }
}

.map-building {
  transition: all 0.2s ease;
}

.map-building:hover, .map-building:active {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.shimmer {
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {background-position: -200% 0;}
  100% {background-position: 200% 0;}
}

.bounce {
  animation: bounce 0.6s;
}

@keyframes bounce {
  0%, 100% {transform: translateY(0);}
  50% {transform: translateY(-10px);}
}

.progress-indicator {
  position: relative;
  overflow: hidden;
}

.progress-indicator::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transform: translateX(-100%);
  animation: progress-animation 1.5s infinite;
}

@keyframes progress-animation {
  100% {transform: translateX(100%);}
}
```

## File: client/src/lib/protected-route.tsx

```
typescript
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

## File: client/src/lib/queryClient.ts

```
typescript
import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
```

## File: client/src/lib/utils.ts

```
typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## File: client/src/main.tsx

```
typescript
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

## File: client/src/pages/auth-page.tsx

```
typescript
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

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

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

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 bg-light">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2 font-quicksand">FinCity</h1>
          <p className="text-dark/70 font-poppins">Learn finances. Build your city.</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="mb-4">
            <button 
              onClick={() => setIsLogin(true)}
              className={`font-medium px-4 py-2 ${isLogin ? 'text-primary border-b-2 border-primary' : 'text-dark/60'}`}
            >
              Log In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`font-medium px-4 py-2 ${!isLogin ? 'text-primary border-b-2 border-primary' : 'text-dark/60'}`}
            >
              Sign Up
            </button>
          </div>
          
          {isLogin ? (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Email or Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your_username" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          {...field} 
                        />
                      </FormControl>
                      <p className="text-xs text-right mt-1 text-primary">Forgot password?</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium transition-all hover:bg-primary/90"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Logging in..." : "Log In"}
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Choose a username" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit"
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium transition-all hover:bg-primary/90"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          )}
        </div>
        
        <div className="text-center">
          <p className="text-dark/70 text-sm">
            {isLogin ? (
              <>Don't have an account? <button onClick={() => setIsLogin(false)} className="text-primary font-medium">Sign up</button></>
            ) : (
              <>Already have an account? <button onClick={() => setIsLogin(true)} className="text-primary font-medium">Log in</button></>
            )}
          </p>
        </div>
        
        {/* Demo account information */}
        <div className="mt-4 p-3 bg-slate-100 rounded-lg text-xs text-gray-600">
          <p className="font-medium">Demo Account:</p>
          <p>Username: demo</p>
          <p>Password: password</p>
        </div>
      </div>
    </div>
  );
}
```

## File: client/src/pages/city-map-page.tsx

```
typescript
import { useState } from "react";
import BottomNav from "@/components/bottom-nav";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import BuildingCard from "@/components/building-card";
import { Link } from "wouter";

interface Building {
  id: number;
  name: string;
  description: string;
  owned: boolean;
  dailyReward: number;
  progress: number;
  lessons: {
    total: number;
    completed: number;
  };
  quizzes: {
    total: number;
    remaining: number;
  };
}

export default function CityMapPage() {
  const { user } = useAuth();
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  
  const { data: buildings } = useQuery({
    queryKey: ['/api/buildings'],
  });

  const handleBuildingClick = (building: Building) => {
    setSelectedBuilding(building);
  };

  const closePropertyInfo = () => {
    setSelectedBuilding(null);
  };

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div className="p-4 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Your FinCity</h2>
            <div className="flex items-center">
              <span className="flex items-center text-amber-500 bg-amber-50 px-3 py-1 rounded-full text-sm mr-2">
                <i className="ri-coin-fill mr-1"></i> <span>{user?.coins || 0}</span>
              </span>
              <button className="w-9 h-9 rounded-full bg-light flex items-center justify-center">
                <i className="ri-information-line text-dark/60"></i>
              </button>
            </div>
          </div>
          
          {/* City Map */}
          <div className="relative bg-blue-50 rounded-xl h-[500px] overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
              <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-green-100 to-transparent"></div>
              <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-blue-100 to-transparent"></div>
            </div>
            
            {/* Roads */}
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-0 right-0 h-8 bg-gray-300"></div>
              <div className="absolute top-1/2 left-0 right-0 h-8 bg-gray-300"></div>
              <div className="absolute bottom-1/4 left-0 right-0 h-8 bg-gray-300"></div>
              <div className="absolute left-1/4 top-0 bottom-0 w-8 bg-gray-300"></div>
              <div className="absolute left-1/2 top-0 bottom-0 w-8 bg-gray-300"></div>
              <div className="absolute right-1/4 top-0 bottom-0 w-8 bg-gray-300"></div>
            </div>
            
            {/* Map Buildings */}
            <div className="absolute inset-0 p-4">
              {buildings ? (
                buildings.map((building) => (
                  <BuildingCard 
                    key={building.id} 
                    building={building} 
                    onClick={() => handleBuildingClick(building)} 
                  />
                ))
              ) : (
                <>
                  {/* Default Buildings */}
                  <div 
                    className="map-building absolute top-[15%] left-[30%] w-20 h-28 cursor-pointer"
                    onClick={() => handleBuildingClick({
                      id: 1,
                      name: "Bank",
                      description: "Learn about payment methods, bank accounts, and how to manage cards.",
                      owned: true,
                      dailyReward: 10,
                      progress: 65,
                      lessons: {
                        total: 3,
                        completed: 2
                      },
                      quizzes: {
                        total: 3,
                        remaining: 1
                      }
                    })}
                  >
                    <div className="bg-primary rounded-lg h-full w-full flex flex-col items-center justify-end p-2 shadow-lg">
                      <div className="bg-primary-dark absolute top-0 left-0 right-0 h-4 rounded-t-lg"></div>
                      <div className="absolute top-6 left-2 right-2 h-12 flex flex-col">
                        <div className="h-2 bg-white/30 mb-1 rounded"></div>
                        <div className="h-2 bg-white/30 mb-1 rounded"></div>
                        <div className="h-2 bg-white/30 rounded"></div>
                      </div>
                      <i className="ri-bank-fill text-white text-xl mb-1"></i>
                      <span className="text-white text-xs font-medium">Bank</span>
                    </div>
                  </div>
                  
                  <div 
                    className="map-building absolute top-[20%] right-[30%] w-20 h-24 cursor-pointer"
                    onClick={() => handleBuildingClick({
                      id: 2,
                      name: "Shop",
                      description: "Learn about consumer choices and responsible spending.",
                      owned: true,
                      dailyReward: 8,
                      progress: 30,
                      lessons: {
                        total: 4,
                        completed: 1
                      },
                      quizzes: {
                        total: 2,
                        remaining: 1
                      }
                    })}
                  >
                    <div className="bg-secondary rounded-lg h-full w-full flex flex-col items-center justify-end p-2 shadow-lg">
                      <div className="absolute top-4 left-2 right-2 h-8 flex items-center justify-center">
                        <i className="ri-store-2-fill text-white/70 text-2xl"></i>
                      </div>
                      <i className="ri-shopping-bag-fill text-white text-xl mb-1"></i>
                      <span className="text-white text-xs font-medium">Shop</span>
                    </div>
                  </div>
                  
                  <div 
                    className="map-building absolute bottom-[20%] left-[35%] w-20 h-20 cursor-pointer"
                    onClick={() => handleBuildingClick({
                      id: 3,
                      name: "Savings",
                      description: "Learn how to save money and plan for the future.",
                      owned: true,
                      dailyReward: 5,
                      progress: 10,
                      lessons: {
                        total: 5,
                        completed: 0
                      },
                      quizzes: {
                        total: 2,
                        remaining: 2
                      }
                    })}
                  >
                    <div className="bg-accent rounded-lg h-full w-full flex flex-col items-center justify-end p-2 shadow-lg">
                      <div className="absolute top-2 left-2 right-2 h-6 bg-white/20 rounded"></div>
                      <i className="ri-safe-2-fill text-white text-xl mb-1"></i>
                      <span className="text-white text-xs font-medium">Savings</span>
                    </div>
                  </div>
                  
                  <div 
                    className="map-building absolute bottom-[25%] right-[32%] w-24 h-24 cursor-pointer"
                    onClick={() => handleBuildingClick({
                      id: 4,
                      name: "School",
                      description: "Learn financial education fundamentals.",
                      owned: true,
                      dailyReward: 12,
                      progress: 80,
                      lessons: {
                        total: 3,
                        completed: 2
                      },
                      quizzes: {
                        total: 3,
                        remaining: 1
                      }
                    })}
                  >
                    <div className="bg-blue-500 rounded-lg h-full w-full flex flex-col items-center justify-end p-2 shadow-lg">
                      <div className="absolute top-0 left-0 right-0 h-5 rounded-t-lg bg-blue-600"></div>
                      <div className="absolute top-7 left-3 right-3 h-8 bg-white/30 rounded"></div>
                      <i className="ri-book-open-fill text-white text-xl mb-1"></i>
                      <span className="text-white text-xs font-medium">School</span>
                    </div>
                  </div>
                  
                  <div 
                    className="map-building absolute top-[45%] left-[60%] w-20 h-20 opacity-60 cursor-pointer"
                    onClick={() => handleBuildingClick({
                      id: 5,
                      name: "??? Building",
                      description: "This building is locked. Earn more coins to unlock it.",
                      owned: false,
                      dailyReward: 15,
                      progress: 0,
                      lessons: {
                        total: 0,
                        completed: 0
                      },
                      quizzes: {
                        total: 0,
                        remaining: 0
                      }
                    })}
                  >
                    <div className="bg-gray-400 rounded-lg h-full w-full flex flex-col items-center justify-end p-2 shadow-lg">
                      <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                        <i className="ri-lock-fill text-white text-3xl"></i>
                      </div>
                      <span className="text-white text-xs font-medium">250 Coins</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Add Building Button */}
            <Link href="/shop" className="absolute bottom-4 right-4 bg-primary text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center">
              <i className="ri-add-line text-xl"></i>
            </Link>
          </div>
          
          {/* Property Info (Would slide up when property is clicked) */}
          {selectedBuilding && (
            <div 
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg max-w-md mx-auto transition-transform duration-300"
              style={{ transform: selectedBuilding ? 'translateY(0)' : 'translateY(100%)' }}
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto my-3" onClick={closePropertyInfo}></div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">{selectedBuilding.name}</h3>
                  <span className={`${selectedBuilding.owned ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} text-xs px-2 py-1 rounded-full`}>
                    {selectedBuilding.owned ? 'Owned' : 'Available'}
                  </span>
                </div>
                
                <p className="text-dark/70 mb-4">{selectedBuilding.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Daily Reward</h4>
                    <span className="flex items-center text-amber-500 text-sm">
                      <i className="ri-coin-fill mr-1"></i> +{selectedBuilding.dailyReward} coins
                    </span>
                  </div>
                  {selectedBuilding.owned ? (
                    <Link href={`/lesson/${selectedBuilding.id}`} className="bg-primary text-white px-4 py-2 rounded-lg text-sm">Start Lesson</Link>
                  ) : (
                    <Button className="bg-secondary text-white px-4 py-2 rounded-lg text-sm">Buy for 250 coins</Button>
                  )}
                </div>
                
                {selectedBuilding.owned && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium mb-2">Your Progress</h4>
                    <div className="flex items-center">
                      <Progress value={selectedBuilding.progress} className="w-full h-2 mr-3" />
                      <span className="text-xs whitespace-nowrap">{selectedBuilding.progress}%</span>
                    </div>
                    <div className="flex justify-between text-xs mt-2 text-dark/70">
                      <span>{selectedBuilding.lessons.completed}/{selectedBuilding.lessons.total} lessons completed</span>
                      <span>{selectedBuilding.quizzes.remaining} quiz remaining</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <BottomNav active="city-map" />
    </>
  );
}
```

## File: client/src/pages/game-page.tsx

```
typescript
import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { UserWithProfile } from "@shared/schema";

interface SpendingItem {
  id: number;
  name: string;
  icon: string;
  cost: number;
  priority?: number;
}

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const { data: user } = useQuery<UserWithProfile>({ 
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }) 
  });
  const [, setLocation] = useLocation();
  const [items, setItems] = useState<SpendingItem[]>([
    { id: 1, name: "Food for the week", icon: "ri-restaurant-fill", cost: 25 },
    { id: 2, name: "Movie tickets", icon: "ri-movie-fill", cost: 15 },
    { id: 3, name: "New t-shirt", icon: "ri-t-shirt-fill", cost: 20 },
    { id: 4, name: "School supplies", icon: "ri-book-fill", cost: 10 },
    { id: 5, name: "Mobile game in-app purchase", icon: "ri-game-fill", cost: 5 }
  ]);
  
  const [prioritizedItems, setPrioritizedItems] = useState<SpendingItem[]>([]);
  const [budget, setBudget] = useState(50);
  const [spent, setSpent] = useState(0);
  
  const handleDragStart = (e: React.DragEvent, item: SpendingItem) => {
    e.dataTransfer.setData("itemId", item.id.toString());
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = parseInt(e.dataTransfer.getData("itemId"));
    const draggedItem = items.find(item => item.id === itemId);
    
    if (draggedItem && prioritizedItems.length < 3) {
      // Calculate new spent amount
      const newSpent = spent + draggedItem.cost;
      
      // Check if we have enough budget
      if (newSpent <= budget) {
        // Add item to prioritized list with a priority value
        const priority = prioritizedItems.length + 1;
        const prioritizedItem = { ...draggedItem, priority };
        
        // Remove item from available items
        setItems(items.filter(item => item.id !== itemId));
        
        // Add to prioritized items
        setPrioritizedItems([...prioritizedItems, prioritizedItem]);
        
        // Update spent amount
        setSpent(newSpent);
      }
    }
  };
  
  const handleReset = () => {
    // Reset the game
    setItems([
      { id: 1, name: "Food for the week", icon: "ri-restaurant-fill", cost: 25 },
      { id: 2, name: "Movie tickets", icon: "ri-movie-fill", cost: 15 },
      { id: 3, name: "New t-shirt", icon: "ri-t-shirt-fill", cost: 20 },
      { id: 4, name: "School supplies", icon: "ri-book-fill", cost: 10 },
      { id: 5, name: "Mobile game in-app purchase", icon: "ri-game-fill", cost: 5 }
    ]);
    setPrioritizedItems([]);
    setSpent(0);
  };
  
  const handleSubmit = () => {
    // In a real app, this would submit the priorities to the backend
    // and navigate to a results page
    setLocation("/");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Game Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <button 
            className="w-8 h-8 flex items-center justify-center"
            onClick={() => setLocation("/")}
          >
            <i className="ri-arrow-left-line text-dark/70"></i>
          </button>
          <h2 className="text-lg font-bold">Budget Challenge</h2>
          <div className="w-8 h-8"></div> {/* Empty div for alignment */}
        </div>
      </div>
      
      {/* Game Content */}
      <div className="flex-1 p-4 overflow-auto bg-light">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Spending Priority Game</h3>
            <p className="text-dark/70">You have €50 to spend. Drag items below to arrange them by priority of spending.</p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium">Your Budget:</span>
              <span className="text-primary font-bold">€{budget}</span>
            </div>
            <div className="w-full bg-blue-200 h-2 rounded-full">
              <div 
                className="bg-primary h-full rounded-full progress-indicator" 
                style={{width: `${(spent / budget) * 100}%`}}
              ></div>
            </div>
            <div className="flex justify-between text-xs mt-1 text-dark/60">
              <span>€{spent} spent</span>
              <span>€{budget - spent} remaining</span>
            </div>
          </div>
          
          {/* Priority drop area */}
          <div 
            className="mb-6 border-2 border-dashed border-primary/30 rounded-lg p-4"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <h4 className="text-sm font-medium mb-3">Your Priorities (Drag items here)</h4>
            
            {prioritizedItems.length > 0 ? (
              <div className="space-y-3">
                {prioritizedItems.map((item) => (
                  <div key={item.id} className="bg-primary/10 rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                        <i className={`${item.icon} text-primary`}></i>
                      </div>
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <div className="text-xs text-primary">Priority #{item.priority}</div>
                      </div>
                    </div>
                    <span className="font-medium">€{item.cost}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-dark/50">
                <i className="ri-drag-move-2-line text-2xl mb-2"></i>
                <p>Drag items here to set your spending priorities</p>
              </div>
            )}
          </div>
          
          {/* Draggable items */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium mb-2">Available Items:</h4>
            {items.map((item) => (
              <div 
                key={item.id}
                className="bg-gray-100 rounded-lg p-3 cursor-move flex items-center justify-between" 
                draggable="true"
                onDragStart={(e) => handleDragStart(e, item)}
              >
                <div className="flex items-center">
                  <i className={`${item.icon} text-primary mr-3 text-lg`}></i>
                  <span>{item.name}</span>
                </div>
                <span className="font-medium">€{item.cost}</span>
              </div>
            ))}
            
            {items.length === 0 && (
              <div className="text-center py-4 text-dark/50">
                <p>No more items available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Game Bottom Navigation */}
      <div className="bg-white p-4 shadow-t">
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            className="flex-1 py-3 rounded-lg font-medium"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button 
            className="flex-1 bg-primary text-white py-3 rounded-lg font-medium transition-all hover:bg-primary/90"
            onClick={handleSubmit}
            disabled={prioritizedItems.length === 0}
          >
            Submit My Priorities
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## File: client/src/pages/home-page.tsx

```
typescript
import { useAuth } from "@/hooks/use-auth";
import BottomNav from "@/components/bottom-nav";
import UserHeader from "@/components/user-header";
import LessonCard from "@/components/lesson-card";
import AchievementCard from "@/components/achievement-card";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";

export default function HomePage() {
  const { user } = useAuth();
  
  const { data: lessons } = useQuery({
    queryKey: ['/api/lessons'],
  });
  
  const { data: achievements } = useQuery({
    queryKey: ['/api/achievements'],
  });

  return (
    <>
      <main className="flex-1 overflow-auto">
        <div id="home-screen" className="p-4 pt-6">
          <UserHeader />
          
          {/* Daily challenge */}
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 text-white mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Daily Challenge</h3>
                <p className="text-sm text-white/80">Complete a lesson to earn extra coins!</p>
              </div>
              <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center">
                <i className="ri-calendar-check-fill text-2xl"></i>
              </div>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-white/20 rounded-full relative">
                <div className="absolute top-0 left-0 h-full bg-white rounded-full" style={{width: "40%"}}></div>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>2/5 days</span>
                <span>+25 coins</span>
              </div>
            </div>
          </div>
          
          {/* Continue Learning section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Continue Learning</h3>
              <Link href="/lessons" className="text-primary text-sm">View all</Link>
            </div>
            
            {lessons && lessons.length > 0 ? (
              lessons.slice(0, 2).map((lesson) => (
                <LessonCard key={lesson.id} lesson={lesson} />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-4 mb-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mr-4">
                    <i className="ri-bank-card-line text-accent text-xl"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">Banking & Cards</h4>
                    <div className="flex justify-between items-center">
                      <Progress value={65} className="w-3/4 h-2" />
                      <span className="text-xs text-dark/60">65%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Visit your city */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Your Financial City</h3>
              <span className="text-secondary text-sm flex items-center">
                <i className="ri-building-2-line mr-1"></i> 3 buildings
              </span>
            </div>
            
            <div className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl p-4 relative h-44 overflow-hidden">
              <div className="absolute bottom-0 right-0 w-full h-32">
                <div className="w-full h-full object-cover object-bottom opacity-40 bg-blue-200"></div>
              </div>
              <div className="relative z-10">
                <h4 className="font-medium mb-1">FinCity</h4>
                <p className="text-sm text-dark/70 mb-4">Explore your financial city</p>
                <Link href="/city-map" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm inline-block">
                  Visit City
                </Link>
              </div>
            </div>
          </div>
          
          {/* Achievement badges */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">Your Achievements</h3>
              <Link href="/profile" className="text-primary text-sm">All badges</Link>
            </div>
            
            <div className="flex space-x-3 mb-3">
              {achievements && achievements.length > 0 ? (
                achievements.slice(0, 3).map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))
              ) : (
                <>
                  <AchievementCard 
                    achievement={{
                      id: 1,
                      name: "First Lesson",
                      icon: "ri-award-fill",
                      iconColor: "text-secondary",
                      iconBg: "bg-secondary/20",
                      unlocked: true
                    }} 
                  />
                  <AchievementCard 
                    achievement={{
                      id: 2,
                      name: "Coin Collector",
                      icon: "ri-money-dollar-circle-fill",
                      iconColor: "text-primary",
                      iconBg: "bg-primary/20",
                      unlocked: true
                    }} 
                  />
                  <AchievementCard 
                    achievement={{
                      id: 3,
                      name: "???",
                      icon: "ri-lock-2-line",
                      iconColor: "text-gray-400",
                      iconBg: "bg-gray-200",
                      unlocked: false
                    }} 
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <BottomNav active="home" />
    </>
  );
}
```

## File: client/src/pages/lesson-page.tsx

```
typescript
import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface Answer {
  id: number;
  text: string;
  correct: boolean;
}

interface Question {
  id: number;
  text: string;
  image?: string;
  answers: Answer[];
}

interface Lesson {
  id: string;
  title: string;
  topic: string;
  totalQuestions: number;
  currentQuestion: number;
  progress: number;
  questions: Question[];
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user } = useQuery<User>({ 
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }) 
  });
  const [, setLocation] = useLocation();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  
  // In a real app, this would fetch from the API
  const { data: lesson } = useQuery<Lesson>({
    queryKey: ['/api/lessons', id],
  });

  const mockLesson: Lesson = {
    id: id || "1",
    title: "Banking Basics",
    topic: "Banking & Cards",
    totalQuestions: 5,
    currentQuestion: 2,
    progress: 40,
    questions: [
      {
        id: 1,
        text: "What is the main difference between a debit card and a credit card?",
        answers: [
          { id: 1, text: "A debit card has a different color than a credit card.", correct: false },
          { id: 2, text: "A debit card uses your own money from your account, while a credit card borrows money that you have to pay back later.", correct: true },
          { id: 3, text: "A credit card can only be used online, while a debit card can be used in stores.", correct: false },
          { id: 4, text: "There is no difference, they're just different names for the same thing.", correct: false }
        ]
      }
    ]
  };

  const lessonData = lesson || mockLesson;
  const currentQuestion = lessonData.questions[0];

  const handleAnswerSelect = (answerId: number) => {
    setSelectedAnswer(answerId);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    
    const selected = currentQuestion.answers.find(a => a.id === selectedAnswer);
    setIsCorrect(!!selected?.correct);
    setShowResult(true);
  };

  const handleContinue = () => {
    // In a real app, this would advance to the next question or complete the lesson
    setLocation("/");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Lesson Header */}
      <div className="bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <button 
            className="w-8 h-8 flex items-center justify-center"
            onClick={() => setLocation("/")}
          >
            <i className="ri-arrow-left-line text-dark/70"></i>
          </button>
          <div className="flex items-center">
            <div className="flex items-center bg-primary/10 text-primary text-xs rounded-full px-3 py-1 mr-2">
              <i className="ri-heart-fill mr-1"></i>
              <span>3</span>
            </div>
            <div className="flex items-center bg-amber-50 text-amber-600 text-xs rounded-full px-3 py-1">
              <i className="ri-coin-fill mr-1"></i>
              <span>{user?.coins || 0}</span>
            </div>
          </div>
        </div>
        
        <Progress value={lessonData.progress} className="w-full h-2" />
        <div className="flex justify-between text-xs mt-1 text-dark/60">
          <span>Question {lessonData.currentQuestion}/{lessonData.totalQuestions}</span>
          <span>{lessonData.topic}</span>
        </div>
      </div>
      
      {/* Lesson Content */}
      <div className="flex-1 p-4 overflow-auto bg-light">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-bold mb-4">{currentQuestion.text}</h2>
          
          <div className="mb-5">
            <div className="w-full h-32 bg-blue-100 rounded-lg mb-4 flex items-center justify-center">
              <i className="ri-bank-card-line text-blue-500 text-4xl"></i>
            </div>
            <p className="text-dark/70">Select the correct answer:</p>
          </div>
          
          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.answers.map((answer) => (
              <div 
                key={answer.id}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all 
                  ${selectedAnswer === answer.id ? 'border-primary' : 'border-gray-200 hover:border-primary'}`}
                onClick={() => handleAnswerSelect(answer.id)}
              >
                <div className="flex items-start">
                  <div className={`w-6 h-6 rounded-full flex-shrink-0 mt-0.5 mr-3 flex items-center justify-center border-2 
                    ${selectedAnswer === answer.id ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                    {selectedAnswer === answer.id && (
                      <i className="ri-check-line text-white text-sm"></i>
                    )}
                  </div>
                  <p>{answer.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Lesson Bottom Navigation */}
      <div className="bg-white p-4 shadow-t">
        <Button
          className={`w-full py-3 rounded-lg font-medium transition-all 
            ${selectedAnswer === null ? 'bg-gray-300 text-dark/50' : 'bg-primary text-white hover:bg-primary/90'}`}
          disabled={selectedAnswer === null}
          onClick={handleCheckAnswer}
        >
          Check Answer
        </Button>
      </div>
      
      {/* Answer Result Modal */}
      {showResult && (
        <div className="fixed inset-0 bg-dark/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm mx-4 animate-bounce">
            <div className="text-center mb-4">
              {isCorrect ? (
                <div className="w-16 h-16 bg-success rounded-full mx-auto flex items-center justify-center mb-3">
                  <i className="ri-check-line text-3xl text-white"></i>
                </div>
              ) : (
                <div className="w-16 h-16 bg-destructive rounded-full mx-auto flex items-center justify-center mb-3">
                  <i className="ri-close-line text-3xl text-white"></i>
                </div>
              )}
              <h3 className="text-lg font-bold">{isCorrect ? 'Correct!' : 'Not quite right'}</h3>
              <p className="text-dark/70">
                {isCorrect 
                  ? "That's right! A debit card uses your own money, while a credit card lets you borrow money."
                  : "A debit card uses your own money from your account, while a credit card borrows money that you have to pay back later."}
              </p>
            </div>
            
            <div className="bg-light rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-2">Did you know?</h4>
              <p className="text-sm text-dark/70">Credit cards often come with extra fees and interest if you don't pay back the full amount each month.</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-success">
                <i className="ri-coin-fill mr-1"></i>
                <span>+10 coins</span>
              </div>
              <Button 
                className="bg-primary text-white px-6 py-2 rounded-lg"
                onClick={handleContinue}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## File: client/src/pages/not-found.tsx

```
typescript
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

## File: client/src/pages/profile-page.tsx

```
typescript
import BottomNav from "@/components/bottom-nav";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface Achievement {
  id: number;
  name: string;
  icon: string;
  date: string;
  reward: number;
}

interface LearningTopic {
  id: number;
  name: string;
  lessons: {
    completed: number;
    total: number;
  };
  progress: number;
}

export default function ProfilePage() {
  const { data: user } = useQuery<User>({ 
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }) 
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      // Redirect to auth page
      window.location.href = "/auth";
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const { data: achievements } = useQuery({
    queryKey: ['/api/achievements'],
  });
  
  const { data: topics } = useQuery({
    queryKey: ['/api/topics'],
  });

  // Mock data until we have real data
  const mockAchievements: Achievement[] = [
    {
      id: 1,
      name: "First Lesson Completed",
      icon: "ri-award-fill",
      date: "2 days ago",
      reward: 50
    },
    {
      id: 2,
      name: "First Building Purchased",
      icon: "ri-building-2-fill",
      date: "1 week ago",
      reward: 100
    },
    {
      id: 3,
      name: "Budget Master",
      icon: "ri-money-dollar-circle-fill",
      date: "1 week ago",
      reward: 75
    }
  ];
  
  const mockTopics: LearningTopic[] = [
    {
      id: 1,
      name: "Budgeting",
      lessons: {
        completed: 3,
        total: 5
      },
      progress: 60
    },
    {
      id: 2,
      name: "Banking & Cards",
      lessons: {
        completed: 4,
        total: 6
      },
      progress: 65
    },
    {
      id: 3,
      name: "Savings",
      lessons: {
        completed: 1,
        total: 4
      },
      progress: 25
    },
    {
      id: 4,
      name: "Online Safety",
      lessons: {
        completed: 0,
        total: 3
      },
      progress: 0
    }
  ];
  
  const userAchievements = achievements || mockAchievements;
  const learningTopics = topics || mockTopics;
  
  // Calculate progress to next level
  const currentLevel = 4;
  const currentXP = user?.xp || 240;
  const nextLevelXP = 400;
  const xpToNextLevel = nextLevelXP - currentXP;
  const progressToNextLevel = (currentXP / nextLevelXP) * 100;

  return (
    <>
      <main className="flex-1 p-4 overflow-auto bg-light">
        {/* Profile Header */}
        <div className="bg-white p-4 shadow-sm mb-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Your Profile</h2>
            <button className="w-8 h-8 flex items-center justify-center" onClick={() => logoutMutation.mutate()}>
              <i className="ri-logout-box-line text-dark/70"></i>
            </button>
          </div>
        </div>
        
        {/* User Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto flex items-center justify-center mb-3">
            <span className="text-primary text-2xl font-bold">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
          <h3 className="text-xl font-bold mb-1">{user?.username || 'User'}</h3>
          <p className="text-dark/60 mb-4">Joined 2 weeks ago</p>
          
          <div className="flex justify-center space-x-4">
            <div className="text-center">
              <div className="text-lg font-bold text-primary">Level {currentLevel}</div>
              <div className="text-xs text-dark/60">Rank</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-500">{user?.xp || 0} XP</div>
              <div className="text-xs text-dark/60">Experience</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-500">{userAchievements.length}</div>
              <div className="text-xs text-dark/60">Badges</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>Level {currentLevel}</span>
              <span>Level {currentLevel + 1}</span>
            </div>
            <Progress value={progressToNextLevel} className="w-full h-2" />
            <div className="text-xs text-right mt-1 text-dark/60">
              {xpToNextLevel} XP to next level
            </div>
          </div>
        </div>
        
        {/* Achievements */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-bold mb-4">Recent Achievements</h3>
          
          <div className="space-y-4">
            {userAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
                  <i className={`${achievement.icon} text-secondary`}></i>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{achievement.name}</h4>
                  <p className="text-xs text-dark/60">{achievement.date}</p>
                </div>
                <div className="flex items-center text-amber-500 text-sm">
                  <i className="ri-coin-fill mr-1"></i>
                  <span>+{achievement.reward}</span>
                </div>
              </div>
            ))}
            
            {userAchievements.length === 0 && (
              <div className="text-center py-4 text-dark/50">
                <p>No achievements yet. Keep learning!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Learning Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-bold mb-4">Your Learning Stats</h3>
          
          <div className="space-y-4">
            {learningTopics.map((topic) => (
              <div key={topic.id}>
                <div className="flex justify-between mb-1">
                  <h4 className="text-sm font-medium">{topic.name}</h4>
                  <span className="text-xs text-dark/60">{topic.lessons.completed}/{topic.lessons.total} lessons</span>
                </div>
                <Progress value={topic.progress} className="w-full h-2" />
              </div>
            ))}
            
            {learningTopics.length === 0 && (
              <div className="text-center py-4 text-dark/50">
                <p>No learning progress yet. Start a lesson!</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <BottomNav active="profile" />
    </>
  );
}
```

## File: client/src/pages/shop-page.tsx

```
typescript
import { useState } from "react";
import BottomNav from "@/components/bottom-nav";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

interface ShopItem {
  id: number;
  name: string;
  price: number;
  type: string;
  icon: string;
  color: string;
  owned: boolean;
}

export default function ShopPage() {
  const { data: user } = useQuery<User>({ 
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }) 
  });
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string>("Buildings");
  
  const { data: shopItems } = useQuery({
    queryKey: ['/api/shop'],
  });
  
  const purchaseMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await apiRequest("POST", `/api/shop/purchase/${itemId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shop'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Purchase successful",
        description: "Your new item has been added to your city!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handlePurchase = (item: ShopItem) => {
    if (user && user.coins >= item.price) {
      purchaseMutation.mutate(item.id);
    } else {
      toast({
        title: "Not enough coins",
        description: `You need ${item.price - (user?.coins || 0)} more coins to buy this item.`,
        variant: "destructive",
      });
    }
  };
  
  // Mock shop items until we have real data
  const mockShopItems: ShopItem[] = [
    {
      id: 1,
      name: "Investment Center",
      price: 250,
      type: "Buildings",
      icon: "ri-building-fill",
      color: "primary",
      owned: false
    },
    {
      id: 2,
      name: "Housing Center",
      price: 300,
      type: "Buildings",
      icon: "ri-home-4-fill",
      color: "green-500",
      owned: false
    },
    {
      id: 3,
      name: "Credit Bureau",
      price: 200,
      type: "Buildings",
      icon: "ri-bank-fill",
      color: "purple-500",
      owned: false
    },
    {
      id: 4,
      name: "Security Center",
      price: 180,
      type: "Buildings",
      icon: "ri-shield-check-fill",
      color: "red-500",
      owned: false
    }
  ];
  
  const items = shopItems || mockShopItems;
  const filteredItems = items.filter(item => item.type === activeCategory);

  return (
    <>
      <main className="flex-1 overflow-auto bg-light">
        {/* Shop Header */}
        <div className="bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold">FinCity Shop</h2>
            <div className="flex items-center bg-amber-50 text-amber-600 text-sm rounded-full px-3 py-1">
              <i className="ri-coin-fill mr-1"></i>
              <span>{user?.coins || 0}</span>
            </div>
          </div>
        </div>
        
        {/* Shop Categories */}
        <div className="px-4 py-3 bg-white sticky top-0 z-10">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button 
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeCategory === 'Buildings' ? 'bg-primary text-white' : 'bg-light text-dark/70'}`}
              onClick={() => setActiveCategory('Buildings')}
            >
              Buildings
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeCategory === 'Avatars' ? 'bg-primary text-white' : 'bg-light text-dark/70'}`}
              onClick={() => setActiveCategory('Avatars')}
            >
              Avatars
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeCategory === 'Decorations' ? 'bg-primary text-white' : 'bg-light text-dark/70'}`}
              onClick={() => setActiveCategory('Decorations')}
            >
              Decorations
            </button>
            <button 
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${activeCategory === 'Boosts' ? 'bg-primary text-white' : 'bg-light text-dark/70'}`}
              onClick={() => setActiveCategory('Boosts')}
            >
              Boosts
            </button>
          </div>
        </div>
        
        {/* Shop Items */}
        <div className="p-4 grid grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className={`h-32 bg-${item.color === 'primary' ? 'blue' : item.color.split('-')[0]}-100 relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-20 h-20 bg-${item.color} rounded-lg flex items-center justify-center`}>
                    <i className={`${item.icon} text-white text-3xl`}></i>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium mb-1">{item.name}</h3>
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-amber-500 text-sm">
                    <i className="ri-coin-fill mr-1"></i> {item.price}
                  </span>
                  {item.owned ? (
                    <Button variant="secondary" className="text-white text-xs px-3 py-1 rounded" disabled>
                      Owned
                    </Button>
                  ) : user && user.coins >= item.price ? (
                    <Button 
                      className="bg-primary text-white text-xs px-3 py-1 rounded"
                      onClick={() => handlePurchase(item)}
                      disabled={purchaseMutation.isPending}
                    >
                      Buy
                    </Button>
                  ) : (
                    <Button className="bg-gray-200 text-gray-400 text-xs px-3 py-1 rounded" disabled>
                      Not enough
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredItems.length === 0 && (
            <div className="col-span-2 text-center py-10 text-dark/50">
              <i className="ri-shopping-cart-line text-3xl mb-2"></i>
              <p>No items available in this category</p>
            </div>
          )}
        </div>
      </main>
      <BottomNav active="shop" />
    </>
  );
}
```

## File: db/index.ts

```
typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// This is the correct way neon config - DO NOT change this
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });```

## File: db/seed.ts

```
typescript
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
      
      console.log("Database seeded successfully!");
    } else {
      console.log("Database already contains data. Skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
```

## File: drizzle.config.ts

```
typescript
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./db/migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
});
```

## File: package.json

```
json
{
  "name": "rest-express",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push --force --config=./drizzle.config.ts",
    "db:seed": "tsx db/seed.ts"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.1",
    "@jridgewell/trace-mapping": "^0.3.25",
    "@neondatabase/serverless": "^0.10.4",
    "@radix-ui/react-accordion": "^1.2.1",
    "@radix-ui/react-alert-dialog": "^1.1.2",
    "@radix-ui/react-aspect-ratio": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-checkbox": "^1.1.2",
    "@radix-ui/react-collapsible": "^1.1.1",
    "@radix-ui/react-context-menu": "^2.2.2",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-hover-card": "^1.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-menubar": "^1.1.2",
    "@radix-ui/react-navigation-menu": "^1.2.1",
    "@radix-ui/react-popover": "^1.1.2",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.1",
    "@radix-ui/react-scroll-area": "^1.2.0",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slider": "^1.2.1",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.1",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-toast": "^1.2.2",
    "@radix-ui/react-toggle": "^1.1.0",
    "@radix-ui/react-toggle-group": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.3",
    "@replit/vite-plugin-cartographer": "^0.0.11",
    "@replit/vite-plugin-shadcn-theme-json": "^0.0.4",
    "@tanstack/react-query": "^5.60.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "connect-pg-simple": "^10.0.0",
    "date-fns": "^3.6.0",
    "drizzle-orm": "^0.38.4",
    "drizzle-seed": "^0.3.1",
    "drizzle-zod": "^0.6.1",
    "embla-carousel-react": "^8.3.0",
    "express": "^4.21.2",
    "express-session": "^1.18.1",
    "framer-motion": "^11.13.1",
    "input-otp": "^1.2.4",
    "lucide-react": "^0.453.0",
    "passport": "^0.7.0",
    "passport-local": "^1.0.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.1",
    "react-icons": "^5.4.0",
    "react-resizable-panels": "^2.1.4",
    "recharts": "^2.13.0",
    "tailwind-merge": "^2.5.4",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^1.1.0",
    "wouter": "^3.3.5",
    "ws": "^8.18.0",
    "zod": "^3.24.3",
    "zod-validation-error": "^3.4.0"
  },
  "devDependencies": {
    "@replit/vite-plugin-runtime-error-modal": "^0.0.3",
    "@tailwindcss/typography": "^0.5.15",
    "@types/connect-pg-simple": "^7.0.3",
    "@types/express": "4.17.21",
    "@types/express-session": "^1.18.0",
    "@types/node": "20.16.11",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@types/ws": "^8.5.13",
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "drizzle-kit": "^0.27.1",
    "esbuild": "^0.24.0",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "tsx": "^4.19.1",
    "typescript": "5.6.3",
    "vite": "^5.4.9"
  },
  "optionalDependencies": {
    "bufferutil": "^4.0.8"
  }
}
```

## File: README.md

```
markdown
# FinCity Financial Education App

This directory contains exported code files from the FinCity financial education app project.

The app is a gamified financial education platform for teenagers (ages 12-17), designed to teach financial literacy through interactive gameplay. It combines features similar to Duolingo (level-based learning progression) and Monopoly (virtual city with properties).

## Technology Stack
- Frontend: React, TypeScript, Tailwind CSS, Shadcn UI
- Backend: Express.js
- Database: PostgreSQL with Drizzle ORM
- Authentication: Passport.js with session-based auth
- State Management: React Query

## Project Structure
The code is organized in the following directories:

1. `client/` - Frontend React application
   - `src/components/` - Reusable UI components
   - `src/hooks/` - Custom React hooks
   - `src/lib/` - Utility functions and configurations
   - `src/pages/` - Page components for each route

2. `server/` - Backend Express application
   - `auth.ts` - Authentication setup with Passport.js
   - `routes.ts` - API route definitions
   - `storage.ts` - Database access layer

3. `shared/` - Code shared between frontend and backend
   - `schema.ts` - Database schema definitions with Drizzle ORM

4. `db/` - Database related code
   - `index.ts` - Database connection setup
   - `seed.ts` - Seed data for development

## Feature Overview
- Authentication system with login/register
- Virtual city map with buildings that teach different financial concepts
- Interactive lessons with quizzes
- Virtual currency and economy simulation
- Profile with achievements and progress tracking
- Shop to purchase virtual items

## Getting Started
1. Install dependencies: `npm install`
2. Set up PostgreSQL database
3. Create `.env` file with `DATABASE_URL` pointing to your PostgreSQL instance
4. Run database migrations: `npm run db:push`
5. Seed the database: `npm run db:seed`
6. Start the development server: `npm run dev`

## Login Credentials (Development)
- Username: demo
- Password: password

## Directory Contents
This export directory contains code files organized by their original location in the project structure.```

## File: server/auth.ts

```
typescript
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
    secret: process.env.SESSION_SECRET || 'financity-app-secret',
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

## File: server/index.ts

```
typescript
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
```

## File: server/routes.ts

```
typescript
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
```

## File: server/storage.ts

```
typescript
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
```

## File: server/vite.ts

```
typescript
import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
```

## File: shared/schema.ts

```
typescript
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

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId]
  }),
  lessonProgress: many(lessonProgress),
  buildingOwnership: many(buildingOwnership),
  topicProgress: many(topicProgress),
  achievements: many(userAchievements)
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

## File: tailwind.config.ts

```
typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
```

## File: tsconfig.json

```
json
{
  "include": ["client/src/**/*", "db/**/*", "server/**/*"],
  "exclude": ["node_modules", "build", "dist", "**/*.test.ts"],
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./node_modules/typescript/tsbuildinfo",
    "noEmit": true,
    "module": "ESNext",
    "strict": true,
    "lib": ["esnext", "dom", "dom.iterable"],
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "types": ["node", "vite/client"],
    "paths": {
      "@db": ["./db/index.ts"],
      "@db/*": ["./db/*"],
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}
```

## File: vite.config.ts

```
typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@db": path.resolve(import.meta.dirname, "db"),
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
});
```
