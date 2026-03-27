// Auth Context - Simulated authentication state
// Default user is always logged in as per assignment spec

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default user — always logged in per assignment spec
const DEFAULT_USER: User = {
  id: "user-001",
  name: "Arpit Sharma",
  email: "arpit@shopkart.in",
  createdAt: new Date().toISOString(),
};

const loadUser = (): User | null => {
  try {
    const saved = localStorage.getItem("auth_user");
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(loadUser);

  useEffect(() => {
    if (user) {
      localStorage.setItem("auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth_user");
    }
  }, [user]);

  // Simulate login — accepts any credentials
  const login = async (email: string, _password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 800)); // simulate network delay
    const loginUser: User = {
      id: `user-${Date.now()}`,
      name: email.split("@")[0].replace(/\./g, " "),
      email,
      createdAt: new Date().toISOString(),
    };
    setUser(loginUser);
    return true;
  };

  // Simulate signup
  const signup = async (name: string, email: string, _password: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 1000));
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
