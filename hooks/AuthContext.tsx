import React, { createContext, ReactNode, useContext, useState } from 'react';

interface UserInfo {
  username: string;
  email: string;
}

interface AuthContextType {
  token: string | null;
  user: UserInfo | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  getUserInfo: () => Promise<UserInfo | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);

  // Mock server call for login
  const login = async (username: string, password: string) => {
    // Simulate server response
    await new Promise(res => setTimeout(res, 500));
    setToken('mock-server-token');
    setUser({ username, email: `${username}@example.com` });
  };

  // Mock server call for signup
  const signup = async (username: string, email: string, password: string) => {
    await new Promise(res => setTimeout(res, 500));
    setToken('mock-server-token');
    setUser({ username, email });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // Mock getUserInfo
  const getUserInfo = async () => {
    await new Promise(res => setTimeout(res, 200));
    return user;
  };

  return (
    <AuthContext.Provider value={{ token, user, login, signup, logout, getUserInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
