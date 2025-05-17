import { createContext, ReactNode, useContext, useEffect, useState } from "react";
// Remove React Query and API related imports
// import { useQuery, useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
// import { insertUserSchema, UserWithProfile, InsertUser } from "@shared/schema";
// import { apiRequest } from "../lib/queryClient";

import { useNavigate, useLocation } from "react-router-dom";

// Using direct toast function, not hook
import { toast } from "@/hooks/use-toast";

// Import Firebase Auth
import { getAuth, onAuthStateChanged, User, signOut } from "firebase/auth";
import { app } from "../firebaseConfig"; // Import the initialized Firebase app

// Get Auth instance
const auth = getAuth(app);

// Define the shape of the authentication context
type AuthContextType = {
  user: User | null; // Firebase Auth User object
  isLoading: boolean; // Loading state while checking initial auth status
  // Remove mutation results from context as they are handled in auth-page
  // loginMutation: UseMutationResult<UserWithProfile, Error, LoginData>;
  // registerMutation: UseMutationResult<UserWithProfile, Error, InsertUser>;
  logout: () => Promise<void>; // Function to log out
};

// type LoginData = Pick<InsertUser, "username" | "password">; // No longer needed in hook

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false); // Set loading to false after checking auth state
    });

    // Cleanup the subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Effect to handle auth redirects
  useEffect(() => {
    // If user is logged in and on the auth page, redirect to home
    if (user && location.pathname === "/auth") {
      navigate("/");
    }
    // If user is not logged in and on a protected route (not auth), redirect to auth
    // You might need a more sophisticated way to define protected routes
    // For simplicity, this example redirects if not on /auth and not logged in
    if (!user && location.pathname !== "/auth" && !isLoading) {
        // Only redirect if not loading and not already on the auth page
        navigate("/auth");
    }
  }, [user, location.pathname, navigate, isLoading]); // Added isLoading to dependencies

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      // onAuthStateChanged listener will set user to null and trigger the redirect
    } catch (error: any) {
      console.error("Firebase Logout error:", error);
      toast({
        title: "Logout failed",
        description: error.message || "Could not log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        logout, // Provide the logout function
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
