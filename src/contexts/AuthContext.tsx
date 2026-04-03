import { createContext, useContext, useState, ReactNode } from "react";
import { appUsers, companies, type UserRole, type AppUser, type Company } from "@/lib/mock-data";

interface User {
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  department: string;
  assignedCompanies: string[];
  assignedAssets?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isViewer: boolean;
  isEmployee: boolean;
  getVisibleCompanies: () => Company[];
  updateProfile: (data: Partial<Pick<User, "name" | "phone" | "department">>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("tv_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, password: string): boolean => {
    const found = appUsers.find(u => u.email === email && u.password === password);
    if (found) {
      const u: User = {
        email: found.email,
        name: found.name,
        role: found.role,
        phone: found.phone,
        department: found.department,
        assignedCompanies: found.assignedCompanies,
        assignedAssets: found.assignedAssets,
      };
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

  const updateProfile = (data: Partial<Pick<User, "name" | "phone" | "department">>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("tv_user", JSON.stringify(updated));
  };

  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin" || isSuperAdmin;
  const isViewer = user?.role === "viewer";
  const isEmployee = user?.role === "employee";

  const getVisibleCompanies = (): Company[] => {
    if (!user) return [];
    if (isSuperAdmin) return companies;
    return companies.filter(c => user.assignedCompanies.includes(c.id));
  };

  return (
    <AuthContext.Provider value={{
      user, login, logout, isAuthenticated: !!user,
      isSuperAdmin, isAdmin, isViewer, isEmployee,
      getVisibleCompanies, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
