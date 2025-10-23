// Frontend1/src/pages/BuyerLayout.tsx
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout, User, verifyToken } from "@/lib/auth";
import { Gem, User as UserIcon, LogOut, LoaderCircle, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'; // Import icons
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
} from "@/components/ui/popover"; // Import Popover
import { fetchGoldPrice, GoldPriceData } from "@/lib/gold"; // Import gold API
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { format } from 'date-fns'; // For formatting timestamp

export default function BuyerLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const navigate = useNavigate();

  // State for gold price popover
  const [goldPrice, setGoldPrice] = useState<GoldPriceData | null>(null);
  const [loadingGold, setLoadingGold] = useState(false);
  const [goldError, setGoldError] = useState<string | null>(null);

  const loadGoldPrice = async () => {
      setLoadingGold(true);
      setGoldError(null);
      try {
          const data = await fetchGoldPrice();
          setGoldPrice(data);
      } catch (err) {
          setGoldError("Failed to load");
          console.error(err);
      } finally {
          setLoadingGold(false);
      }
  };

  const formatPriceTimestamp = (timestamp: number | undefined) => {
      if (!timestamp) return 'N/A';
      return format(new Date(timestamp * 1000), 'p, MMM d');
  }

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      verifyToken(currentUser.token)
        .then(verifiedUser => {
          setUser(verifiedUser);
        })
        .catch(() => {
          logout(); // Log out if token is invalid
          setUser(null);
          navigate('/auth'); // Redirect to login if token invalid
        })
        .finally(() => {
            setIsLoadingUser(false);
        });
    } else {
      setIsLoadingUser(false);
       // Optional: redirect guests if BuyerLayout should always require login
       // navigate('/auth');
    }
  }, [navigate]); // Added navigate dependency

  const handleLogout = () => {
    logout();
    setUser(null); // Clear user state immediately
    navigate('/'); // Redirect to landing page after logout
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
            <Link to="/buyer" className="flex items-center gap-2">
                <Gem className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl hidden sm:inline">Shrinagar</span>
            </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <>
                {/* --- Gold Price Popover Trigger --- */}
                <Popover onOpenChange={(open) => { if (open && !goldPrice) loadGoldPrice(); }}>
                    <PopoverTrigger asChild>
                         <Button variant="ghost" size="sm" className="text-amber-500 hover:bg-amber-500/10 hover:text-amber-400">
                           <TrendingUp className="h-4 w-4 mr-1 sm:mr-2" />
                           <span className="hidden sm:inline">Gold Price</span>
                         </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none text-amber-500">Live Gold (XAU/USD)</h4>
                             {loadingGold ? (
                                <div className="space-y-1">
                                    <Skeleton className="h-6 w-24" />
                                    <Skeleton className="h-4 w-full" />
                                </div>
                              ) : goldError ? (
                                <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="h-4 w-4"/> {goldError}</p>
                              ) : goldPrice ? (
                                <>
                                    <p className="text-2xl font-bold">${goldPrice.price.toFixed(2)}</p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        {goldPrice.changePercent !== undefined && (
                                            <span className={`font-medium ${goldPrice.changePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {goldPrice.changePercent >= 0 ? '+' : ''}{goldPrice.changePercent.toFixed(2)}%
                                            </span>
                                        )}
                                        <span>{formatPriceTimestamp(goldPrice.timestamp)}</span>
                                        <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-foreground -mr-2" onClick={loadGoldPrice} title="Refresh Price">
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
                 {/* --- End Gold Price Popover --- */}

                <span className="text-sm text-muted-foreground hidden lg:inline">Welcome, {user.name}!</span>
                <Link to="/profile">
                    <Button variant="ghost" size="icon">
                        <UserIcon className="h-5 w-5" />
                        <span className="sr-only">Profile</span>
                    </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <LogOut className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Logout</span>
                    </Button>
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
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/auth')} variant="outline" size="sm">
                  Login
                </Button>
                 <Button onClick={() => navigate('/auth')} size="sm">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet /> {/* Renders the specific buyer page (Dashboard, Product Detail, etc.) */}
      </main>
       {/* Optional Footer */}
       {/* <footer className="border-t mt-12 py-6">
           <div className="container mx-auto text-center text-sm text-muted-foreground">
               © {new Date().getFullYear()} Shrinagar Marketplace. All rights reserved.
           </div>
       </footer> */}
    </div>
  );
}
