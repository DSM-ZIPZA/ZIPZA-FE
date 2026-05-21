import { createContext, useContext, useState, type ReactNode } from "react";
import { getLoginUrl } from "@/const";
import { COOKIE_NAME } from "@/shared/const";

export interface User {
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: () => void;
  setAuthToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const TOKEN_KEY = "zipza_access_token";

function decodeUser(token: string): User | null {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    ) as Record<string, unknown>;
    const name =
      (payload.name as string) ??
      (payload.preferred_username as string) ??
      (payload.sub as string) ??
      "사용자";
    const email = (payload.email as string) ?? (payload.sub as string) ?? "";
    return { name, email };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    return stored ? decodeUser(stored) : null;
  });

  const login = () => {
    window.location.href = getLoginUrl();
  };

  const setAuthToken = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(decodeUser(newToken));
  };

  const logout = () => {
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, setAuthToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
