// maheshpatil369/shrinagar/Shrinagar-fec0a47de051ffa389da59e3900a2428b5397e43/Frontend1/src/pages/BuyerDashboard.tsx
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { getCurrentUser, logout, User, verifyToken } from "../lib/auth";
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { ShieldCheck, ShieldAlert, LoaderCircle } from 'lucide-react';

type VerificationStatus = 'verifying' | 'verified' | 'failed';

export default function BuyerDashboard() {
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
          setTimeout(() => navigate('/auth'), 2000);
        });
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const StatusIndicator = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Token Verified
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <ShieldAlert className="mr-2 h-4 w-4" />
            Token Invalid
          </Badge>
        );
      case 'verifying':
      default:
        return (
          <Badge variant="secondary">
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Verifying Token...
          </Badge>
        );
    }
  };

  if (verificationStatus === 'verifying') {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <LoaderCircle className="h-12 w-12 animate-spin text-gray-500" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Verifying authentication...</p>
        </div>
    );
  }
  
  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800 text-center">
                 <h1 className="text-3xl font-bold text-destructive">Authentication Failed</h1>
                 <p className="text-muted-foreground">Your session is invalid or has expired. Redirecting to login...</p>
                 <StatusIndicator />
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
         <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Buyer Dashboard
            </h1>
            <StatusIndicator />
        </div>
        <p className="text-center text-gray-600 dark:text-gray-300">
          Welcome, {user.name}!
        </p>
        <div className="flex justify-center">
          <Button onClick={handleLogout} variant="destructive">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

