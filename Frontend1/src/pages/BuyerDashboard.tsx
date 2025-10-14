// /Frontend1/src/pages/BuyerDashboard.tsx
// This file has been corrected to use the proper path alias for imports.

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout, User } from "@/lib/auth"; // Corrected import path
import { useNavigate } from "react-router-dom";

export default function BuyerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      // If no user, redirect to login
      navigate('/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    // Render nothing or a loading spinner while checking auth state
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          Buyer Dashboard
        </h1>
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

