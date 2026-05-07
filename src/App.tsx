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
import Employees from "@/pages/Employees";
import Maintenance from "@/pages/Maintenance";
import Billing from "@/pages/Billing";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Categories from "@/pages/Categories";
import Departments from "@/pages/Departments";
import Profile from "@/pages/Profile";
import Companies from "@/pages/Companies";
import Vendors from "@/pages/Vendors";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/NotFound";
import SuperAdminLayout from "@/components/SuperAdminLayout";
import SuperAdminCompanies from "@/pages/SuperAdminCompanies";
import SuperAdminAddCompany from "@/pages/SuperAdminAddCompany";
import SuperAdminEditCompany from "@/pages/SuperAdminEditCompany";
import SuperAdminCompanyDetails from "@/pages/SuperAdminCompanyDetails";
import MyAssets from "@/pages/MyAssets";
import AssetRequests from "@/pages/AssetRequests";
import MaintenanceRequests from "@/pages/MaintenanceRequests";
import DepreciationTracking from "@/pages/DepreciationTracking";
import DepreciationRun from "@/pages/DepreciationRun";
import DepreciationRunHistory from "@/pages/DepreciationRunHistory";
import MonthlyAssetValueReport from "@/pages/MonthlyAssetValueReport";
import Depreciation from "@/pages/Depreciation";
import UserManagement from "@/pages/UserManagement";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isViewer, isEmployee } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (isViewer || isEmployee) return <Navigate to="/dashboard" replace />;
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
      <Route path="/categories" element={<AdminRoute><AppLayout><Categories /></AppLayout></AdminRoute>} />
      <Route path="/departments" element={<AdminRoute><AppLayout><Departments /></AppLayout></AdminRoute>} />
      <Route path="/assignments" element={<AdminRoute><AppLayout><Assignments /></AppLayout></AdminRoute>} />
      <Route path="/employees" element={<AdminRoute><AppLayout><Employees /></AppLayout></AdminRoute>} />
      <Route path="/maintenance" element={<ProtectedRoute><AppLayout><Maintenance /></AppLayout></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute><AppLayout><Billing /></AppLayout></ProtectedRoute>} />
      <Route path="/billing/depreciation" element={<ProtectedRoute><AppLayout><DepreciationTracking /></AppLayout></ProtectedRoute>} />
      <Route path="/billing/depreciation-run" element={<AdminRoute><AppLayout><DepreciationRun /></AppLayout></AdminRoute>} />
      <Route path="/billing/depreciation-engine" element={<AdminRoute><AppLayout><Depreciation /></AppLayout></AdminRoute>} />
      <Route path="/billing/run-history" element={<ProtectedRoute><AppLayout><DepreciationRunHistory /></AppLayout></ProtectedRoute>} />
      <Route path="/billing/monthly-report" element={<ProtectedRoute><AppLayout><MonthlyAssetValueReport /></AppLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>} />
      <Route path="/users" element={<AdminRoute><AppLayout><UserManagement /></AppLayout></AdminRoute>} />
      <Route path="/companies" element={<ProtectedRoute><AppLayout><Companies /></AppLayout></ProtectedRoute>} />
      <Route path="/vendors" element={<ProtectedRoute><AppLayout><Vendors /></AppLayout></ProtectedRoute>} />

      {/* Employee-specific routes */}
      <Route path="/my-assets" element={<ProtectedRoute><AppLayout><MyAssets /></AppLayout></ProtectedRoute>} />
      <Route path="/asset-requests" element={<ProtectedRoute><AppLayout><AssetRequests /></AppLayout></ProtectedRoute>} />
      <Route path="/maintenance-requests" element={<ProtectedRoute><AppLayout><MaintenanceRequests /></AppLayout></ProtectedRoute>} />

      {/* Super Admin routes — uses unified login at "/" */}
      <Route path="/super-admin/login" element={<Navigate to="/" replace />} />
      <Route path="/super-admin" element={<SuperAdminLayout />}>
        <Route index element={<Navigate to="companies" replace />} />
        <Route path="companies" element={<SuperAdminCompanies />} />
        <Route path="companies/add" element={<SuperAdminAddCompany />} />
        <Route path="companies/:slug" element={<SuperAdminCompanyDetails />} />
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
