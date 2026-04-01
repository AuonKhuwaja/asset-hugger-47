import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Assets from "@/pages/Assets";
import AddAsset from "@/pages/AddAsset";
import Assignments from "@/pages/Assignments";
import Maintenance from "@/pages/Maintenance";
import Billing from "@/pages/Billing";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Categories from "@/pages/Categories";
import Departments from "@/pages/Departments";
import Profile from "@/pages/Profile";
import Companies from "@/pages/Companies";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import SuperAdminLogin from "@/pages/SuperAdminLogin";
import SuperAdminLayout from "@/components/SuperAdminLayout";
import SuperAdminCompanies from "@/pages/SuperAdminCompanies";
import SuperAdminAddCompany from "@/pages/SuperAdminAddCompany";
import SuperAdminEditCompany from "@/pages/SuperAdminEditCompany";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isViewer } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (isViewer) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/assets" element={<ProtectedRoute><AppLayout><Assets /></AppLayout></ProtectedRoute>} />
      <Route path="/assets/add" element={<AdminRoute><AppLayout><AddAsset /></AppLayout></AdminRoute>} />
      <Route path="/categories" element={<ProtectedRoute><AppLayout><Categories /></AppLayout></ProtectedRoute>} />
      <Route path="/assignments" element={<ProtectedRoute><AppLayout><Assignments /></AppLayout></ProtectedRoute>} />
      <Route path="/maintenance" element={<ProtectedRoute><AppLayout><Maintenance /></AppLayout></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><AppLayout><Billing /></AppLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/companies" element={<ProtectedRoute><AppLayout><Companies /></AppLayout></ProtectedRoute>} />

      {/* Super Admin routes — completely separate */}
      <Route path="/super-admin" element={<Navigate to="/super-admin/login" replace />} />
      <Route path="/super-admin/login" element={<SuperAdminLogin />} />
      <Route path="/super-admin" element={<SuperAdminLayout />}>
        <Route path="companies" element={<SuperAdminCompanies />} />
        <Route path="companies/add" element={<SuperAdminAddCompany />} />
        <Route path="companies/:slug/edit" element={<SuperAdminEditCompany />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
