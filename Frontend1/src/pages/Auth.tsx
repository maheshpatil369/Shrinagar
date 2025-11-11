// Frontend1/src/pages/Auth.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '@/context/AuthModalContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/**
 * This page is now a "handler" page.
 * If a user ever lands on /auth directly, this component
 * will open the auth modal and redirect them to the home page.
 * This ensures a consistent modal-based login experience.
 */
export default function Auth() {
  const { setAuthModalOpen } = useAuthModal();
  const navigate = useNavigate();

  useEffect(() => {
    // Open the modal
    setAuthModalOpen(true);
    // Redirect to the home page (the modal will appear on top)
    navigate('/', { replace: true });
  }, [setAuthModalOpen, navigate]);

  // Show a loading spinner while redirecting
  return <LoadingSpinner fullScreen message="Loading..." />;
}