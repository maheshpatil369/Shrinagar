// Frontend1/src/context/UserContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { getCurrentUser, verifyToken, logout, User } from '@/lib/auth'; // Corrected path

interface UserContextType {
  user: User | null;
  isLoadingUser: boolean;
  loginUser: (user: User) => void;
  logoutUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    // Check for user on initial app load
    const currentUser = getCurrentUser();
    if (currentUser) {
      // Verify token to ensure it's still valid
      verifyToken(currentUser.token)
        .then(verifiedUser => {
          setUser(verifiedUser);
        })
        .catch(() => {
          // Token is invalid or expired
          logout(); // Clear the bad token from localStorage
          setUser(null);
        })
        .finally(() => {
          setIsLoadingUser(false);
        });
    } else {
      setIsLoadingUser(false);
    }
  }, []);

  const loginUser = (user: User) => {
    localStorage.setItem('userInfo', JSON.stringify(user));
    setUser(user);
  };

  const logoutUser = () => {
    logout(); // Clears localStorage
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoadingUser,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};