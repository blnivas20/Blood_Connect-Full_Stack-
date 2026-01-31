"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

// Type definitions for auth context
interface User {
  id: number;
  username: string;
  email: string;
  blood_group?: string;
  city?: string;
  phone?: string;
  is_donor?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component wraps the app and provides auth state
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      setToken(storedToken);
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch current user profile from API
  const fetchUser = async () => {
    try {
      const response = await api.get("/profile/me/");
      setUser(response.data);
    } catch (error) {
      // Token might be expired, clear it
      console.error("Failed to fetch user:", error);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function - authenticates user and stores JWT tokens
  const login = async (username: string, password: string) => {
    const response = await api.post("/auth/login/", { username, password });
    const { access, refresh } = response.data;

    // Store tokens in localStorage
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setToken(access);

    // Fetch user profile after successful login
    await fetchUser();
    router.push("/");
  };

  // Register function - creates new user account
  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    await api.post("/auth/register/", { username, email, password });
    // After registration, automatically log in
    const response = await api.post("/auth/login/", { username, password });
    const { access, refresh } = response.data;

    // Store tokens in localStorage
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setToken(access);

    // Fetch user profile
    await fetchUser();
    
    // Redirect to complete profile page
    router.push("/register/complete");
  };

  // Logout function - clears tokens and redirects to login
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to access auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
