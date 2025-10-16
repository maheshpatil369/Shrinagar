// maheshpatil369/shrinagar/Shrinagar-47183708fc2b865cb6e3d62f63fcad35ec0165db/Frontend1/src/pages/BuyerLayout.tsx
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout, User, verifyToken } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, LoaderCircle, Gem, User as UserIcon, LogOut } from 'lucide-react';

type VerificationStatus = 'verifying' | 'verified' | 'failed';

export default function BuyerLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('verifying');
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      verifyToken(currentUser.token)
        .then(verifiedUser => {
          setUser(verifiedUser);
          setVerificationStatus('verified');
        })
        .catch(() => {
          setVerificationStatus('failed');
          logout(); // Clears local storage and redirects
        });
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
  };

  const StatusIndicator = () => {
    switch (verificationStatus) {
      case 'verified':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><ShieldCheck className="mr-2 h-4 w-4" />Verified</Badge>;
      case 'failed':
        return <Badge variant="destructive"><ShieldAlert className="mr-2 h-4 w-4" />Failed</Badge>;
      default:
        return <Badge variant="secondary"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Verifying...</Badge>;
    }
  };

  if (verificationStatus !== 'verified' || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800 text-center">
          <h1 className="text-3xl font-bold text-destructive">Authentication Issue</h1>
          <p className="text-muted-foreground">Verifying your session or redirecting to login...</p>
          <StatusIndicator />
        </div>
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
          </div>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

