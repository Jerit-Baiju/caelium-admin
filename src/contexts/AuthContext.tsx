'use client';

import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { ReactNode, Suspense, createContext, useEffect, useState } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  avatar?: string;
}

interface ErrorObject {
  [key: string]: string;
}

interface AuthContextProps {
  tokenData?: any;
  authTokens: any;
  error: ErrorObject;
  loginUser: (e: any) => Promise<void>;
  logoutUser: () => void;
  setTokenData: (e: any) => void;
  setAuthTokens: (e: any) => void;
  user: any;
}

const AuthContext = createContext<AuthContextProps>({
  tokenData: {},
  authTokens: {},
  error: {},
  loginUser: async () => {},
  logoutUser: () => {},
  setTokenData: () => {},
  setAuthTokens: () => {},
  user: {},
});

export default AuthContext;
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  let [loading, setLoading] = useState(true);
  let [error, setError] = useState({});
  let [user, setUser] = useState<User | null>(null);
  let [authTokens, setAuthTokens] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens') || '{}') : null
  );

  let [tokenData, setTokenData] = useState(() =>
    typeof window !== 'undefined' && localStorage.getItem('authTokens') ? jwtDecode(localStorage.getItem('authTokens') || '{}') : null
  );

  useEffect(() => {
    if (!tokenData) {
      router.replace('/accounts/login');
    }
  }, [router, tokenData, loading]);


  let loginUser = async (data: any) => {
    localStorage.setItem('authTokens', JSON.stringify(data));
    setAuthTokens(data);
    setTokenData(jwtDecode(data?.access));
    router.push('/');
  };

  let logoutUser = () => {
    setAuthTokens(null);
    setTokenData(null);
    localStorage.removeItem('authTokens');
    router.push('/accounts/login');
  };

  useEffect(() => {
    if (authTokens?.access) {
      setTokenData(jwtDecode(authTokens.access));
    }
    setLoading(false);
  }, [authTokens, loading]);

  let contextData: AuthContextProps = {
    tokenData,
    authTokens,
    error,
    loginUser,
    logoutUser,
    setTokenData,
    setAuthTokens,
    user,
  };

  return <AuthContext.Provider value={contextData}>{loading ? <Suspense /> : children}</AuthContext.Provider>;
};
