import { createContext, useContext, useState, ReactNode } from "react";

interface User {
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Hardcoded test user
const TEST_USER = { email: "admin@trackvault.com", password: "admin123", name: "Admin User" };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("tv_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, password: string): boolean => {
    if (email === TEST_USER.email && password === TEST_USER.password) {
      const u = { email: TEST_USER.email, name: TEST_USER.name };
      setUser(u);
      localStorage.setItem("tv_user", JSON.stringify(u));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tv_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
