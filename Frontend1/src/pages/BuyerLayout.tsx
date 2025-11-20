// Frontend1/src/pages/BuyerLayout.tsx
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- CORRECTED PATHS ---
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
  Heart        // ⭐ CART ICON ADDED
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// --- UPDATED IMPORT: Use fetchMetalPrice instead of fetchGoldPrice ---
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
// --- END IMPORTS ---

export default function BuyerLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const navigate = useNavigate();

  const { setAuthModalOpen, setPostLoginRedirect } = useAuthModal();

  // --- UPDATED STATE TYPE ---
  const [goldPrice, setGoldPrice] = useState<MetalPriceData | null>(null);
  const [loadingGold, setLoadingGold] = useState(false);
  const [goldError, setGoldError] = useState<string | null>(null);

  const loadGoldPrice = async () => {
    setLoadingGold(true);
    setGoldError(null);
    try {
      // --- UPDATED CALL: Fetch specifically for Gold (XAU) ---
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
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">

          {/* LOGO */}
          <Link to="/buyer" className="flex items-center gap-2 shrink-0">
            <Gem className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">SHRINGAR</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for jewelry, sellers, or categories..."
                className="pl-10 h-9 w-full rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">

            {/* GOLD PRICE */}
            <Popover onOpenChange={(open) => open && !goldPrice && loadGoldPrice()}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="text-amber-500">
                  <TrendingUp className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Gold Price</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none text-amber-500">Live Gold (XAU/INR)</h4>

                  {loadingGold ? (
                    <div className="space-y-1">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : goldError ? (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> {goldError}
                    </p>
                  ) : goldPrice ? (
                    <>
                      {/* Updated to show Rupees symbol since backend returns INR now */}
                      <p className="text-2xl font-bold">₹{(goldPrice.price / 10).toLocaleString('en-IN', { maximumFractionDigits: 0 })}<span className="text-sm font-normal text-muted-foreground ml-1">/10g</span></p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {goldPrice.changePercent !== undefined && (
                          <span
                            className={`font-medium ${
                              goldPrice.changePercent >= 0 ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {goldPrice.changePercent >= 0 ? "+" : ""}
                            {goldPrice.changePercent.toFixed(2)}%
                          </span>
                        )}
                        <span>{formatPriceTimestamp(goldPrice.timestamp)}</span>
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={loadGoldPrice}>
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Price unavailable</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* ⭐ CART ICON → REDIRECT TO PROFILE / WISHLIST */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/profile")}
              className="relative hover:bg-gray-100"
            >
              <Heart className="h-5 w-5 text-black" />
            </Button>

            {/* USER DROPDOWN */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-white text-gray-800 font-bold text-xl shadow-md ring-2 ring-primary/50">
                        {user.name ? user.name[0].toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-64" align="end">
                  <DropdownMenuLabel className="font-normal pt-2 pb-1">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-medium min-w-[70px]">Name:</span>
                        <p className="text-base font-semibold truncate">{user.name}</p>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-medium min-w-[70px]">Email:</span>
                        <p className="text-sm truncate">{user.email}</p>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-medium min-w-[70px]">Role:</span>
                        <p className="text-sm capitalize font-medium">{user.role}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuGroup>
                    <Link to="/profile">
                      <DropdownMenuItem className="cursor-pointer text-base">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>

                    {(user.role === "seller" || user.role === "admin") && (
                      <Link to={`/${user.role}`}>
                        <DropdownMenuItem className="cursor-pointer text-base">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>
                            {user.role === "seller" ? "Seller Dashboard" : "Admin Dashboard"}
                          </span>
                        </DropdownMenuItem>
                      </Link>
                    )}

                    {user.role !== "admin" && (
                      <Link to="/buyer">
                        <DropdownMenuItem className="cursor-pointer text-base">
                          <Gem className="mr-2 h-4 w-4" />
                          <span>Browse Jewelry</span>
                        </DropdownMenuItem>
                      </Link>
                    )}
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(e) => e.preventDefault()}
                        className="cursor-pointer font-semibold bg-destructive text-destructive-foreground justify-center rounded-md"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You will be returned to the landing page.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout}>Confirm Logout</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleLoginClick}
                variant="outline"
                size="sm"
                className="flex text-black border-input hover:bg-gray-100"
              >
                <UserIcon className="h-4 w-4 sm:mr-2 text-black" />
                <span className="hidden sm:inline">Login / Sign Up</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}