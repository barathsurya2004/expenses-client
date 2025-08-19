import axios from "axios";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface UserInfo {
  username: string;
  userId: string;
}

interface AuthContextType {
  token: string | null;
  user: UserInfo | null;
  login: (username: string, password: string) => Promise<UserInfo | null>;
  signup: (
    username: string,
    email: string,
    password: string,
    first_name: string,
    last_name: string
  ) => Promise<void>;
  logout: () => void;
  getUserInfo: () => Promise<UserInfo | null>;
  getToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);

  // Mock server call for login
  const login = async (username: string, password: string) => {
    await axios
      .post("http://localhost:8080/get-user", {
        username,
        password,
      })
      .then((response) => {
        setUser({ username, userId: response.data.user_id });
        setToken(response.data.auth_token);
      })
      .catch((error) => {
        console.error("Login error:", error);
      });
    return user;
  };

  // Mock server call for signup
  const signup = async (
    username: string,
    email: string,
    password: string,
    first_name: string,
    last_name: string
  ) => {
    await axios
      .post("http://localhost:8080/create-user", {
        username,
        email,
        password,
        first_name,
        last_name,
      })
      .then((response) => {
        setUser({ username, userId: response.data.user_id });
        setToken(response.data.auth_token);
      })
      .catch((error) => {
        console.error("Signup error:", error);
      });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const getUserInfo = async () => {
    return user;
  };

  const getToken = async () => {
    if (!token) {
      throw new Error("No token found. Please login first.");
    }
    return token;
  };

  return (
    <AuthContext.Provider
      value={{ token, user, login, signup, logout, getUserInfo, getToken }}
    >
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
