import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { insertUserSchema, UserWithProfile } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Lock, Mail, AlertCircle, ExternalLink, CheckCircle2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";

// Enhanced login schema with email/username support
const loginSchema = z.object({
  identifier: z.string().min(3, "Username or email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false),
});

// Enhanced register schema with additional fields
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/home-page.tsx");
    }
  }, [user, navigate]);

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "Password not entered",
    color: "bg-gray-200"
  });

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength({
        score: 0,
        message: "Password not entered",
        color: "bg-gray-200"
      });
      return;
    }

    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety check
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Set message and color based on score
    let message = "";
    let color = "";
    
    switch (true) {
      case (score <= 1):
        message = "Weak";
        color = "bg-red-500";
        break;
      case (score <= 3):
        message = "Moderate";
        color = "bg-yellow-500";
        break;
      case (score <= 5):
        message = "Strong";
        color = "bg-green-500";
        break;
      default:
        message = "Very Strong";
        color = "bg-green-600";
    }
    
    setPasswordStrength({score, message, color});
  };

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginValues) => {
      const res = await apiRequest("POST", "/api/login", {
        username: credentials.identifier,
        password: credentials.password
      });
      
      if (!res.ok) {
        throw new Error(await res.text());
      }
      
      const user = await res.json();
      return user;
    },
    onSuccess: (user: UserWithProfile) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
        variant: "default",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterValues) => {
      // Only send the fields that the backend expects
      const payload = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
      };
      const res = await apiRequest("POST", "/api/register", payload);
      return await res.json();
    },
    onSuccess: (user: UserWithProfile) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "Registration successful",
        description: "Your account has been created! Welcome to FinCity.",
        variant: "default",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create your account. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: false,
    },
  });

  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      agreeToTerms: false,
    },
  });

  // Watch password to check strength
  const watchedPassword = registerForm.watch("password");
  
  useEffect(() => {
    checkPasswordStrength(watchedPassword);
  }, [watchedPassword]);

  // Form submission handlers
  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterValues) => {
    registerMutation.mutate(values);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Auth Forms */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <motion.h1 
              className="text-3xl font-bold text-primary mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              FinCity
            </motion.h1>
            <motion.p 
              className="text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Learn finances. Build your future.
            </motion.p>
          </div>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md p-6 mb-6"
              >
                <h2 className="text-xl font-semibold mb-4">Welcome back</h2>
                
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Email or Username</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                placeholder="Enter your email or username" 
                                className="pl-10"
                                {...field} 
                              />
                            </FormControl>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                              <User size={16} />
                            </div>
                          </div>
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
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Enter your password" 
                                className="pl-10"
                                {...field} 
                              />
                            </FormControl>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                              <Lock size={16} />
                            </div>
                            <button 
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          <div className="flex justify-end">
                            <button 
                              type="button" 
                              className="text-xs text-primary hover:text-primary/80 mt-1"
                              onClick={() => toast({
                                title: "Password Reset",
                                description: "This feature will be implemented soon!",
                              })}
                            >
                              Forgot password?
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              Remember me
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Log In"}
                    </Button>
                  </form>
                </Form>
                
                {loginMutation.isError && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                    <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{loginMutation.error?.message || "Invalid username or password"}</p>
                  </div>
                )}
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-xs text-gray-500">OR</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button variant="outline" className="w-full" onClick={() => {
                    toast({
                      title: "Social Login",
                      description: "This feature will be implemented soon!",
                    });
                  }}>
                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" className="w-4 h-4 mr-2" />
                    Continue with Google
                  </Button>
                </div>
              </motion.div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button 
                    type="button" 
                    className="text-primary font-medium"
                    onClick={() => setActiveTab("register")}
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="register">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md p-6 mb-6"
              >
                <h2 className="text-xl font-semibold mb-4">Create your account</h2>
                
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">First Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your first name" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Last Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Your last name" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Username</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                placeholder="Choose a username" 
                                className="pl-10"
                                {...field} 
                              />
                            </FormControl>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                              <User size={16} />
                            </div>
                          </div>
                          <FormDescription className="text-xs">
                            This will be your unique identifier in the app.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Email</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="your.email@example.com" 
                                className="pl-10"
                                {...field} 
                              />
                            </FormControl>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                              <Mail size={16} />
                            </div>
                          </div>
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
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="Create a password" 
                                className="pl-10"
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e);
                                  checkPasswordStrength(e.target.value);
                                }}
                              />
                            </FormControl>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                              <Lock size={16} />
                            </div>
                            <button 
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          {/* Password strength indicator */}
                          <div className="mt-2">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-500">Password strength:</span>
                              <span className={`text-xs ${
                                passwordStrength.message === "Strong" || passwordStrength.message === "Very Strong" 
                                  ? "text-green-600" 
                                  : passwordStrength.message === "Moderate" 
                                    ? "text-yellow-600" 
                                    : "text-red-600"
                              }`}>
                                {passwordStrength.message}
                              </span>
                            </div>
                            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${passwordStrength.color}`} 
                                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                          <FormDescription className="text-xs mt-1">
                            Use 8+ characters with a mix of letters, numbers & symbols.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="Confirm your password" 
                                className="pl-10"
                                {...field} 
                              />
                            </FormControl>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                              <Lock size={16} />
                            </div>
                            <button 
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal">
                              I agree to the{" "}
                              <button 
                                type="button" 
                                className="text-primary hover:underline"
                                onClick={() => toast({
                                  title: "Terms & Conditions",
                                  description: "This feature will be implemented soon!",
                                })}
                              >
                                Terms of Service
                              </button>{" "}
                              and{" "}
                              <button 
                                type="button" 
                                className="text-primary hover:underline"
                                onClick={() => toast({
                                  title: "Privacy Policy",
                                  description: "This feature will be implemented soon!",
                                })}
                              >
                                Privacy Policy
                              </button>
                            </FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
                
                {registerMutation.isError && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
                    <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{registerMutation.error?.message || "Could not create your account. Please try again."}</p>
                  </div>
                )}
              </motion.div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button 
                    type="button" 
                    className="text-primary font-medium"
                    onClick={() => setActiveTab("login")}
                  >
                    Log in
                  </button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Demo account information */}
          <motion.div 
            className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-start">
              <CheckCircle2 size={20} className="mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Demo Account:</p>
                <p className="mt-1">Username: <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">demo</span></p>
                <p>Password: <span className="font-mono bg-blue-100 px-1 py-0.5 rounded">password</span></p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Right side - Hero Image/Information */}
      <div className="hidden md:block w-1/2 bg-gradient-to-br from-primary to-primary-dark text-white p-12 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-black/10 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex-1">
            <motion.h2 
              className="text-4xl font-bold mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Start Your Financial Journey Today
            </motion.h2>
            
            <motion.p 
              className="text-xl mb-8 text-white/90"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              Learn essential financial skills through interactive lessons and build your own virtual city!
            </motion.p>
            
            <div className="space-y-6">
              <motion.div 
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="bg-white/20 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Earn Achievements</h3>
                  <p className="text-white/80">Complete lessons and unlock special achievements</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="bg-white/20 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide"><circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h2v4" /><path d="m16 16 4 4" /><path d="m20 16-4 4" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Manage Virtual Currency</h3>
                  <p className="text-white/80">Earn and spend coins while learning real financial skills</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
              >
                <div className="bg-white/20 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide"><path d="M12.22 2h-.44a2.5 2.5 0 0 0-2 2v.18a2.5 2.5 0 0 1-1 1.73l-.43.25a2.5 2.5 0 0 1-2 0l-.15-.08a2.5 2.5 0 0 0-2.73.73l-.22.38a2.5 2.5 0 0 0 .73 2.73l.15.1a2.5 2.5 0 0 1 1 1.72v.51a2.5 2.5 0 0 1-1 1.74l-.15.09a2.5 2.5 0 0 0-.73 2.73l.22.38a2.5 2.5 0 0 0 2.73.73l.15-.08a2.5 2.5 0 0 1 2 0l.43.25a2.5 2.5 0 0 1 1 1.73V20a2.5 2.5 0 0 0 2 2h.44a2.5 2.5 0 0 0 2-2v-.18a2.5 2.5 0 0 1 1-1.73l.43-.25a2.5 2.5 0 0 1 2 0l.15.08a2.5 2.5 0 0 0 2.73-.73l.22-.39a2.5 2.5 0 0 0-.73-2.73l-.15-.08a2.5 2.5 0 0 1-1-1.74v-.5a2.5 2.5 0 0 1 1-1.74l.15-.09a2.5 2.5 0 0 0 .73-2.73l-.22-.38a2.5 2.5 0 0 0-2.73-.73l-.15.08a2.5 2.5 0 0 1-2 0l-.43-.25a2.5 2.5 0 0 1-1-1.73V4a2.5 2.5 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Build Your Virtual City</h3>
                  <p className="text-white/80">Expand your city as you master financial concepts</p>
                </div>
              </motion.div>
            </div>
          </div>
          
          <motion.div 
            className="mt-auto pt-8 border-t border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.2 }}
          >
            <div className="flex space-x-4">
              <span className="text-white/60 text-sm flex items-center">
                <ExternalLink size={14} className="mr-1" /> Privacy Policy
              </span>
              <span className="text-white/60 text-sm flex items-center">
                <ExternalLink size={14} className="mr-1" /> Terms of Service
              </span>
              <span className="text-white/60 text-sm flex items-center">
                <ExternalLink size={14} className="mr-1" /> Help Center
              </span>
            </div>
          </motion.div>
        </div>
        
        {/* Animated decorative elements */}
        <motion.div 
          className="absolute top-24 right-12 w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm"
          animate={{ 
            y: [0, 15, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
        />
        
        <motion.div 
          className="absolute bottom-24 left-16 w-24 h-24 rounded-full bg-white/5 backdrop-blur-sm"
          animate={{ 
            y: [0, -15, 0],
            scale: [1, 1.03, 1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
    </div>
  );
}
