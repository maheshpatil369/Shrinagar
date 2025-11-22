import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getCurrentUser, logout, User, verifyToken } from "../lib/auth";
import { 
  Gem, 
  User as UserIcon, 
  LogOut, 
  LoaderCircle, 
  TrendingUp, 
  AlertCircle, 
  RefreshCw, 
  LayoutDashboard, 
  Search,
  Heart        // ⭐ CART/WISHLIST ICON
} from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { fetchMetalPrice, MetalPriceData } from "../lib/gold"; 
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { useAuthModal } from "../context/AuthModalContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// --- FIX: Point to the correct location in components folder ---
import ThreeDBackground from "@/components/ThreeDBackground"; 

export default function BuyerLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const navigate = useNavigate();
  const { setAuthModalOpen, setPostLoginRedirect } = useAuthModal();

  const [goldPrice, setGoldPrice] = useState<MetalPriceData | null>(null);
  const [loadingGold, setLoadingGold] = useState(false);
  const [goldError, setGoldError] = useState<string | null>(null);

  const loadGoldPrice = async () => {
    setLoadingGold(true);
    setGoldError(null);
    try {
      const data = await fetchMetalPrice('XAU');
      setGoldPrice(data);
    } catch {
      setGoldError("Failed to load");
    } finally {
      setLoadingGold(false);
    }
  };

  const formatPriceTimestamp = (timestamp: number | undefined) => {
    if (!timestamp) return "N/A";
    return format(new Date(timestamp * 1000), "p, MMM d");
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      verifyToken(currentUser.token)
        .then(verifiedUser => setUser(verifiedUser))
        .catch(() => {
          logout();
          setUser(null);
        })
        .finally(() => setIsLoadingUser(false));
    } else {
      setIsLoadingUser(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/");
    window.location.reload();
  };

  const handleLoginClick = () => {
    setPostLoginRedirect(null);
    setAuthModalOpen(true);
  };

  if (isLoadingUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#020817]">
        <LoaderCircle className="h-12 w-12 animate-spin text-yellow-400" />
      </div>
    );
  }

  return (
    // The Layout provides the base background
    <div className="min-h-screen bg-[#020817] text-white relative">
      
      {/* --- 3D BACKGROUND LAYER --- */}
      {/* Fixed positioning ensures it covers the screen behind content */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ThreeDBackground />
      </div>

      {/* --- MAIN CONTENT LAYER --- */}
      {/* Relative z-10 ensures content sits ABOVE the background */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* LOGOUT DIALOG */}
        <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <AlertDialogContent className="bg-[#051024] border border-white/10 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
              <AlertDialogDescription className="text-white/60">
                You will be returned to the landing page.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/10 hover:bg-white/20 border-none text-white">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">Confirm Logout</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* HEADER - With transparent/blur background so 3D bg shows through */}
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#020817]/80 backdrop-blur-xl shadow-lg">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-10">

            {/* LOGO */}
            <Link to="/buyer" className="flex items-center gap-2 shrink-0">
              <Gem className="h-6 w-6 text-yellow-400 drop-shadow" />
              <span className="font-semibold tracking-wider text-lg text-white">SHRINGAR</span>
            </Link>

            {/* SEARCH BAR */}
            <div className="flex-1 max-w-lg mx-6 hidden md:block">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search jewelry, sellers, categories..."
                  className="pl-11 h-10 w-full rounded-full bg-white/10 border-white/20 text-white placeholder-white/50 focus-visible:ring-yellow-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">

              {/* GOLD PRICE BUTTON */}
              <Popover onOpenChange={(open) => open && !goldPrice && loadGoldPrice()}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-yellow-400 hover:bg-white/10 rounded-full px-3"
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Gold Price</span>
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-72 p-4 bg-[#071324] text-white border border-white/10 rounded-xl shadow-lg">
                  <div className="space-y-2">
                    <h4 className="font-medium text-yellow-400 leading-none">Live Gold (XAU/INR)</h4>

                    {loadingGold ? (
                      <div className="space-y-1">
                        <Skeleton className="h-6 w-24 bg-white/10" />
                        <Skeleton className="h-4 w-full bg-white/10" />
                      </div>
                    ) : goldError ? (
                      <p className="text-sm text-red-500 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" /> {goldError}
                      </p>
                    ) : goldPrice ? (
                      <>
                        <p className="text-3xl font-semibold text-white">
                          ₹{(goldPrice.price / 10).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          <span className="text-sm font-normal text-white/60 ml-1">/10g</span>
                        </p>

                        <div className="flex items-center justify-between text-xs text-white/50">
                          <span
                            className={
                              goldPrice.changePercent >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }
                          >
                            {goldPrice.changePercent >= 0 ? "+" : ""}
                            {goldPrice.changePercent.toFixed(2)}%
                          </span>

                          <span>{formatPriceTimestamp(goldPrice.timestamp)}</span>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-white/10 text-white"
                            onClick={loadGoldPrice}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-white/60">Price unavailable</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* WISHLIST ICON */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/profile")}
                className="hover:bg-white/10 rounded-full text-white"
              >
                <Heart className="h-5 w-5" />
              </Button>

              {/* USER DROPDOWN */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-white/10">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-yellow-400 text-black font-bold shadow ring-2 ring-yellow-300">
                          {user.name ? user.name[0].toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>

        <DropdownMenuContent
  className="w-72 bg-[#0e1b33] text-white p-0 rounded-xl border border-white/10 shadow-2xl mt-2"
  align="end"
>
  {/* Header Section */}
  <div className="px-4 py-4 border-b border-white/10 bg-[#051024]/70 rounded-t-xl">
    <p className="text-sm text-gray-300">
      <span className="font-semibold text-brand-yellow">Name:</span> {user.name}
    </p>
    <p className="text-sm text-gray-300 mt-1">
      <span className="font-semibold text-brand-yellow">Gmail:</span> {user.email}
    </p>
    <p className="text-sm text-gray-300 mt-1">
      <span className="font-semibold text-brand-yellow">Role:</span> {user.role}
    </p>
  </div>

  {/* List Items */}
  <div className="p-2 space-y-1">

    <DropdownMenuItem
      className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 cursor-pointer"
      onClick={() => navigate('/profile')}
    >
      <UserIcon className="h-4 w-4 text-brand-yellow" /> Profile
    </DropdownMenuItem>

    {user.role !== "admin" && (
      <DropdownMenuItem
        className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 cursor-pointer"
        onClick={() => navigate('/buyer')}
      >
        <Gem className="h-4 w-4 text-brand-yellow" /> Browse Jewelry
      </DropdownMenuItem>
    )}

    {(user.role === "seller" || user.role === "admin") && (
      <DropdownMenuItem
        className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 cursor-pointer"
        onClick={() => navigate(`/${user.role}`)}
      >
        <LayoutDashboard className="h-4 w-4 text-brand-yellow" />
        {user.role === "seller" ? "Seller Dashboard" : "Admin Dashboard"}
      </DropdownMenuItem>
    )}
  </div>

  {/* Logout Button */}
  <div className="p-3 border-t border-white/10">
    <Button
      onClick={() => setIsLogoutDialogOpen(true)}
      className="w-full bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white font-semibold h-10 rounded-lg border border-red-500/50"
    >
      <LogOut className="h-4 w-4 mr-2" /> Log Out
    </Button>
  </div>
</DropdownMenuContent>

                </DropdownMenu>
              ) : (
                <Button
                  onClick={handleLoginClick}
                  variant="outline"
                  size="sm"
                  className="text-white border-white/20 hover:bg-white/10 rounded-full px-4 bg-transparent"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Login / Sign Up
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="pt-4 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}