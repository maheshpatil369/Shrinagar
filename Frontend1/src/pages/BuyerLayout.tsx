// maheshpatil369/shrinagar/Shrinagar-ec6ca96d478d060fcb4be15266db4b0ee9642b37/Frontend1/src/pages/BuyerLayout.tsx
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout, User, verifyToken } from "@/lib/auth";
import { Gem, User as UserIcon, LogOut, LoaderCircle } from 'lucide-react';

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
          // Token is invalid, so clear it but don't redirect
          logout();
          setUser(null);
        })
        .finally(() => {
            setIsLoadingUser(false);
        });
    } else {
      // No user is logged in, proceed as a guest
      setIsLoadingUser(false);
    }
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null); // Update state immediately
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
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
            <Link to="/buyer" className="flex items-center gap-2">
                <Gem className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">Shrinagar</span>
            </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {user.name}!</span>
                <Link to="/profile">
                    <Button variant="ghost" size="icon">
                        <UserIcon className="h-5 w-5" />
                        <span className="sr-only">Profile</span>
                    </Button>
                </Link>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
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

