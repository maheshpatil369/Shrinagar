// /Frontend1/src/pages/AdminDashboard.tsx
// This file has been updated to verify the token on load and display the status.

import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { getCurrentUser, logout, User, verifyToken } from "../lib/auth"; // Corrected import path
import { useNavigate } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { ShieldCheck, ShieldAlert, LoaderCircle } from "lucide-react";

type VerificationStatus = 'verifying' | 'verified' | 'failed';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('verifying');
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
      verifyToken(currentUser.token)
        .then(verifiedUser => {
          setUser(verifiedUser);
          setVerificationStatus('verified');
        })
        .catch(() => {
          setVerificationStatus('failed');
          // Automatically redirect to login after 2 seconds on failure
          setTimeout(() => navigate('/auth'), 2000);
        });
    } else {
      // If no user is found in storage, or user is not an admin, redirect to login
      navigate('/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
  };
  
  // A component to render the current verification status
  const StatusIndicator = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green -600">
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


  // Display a loading screen while the token is being verified
  if (verificationStatus === 'verifying') {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <LoaderCircle className="h-12 w-12 animate-spin text-gray-500" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Verifying authentication...</p>
        </div>
    );
  }
  
  // Display an error and redirect message if verification fails or there's no user
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

  // Render the full dashboard if the user and token are verified
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex justify-between items-start">
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Admin Dashboard
            </h1>
            <StatusIndicator />
        </div>
        <p className="text-center text-gray-600 dark:text-gray-300 pt-4">
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

