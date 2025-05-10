"use client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useEffect, useRef, useState } from "react";

interface AuthTokens {
  access: string;
  refresh: string;
}

// TokenData interface to replace any type
interface TokenData {
  exp: number;
  user_id: number;
  email: string;
  is_staff: boolean;
  // Add other fields that might be in the JWT payload
  [key: string]: unknown;
}

// User interface to replace any type
interface User {
  id: number;
  email: string;
  name?: string;
  avatar?: string; // Adding avatar property explicitly
  // Add other user properties as needed
  [key: string]: unknown;
}

interface AuthContextProps {
  authTokens: AuthTokens | null;
  tokenData: TokenData | null;
  user: User | null;
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
  const [tokenData, setTokenData] = useState<TokenData | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("authTokens");
      return stored ? jwtDecode(JSON.parse(stored).access) : null;
    }
    return null;
  });
  const [user, setUser] = useState<User | null>(null);
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
    } catch (error) {
      console.log("Token refresh failed", error);
      logoutUser();
      return null;
    }
  };

  // Schedule token refresh 5 minutes before expiry
  const scheduleTokenRefresh = (accessToken: string) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    try {
      const decoded: TokenData = jwtDecode(accessToken);
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

  // Fetch user data when tokens are available
  useEffect(() => {
    const fetchMe = async () => {
      try {
        if (!authTokens?.access) return;

        const decodedToken = jwtDecode(authTokens.access) as { user_id: number };
        if (!decodedToken.user_id) return;

        const response = await fetch(`${API_HOST}/api/auth/accounts/${decodedToken.user_id}/`);

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        logoutUser();
      }
    };

    if (authTokens) {
      fetchMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    } catch (error) {
      setError("Invalid credentials");
      console.log("Login failed", error);
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
