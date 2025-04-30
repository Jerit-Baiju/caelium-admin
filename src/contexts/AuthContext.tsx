"use client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useEffect, useRef, useState } from "react";

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthContextProps {
  authTokens: AuthTokens | null;
  tokenData: any;
  user: any;
  error: string | null;
  loginUser: (username: string, password: string) => Promise<boolean>;
  logoutUser: () => void;
  setAuthTokens: (tokens: AuthTokens | null) => void;
  refreshToken: () => Promise<AuthTokens | null>;
}

const AuthContext = createContext<AuthContextProps>({
  authTokens: null,
  tokenData: null,
  user: null,
  error: null,
  loginUser: async () => false,
  logoutUser: () => {},
  setAuthTokens: () => {},
  refreshToken: async () => null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [authTokens, setAuthTokens] = useState<AuthTokens | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("authTokens");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [tokenData, setTokenData] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("authTokens");
      return stored ? jwtDecode(JSON.parse(stored).access) : null;
    }
    return null;
  });
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const API_HOST = process.env.NEXT_PUBLIC_API_HOST;

  // Proactive token refresh
  const refreshToken = async () => {
    if (!authTokens?.refresh) return null;
    try {
      const response = await axios.post(`${API_HOST}/api/dash/login/refresh/`, {
        refresh: authTokens.refresh,
      });
      const newTokens = {
        access: response.data.access,
        refresh: authTokens.refresh,
      };
      localStorage.setItem("authTokens", JSON.stringify(newTokens));
      setAuthTokens(newTokens);
      setTokenData(jwtDecode(response.data.access));
      scheduleTokenRefresh(response.data.access);
      return newTokens;
    } catch (err) {
      logoutUser();
      return null;
    }
  };

  // Schedule token refresh 5 minutes before expiry
  const scheduleTokenRefresh = (accessToken: string) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    try {
      const decoded: any = jwtDecode(accessToken);
      const expiry = decoded.exp * 1000;
      const timeUntilRefresh = expiry - Date.now() - 300000;
      if (timeUntilRefresh <= 0) {
        refreshToken();
        return;
      }
      refreshTimerRef.current = setTimeout(refreshToken, timeUntilRefresh);
    } catch {
      logoutUser();
    }
  };

  useEffect(() => {
    if (authTokens?.access) {
      setTokenData(jwtDecode(authTokens.access));
      scheduleTokenRefresh(authTokens.access);
    } else {
      setTokenData(null);
    }
    // eslint-disable-next-line
  }, [authTokens]);

  // Route protection
  useEffect(() => {
    const path = window.location.pathname;
    if (!tokenData && path !== "/login") {
      router.replace("/login");
    }
  }, [tokenData, router]);

  const loginUser = async (username: string, password: string) => {
    setError(null);
    try {
      const response = await axios.post(`${API_HOST}/dash/login/`, {
        email: username,
        password,
      });
      const tokens = response.data;
      localStorage.setItem("authTokens", JSON.stringify(tokens));
      setAuthTokens(tokens);
      setTokenData(jwtDecode(tokens.access));
      scheduleTokenRefresh(tokens.access);
      router.replace("/");
      return true;
    } catch (err: any) {
      setError("Invalid credentials");
      setAuthTokens(null);
      setTokenData(null);
      return false;
    }
  };

  const logoutUser = () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    setAuthTokens(null);
    setTokenData(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        authTokens,
        tokenData,
        user,
        error,
        loginUser,
        logoutUser,
        setAuthTokens,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
