// Frontend1/src/pages/BuyerLayout.tsx
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // ADDED: Input component for search bar
// --- CORRECTED PATHS ---
import { getCurrentUser, logout, User, verifyToken } from "../lib/auth";
import { Gem, User as UserIcon, LogOut, LoaderCircle, TrendingUp, AlertCircle, RefreshCw, LayoutDashboard, Search } from 'lucide-react'; // ADDED: Search icon
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
import { fetchGoldPrice, GoldPriceData } from "../lib/gold";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';
import { useAuthModal } from "../context/AuthModalContext";
// --- NEW IMPORTS for Profile Dropdown ---
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
// --- END NEW IMPORTS ---
// --- END CORRECTED PATHS ---

export default function BuyerLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const navigate = useNavigate();

  // Get modal controls
  const { setAuthModalOpen, setPostLoginRedirect } = useAuthModal();

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
      // Format the timestamp to show time and date
      return format(new Date(timestamp * 1000), 'p, MMM d');
  }

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      // Verify token on layout load to ensure it's still valid
      verifyToken(currentUser.token)
        .then(verifiedUser => {
          setUser(verifiedUser);
        })
        .catch(() => {
          logout(); 
          setUser(null);
        })
        .finally(() => {
            setIsLoadingUser(false);
        });
    } else {
      setIsLoadingUser(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/'); // Redirect to landing page after logout
    window.location.reload(); // Force reload to clear all state
  };
  
  // Handler to open modal for login/signup
  const handleLoginClick = () => {
    setPostLoginRedirect(null); // No specific redirect, just open the modal
    setAuthModalOpen(true);
  };
  
  // We still show a loading state, but not full screen
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
            <Link to="/buyer" className="flex items-center gap-2 shrink-0"> {/* Added shrink-0 */}
                <Gem className="h-6 w-6 text-primary" />
                {/* Updated the website name to SHRINGAR as requested */}
                <span className="font-bold text-xl hidden sm:inline">SHRINGAR</span>
            </Link>
            
            {/* --- RESTORED: Central Search/Filter Bar --- */}
            <div className="flex-1 max-w-lg mx-4 hidden md:block"> {/* Hidden on small screens, centered and max-width on larger screens */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        type="text" 
                        placeholder="Search for jewelry, sellers, or categories..." 
                        className="pl-10 h-9 w-full rounded-full" 
                    />
                </div>
            </div>
            {/* --- END SEARCH BAR --- */}

          <div className="flex items-center gap-2 sm:gap-4 shrink-0"> {/* Added shrink-0 */}
            {/* Gold Price Popover */}
            <Popover onOpenChange={(open) => { if (open && !goldPrice) loadGoldPrice(); }}>
                <PopoverTrigger asChild>
                     <Button variant="ghost" size="sm" className="text-amber-500 hover:bg-amber-500/10 hover:hover:text-amber-400">
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

            {user ? (
                // --- LOGGED-IN PROFILE DROPDOWN MENU ---
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        {/* Use Avatar component as the trigger */}
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10 cursor-pointer">
                                {/* Applied custom styling: white background, shadow, and dark text for the initial letter */}
                                <AvatarFallback className="bg-white text-gray-800 font-bold text-xl shadow-md ring-2 ring-primary/50">
                                    {/* Use first letter of name, or 'U' if name is missing */}
                                    {user.name ? user.name[0].toUpperCase() : 'U'}
                                </AvatarFallback>
                            </Avatar>
                            <span className="sr-only">Profile Menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64" align="end" forceMount> {/* Increased width */}
                        {/* User Name and Email Label */}
                        <DropdownMenuLabel className="font-normal pt-2 pb-1">
                            <div className="flex flex-col space-y-1">
                                {/* Name with explicit label */}
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-medium text-black min-w-[70px]">Name:</span>
                                    <p className="text-base font-semibold leading-none truncate text-black">{user.name}</p>
                                </div>
                                {/* Email with explicit label */}
                                <div className="flex items-baseline gap-1">
                                    <span className="text-sm font-medium text-black min-w-[70px]">Email:</span>
                                    <p className="text-sm leading-none truncate mt-0 text-black">{user.email}</p>
                                </div>
                                {/* Role with explicit label */}
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-sm font-medium text-black min-w-[70px]">Role:</span>
                                    <p className="text-sm leading-none font-medium capitalize text-black">{user.role}</p>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        <DropdownMenuGroup>
                            {/* Profile Link */}
                            <Link to="/profile">
                                <DropdownMenuItem className="cursor-pointer text-base"> {/* Increased font size */}
                                    <UserIcon className="mr-2 h-4 w-4 text-black" />
                                    <span className="text-black">Profile</span>
                                </DropdownMenuItem>
                            </Link>

                            {/* Role-based Dashboard Link */}
                            {(user.role === 'seller' || user.role === 'admin') && (
                                <Link to={`/${user.role}`}>
                                    <DropdownMenuItem className="cursor-pointer text-base"> {/* Increased font size */}
                                        <LayoutDashboard className="mr-2 h-4 w-4 text-black" />
                                        <span className="text-black">{user.role === 'seller' ? 'Seller Dashboard' : 'Admin Dashboard'}</span>
                                    </DropdownMenuItem>
                                </Link>
                            )}
                            {/* Always show Buyer Dashboard link for users who aren't exclusively admins */}
                            {user.role !== 'admin' && (
                                <Link to="/buyer">
                                    <DropdownMenuItem className="cursor-pointer text-base"> {/* Increased font size */}
                                        <Gem className="mr-2 h-4 w-4 text-black" />
                                        <span className="text-black">Browse Jewelry</span>
                                    </DropdownMenuItem>
                                </Link>
                            )}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />

                        {/* Logout Option with AlertDialog Confirmation - Styled as a destructive button */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                {/* This is the red logout button styling */}
                                <DropdownMenuItem 
                                    onSelect={(e) => e.preventDefault()} 
                                    className="cursor-pointer font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground mt-1 mb-1 justify-center rounded-md"
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
                // --- LOGGED-OUT UI (Opens AuthModal) ---
                <>
                    {/* Logged-Out Button: Using 'outline' variant for white background/border. Forcing black text/icon color */}
                    <Button 
                        onClick={handleLoginClick} 
                        variant="outline" 
                        size="sm" 
                        className="flex text-black border-input hover:bg-gray-100 hover:text-black" // Override text/hover styles
                    >
                        <UserIcon className="h-4 w-4 sm:mr-2 text-black" />
                        <span className="hidden sm:inline">Login / Sign Up</span> 
                    </Button>
                </>
            )}
          </div>
        </div>
      </header>
      <main>
        <Outlet /> {/* Renders the specific buyer page */}
      </main>
    </div>
  );
}