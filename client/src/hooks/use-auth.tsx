import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
  useQueryClient,
} from "@tanstack/react-query";
import { insertUserSchema, UserWithProfile, InsertUser } from "@shared/schema";
import { apiRequest } from "../lib/queryClient";
import { useNavigate, useLocation } from "react-router-dom";

// Using direct toast function, not hook
import { toast } from "@/hooks/use-toast";

type AuthContextType = {
  user: UserWithProfile | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<UserWithProfile, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<UserWithProfile, Error, InsertUser>;
  refetchUser: () => void;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [forceRefresh, setForceRefresh] = useState(0);

  // Query for user data
  const {
    data: user,
    error,
    isLoading,
    refetch: refetchUser,
  } = useQuery<UserWithProfile | null>({
    queryKey: ["/api/user", forceRefresh],
    queryFn: async () => {
      try {
        const res = await fetch("/api/user", { 
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache"
          }
        });
        if (res.status === 401) return null;
        if (!res.ok) throw new Error(await res.text());
        return await res.json();
      } catch (err) {
        console.error("Error fetching user:", err);
        return null;
      }
    },
    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  // Force refetch helper
  const triggerRefetch = () => {
    setForceRefresh(prev => prev + 1);
    refetchUser();
  };

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: UserWithProfile) => {
      // Update cache with new user data
      queryClient.setQueryData(["/api/user", forceRefresh], user);
      
      // Force refetch to ensure UI updates
      triggerRefetch();
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Navigate to home page
      setTimeout(() => navigate("/"), 100);
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
    onSuccess: (user: UserWithProfile) => {
      // Update cache with new user data
      queryClient.setQueryData(["/api/user", forceRefresh], user);
      
      // Force refetch to ensure UI updates
      triggerRefetch();
      
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });
      
      // Navigate to home page
      setTimeout(() => navigate("/"), 100);
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
      // Clear user data from cache
      queryClient.setQueryData(["/api/user", forceRefresh], null);
      
      // Force refetch to ensure UI updates
      triggerRefetch();
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      
      // Navigate to auth page
      setTimeout(() => navigate("/auth"), 100);
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Effect to handle auth redirects
  useEffect(() => {
    if (user && location.pathname === "/auth") {
      navigate("/");
    }
  }, [user, location.pathname, navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        refetchUser: triggerRefetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
