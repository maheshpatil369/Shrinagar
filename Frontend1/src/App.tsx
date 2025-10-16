// maheshpatil369/shrinagar/Shrinagar-47183708fc2b865cb6e3d62f63fcad35ec0165db/Frontend1/src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import BuyerLayout from "./pages/BuyerLayout";
import ProductDetailPage from "./pages/ProductDetailPage";
import UserProfile from "./pages/UserProfile";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* Buyer-facing routes */}
          <Route element={<BuyerLayout />}>
            <Route path="/buyer" element={<BuyerDashboard />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/profile" element={<UserProfile />} />
          </Route>
          
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

