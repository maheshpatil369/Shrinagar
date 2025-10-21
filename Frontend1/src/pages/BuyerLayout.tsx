// maheshpatil369/shrinagar/Shrinagar-5f116f4d15321fb5db89b637c78651e13d353027/Frontend1/src/pages/BuyerLayout.tsx
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout, User, verifyToken } from "@/lib/auth";
import { Gem, User as UserIcon, LogOut, LoaderCircle } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"

export default function BuyerLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
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
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/auth');
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
                <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {user.name}!</span>
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
                        You will be returned to the login page.
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
        <Outlet />
      </main>
    </div>
  );
}

