"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getUserFromToken } from "@/lib/auth";

type AuthContextType = {
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ 
  children,
  initialAuthState,
}: {
  children: React.ReactNode;
  initialAuthState: boolean;
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(initialAuthState);

  // Sync auth state on client-side (e.g., after login/logout)
  useEffect(() => {
    const checkAuth = async () => {
      const user = await getUserFromToken();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};