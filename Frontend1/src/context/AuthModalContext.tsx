// Frontend1/src/context/AuthModalContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AuthModalContextType {
  isAuthModalOpen: boolean;
  setAuthModalOpen: (isOpen: boolean) => void;
  // This state will help us redirect the user after a successful login
  // from the modal.
  postLoginRedirect: string | null;
  setPostLoginRedirect: (path: string | null) => void;
}

// Create the context with a default undefined value
const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

// Create the provider component
export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [postLoginRedirect, setPostLoginRedirect] = useState<string | null>(null);

  return (
    <AuthModalContext.Provider
      value={{
        isAuthModalOpen,
        setAuthModalOpen,
        postLoginRedirect,
        setPostLoginRedirect,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
};

// Create a custom hook for easy consumption of the context
export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};