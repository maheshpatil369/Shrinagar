// maheshpatil369/shrinagar/Shrinagar-6e22f891610c62129c74fbcf4b4106b1b9c85b42/Frontend1/src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// 1. REMOVE BrowserRouter from this import
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import BuyerDashboard from "@/pages/BuyerDashboard";
import SellerDashboard from "@/pages/SellerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";
import BuyerLayout from "@/pages/BuyerLayout";
import ProductDetailPage from "@/pages/ProductDetailPage";
import UserProfile from "@/pages/UserProfile";
import { getCurrentUser, User } from "@/lib/auth"; // Import User type
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"; // Import LoadingSpinner
import { useState, useEffect } from "react";
// import AuthModal from "@/components/AuthModal"; // <-- REMOVED

const queryClient = new QueryClient();

// --- Updated ProtectedRoute ---
// Now handles role-specific and general login protection
function ProtectedRoute({ allowedRoles }: { allowedRoles?: User['role'][] }) {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const currentUser = getCurrentUser();
    // No need to verify token here again, just check if user info exists
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Checking access..." />;
  }

  // Check if user is logged in
  if (!user) {
    // Redirect them to the /auth page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if specific roles are required and if the user has one of them
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // User is logged in but doesn't have the required role
    // Redirect to a relevant page (e.g., buyer dashboard or landing)
    // Or potentially show a "Not Authorized" component
    console.warn(`User role "${user.role}" not allowed for this route. Allowed: ${allowedRoles.join(', ')}`);
    // Redirect to buyer page as a safe default for unauthorized roles
    return <Navigate to="/buyer" replace />;
  }

  // User is logged in and has the necessary role (or no specific role was required)
  return <Outlet />;
}
// --- End ProtectedRoute ---

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/*
        AuthModal is now rendered in main.tsx
      */}
      {/* <AuthModal /> */} {/* <-- REMOVED */}
      {/* 2. REMOVE BrowserRouter tag from here */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        {/* Buyer-facing routes within Layout */}
        <Route element={<BuyerLayout />}>
          {/* Buyer Dashboard is public */}
          <Route path="/buyer" element={<BuyerDashboard />} />

          {/* Product Detail and Profile require login */}
          <Route element={<ProtectedRoute />}> {/* General login check */}
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* Seller routes require 'seller' or 'admin' role */}
        <Route element={<ProtectedRoute allowedRoles={['seller', 'admin']} />}>
          <Route path="/seller" element={<SellerDashboard />} />
        </Route>

        {/* Admin routes require 'admin' role */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;