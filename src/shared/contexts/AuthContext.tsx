import { createContext, useContext, useState, type ReactNode } from "react";
import { getLoginUrl } from "@/const";
import { COOKIE_NAME } from "@/shared/const";

export interface User {
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  login: () => void;
  mockLogin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_STORAGE_KEY = "zipza_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  const login = () => {
    window.location.href = getLoginUrl();
  };

  const mockLogin = () => {
    const mockUser: User = { name: "김도은", email: "qwaszx080402@dsm.hs.kr" };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = () => {
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, mockLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
