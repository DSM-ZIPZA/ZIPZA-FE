import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getLoginUrl } from "@/const";
import { COOKIE_NAME } from "@/shared/const";
import { TOKEN_KEY } from "@/shared/api/client";
import { zipzaApi } from "@/shared/api/zipza";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = async () => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setUser(null);
      return;
    }
    try {
      const me = await zipzaApi.me();
      setUser({ name: me.nickname, email: me.email });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = () => {
    window.location.href = getLoginUrl();
  };

  const setAuthToken = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    refreshUser();
  };

  const logout = async () => {
    try {
      await zipzaApi.logout();
    } catch {
      // 로컬 세션 정리는 서버 로그아웃 실패 여부와 무관하게 진행한다.
    }
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
