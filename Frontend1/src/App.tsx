// Frontend1/src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import BuyerLayout from "./pages/BuyerLayout";
import ProductDetailPage from "./pages/ProductDetailPage";
import UserProfile from "./pages/UserProfile";
import { getCurrentUser, User, verifyToken } from "./lib/auth";
import { LoaderCircle } from "lucide-react";

const queryClient = new QueryClient();

// Higher-Order Component for protecting routes based on role
function ProtectedRoute({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser.token) {
        try {
          const verifiedUser = await verifyToken(currentUser.token);
          setUser(verifiedUser);
        } catch (error) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect them to the /auth page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/auth" replace />;
  }

  return children;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* Buyer-facing routes (also accessible to logged-out users via BuyerLayout checks) */}
          <Route element={<BuyerLayout />}>
            <Route path="/buyer" element={<BuyerDashboard />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
                <UserProfile />
              </ProtectedRoute>
            } />
          </Route>

          {/* Seller Route */}
          <Route path="/seller" element={
            <ProtectedRoute allowedRoles={['seller', 'admin']}>
              <SellerDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Route */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
