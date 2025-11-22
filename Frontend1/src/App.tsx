import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { getCurrentUser, User } from "@/lib/auth";

// Pages
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import BuyerDashboard from "@/pages/BuyerDashboard";
import SellerDashboard from "@/pages/SellerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";
import BuyerLayout from "@/pages/BuyerLayout";
import ProductDetailPage from "@/pages/ProductDetailPage";
import UserProfile from "@/pages/UserProfile";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const queryClient = new QueryClient();

// --- Protected Route Component ---
function ProtectedRoute({ allowedRoles }: { allowedRoles?: User['role'][] }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Checking access..." />;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Default redirect for unauthorized users
    return <Navigate to="/buyer" replace />;
  }

  return <Outlet />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      
      {/* Router logic starts here. BrowserRouter is already in main.tsx */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        {/* Buyer Routes (Wrapped in Layout) */}
        <Route element={<BuyerLayout />}>
          <Route path="/buyer" element={<BuyerDashboard />} />
          
          {/* Protected Buyer Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Seller Routes */}
        <Route element={<ProtectedRoute allowedRoles={['seller', 'admin']} />}>
          <Route path="/seller" element={<SellerDashboard />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;