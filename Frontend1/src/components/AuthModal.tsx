// Frontend1/src/components/AuthModal.tsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { login, signup } from '../lib/auth'; // Using relative path
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Terminal, Gem, Mail, Lock, User as UserIcon, LoaderCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthModal } from '../context/AuthModalContext'; // Using relative path
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';

export default function AuthModal() {
  const [isSignUp, setIsSignUp] = useState(false);

  // Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'customer' | 'seller'>('customer');

  // Loading and Error States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Use the global modal state
  const { isAuthModalOpen, setAuthModalOpen, postLoginRedirect, setPostLoginRedirect } = useAuthModal();

  const from = postLoginRedirect || location.state?.from?.pathname || null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const user = await login({ email: loginEmail, password: loginPassword });
      localStorage.setItem('userInfo', JSON.stringify(user));

      // Close modal and redirect
      setAuthModalOpen(false);
      setPostLoginRedirect(null); // Clear the redirect path

      // Redirect logic
      if (from) {
        navigate(from, { replace: true });
      } else {
        switch (user.role) {
          case 'admin': navigate('/admin'); break;
          case 'seller': navigate('/seller'); break;
          default: navigate('/buyer'); break;
        }
      }
      window.location.reload(); // Reload to update user state across app

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const user = await signup({ name: signupName, email: signupEmail, password: signupPassword, role: signupRole });
      localStorage.setItem('userInfo', JSON.stringify(user));

      // Close modal and redirect
      setAuthModalOpen(false);
      setPostLoginRedirect(null); // Clear the redirect path

      // Redirect logic after signup
      if (from) {
        navigate(from, { replace: true });
      } else {
        switch (user.role) {
          case 'seller': navigate('/seller'); break;
          default: navigate('/buyer'); break;
        }
      }
      window.location.reload(); // Reload to update user state across app

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset errors when switching between login/signup
  const toggleAuthMode = (e: React.MouseEvent<HTMLButtonElement>, mode: 'login' | 'signup') => {
    e.preventDefault();
    setError(null);
    setIsSignUp(mode === 'signup');
  };

  // Reset form state when modal closes
  const handleOnOpenChange = (open: boolean) => {
    if (!open) {
      setLoginEmail('');
      setLoginPassword('');
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupRole('customer');
      setError(null);
      setIsLoading(false);
      setIsSignUp(false);
      // Reset password visibility on close
      setShowPassword(false);
      // It's important to clear any pending redirect if the user closes the modal
      setPostLoginRedirect(null); 
    }
    setAuthModalOpen(open);
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleOnOpenChange}>
      {/* Added animation classes for slide-in/out */}
      <DialogContent 
        className="sm:max-w-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-8 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-8 duration-300"
      >
        {isSignUp ? (
          <>
            {/* --- SIGN UP FORM --- */}
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center">
                <Gem className="h-6 w-6 mr-2 text-pink-500" /> Create Account
              </DialogTitle>
              <DialogDescription>
                Sign up to discover exquisite jewelry or become a seller.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Signup Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="modal-signup-name" placeholder="Name" required value={signupName} onChange={(e) => setSignupName(e.target.value)} disabled={isLoading} className="pl-9" />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="modal-signup-email" type="email" placeholder="Email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} disabled={isLoading} className="pl-9" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {/* Updated password field with type toggle and icon */}
                <Input 
                  id="modal-signup-password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Password" 
                  required 
                  value={signupPassword} 
                  onChange={(e) => setSignupPassword(e.target.value)} 
                  disabled={isLoading} 
                  className="pl-9 pr-10" 
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="grid gap-2 text-sm">
                <Label className="text-muted-foreground">Register as a:</Label>
                <RadioGroup value={signupRole} onValueChange={(value) => setSignupRole(value as 'customer' | 'seller')} className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="customer" id="modal-role-customer" /><Label htmlFor="modal-role-customer">Buyer</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="seller" id="modal-role-seller" /><Label htmlFor="modal-role-seller">Seller</Label></div>
                </RadioGroup>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <LoaderCircle className="animate-spin" /> : 'Create Account'}
              </Button>
            </form>
            <DialogFooter className="text-sm text-muted-foreground justify-center">
              Already have an account?
              <Button variant="link" className="p-0 h-auto" onClick={(e) => toggleAuthMode(e, 'login')}>
                Sign In
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* --- SIGN IN FORM --- */}
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center">
                <Gem className="h-6 w-6 mr-2 text-pink-500" /> Welcome Back!
              </DialogTitle>
              <DialogDescription>
                Sign in to access your dashboard, wishlist, and more.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <Terminal className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="modal-login-email" type="email" placeholder="Email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} disabled={isLoading} className="pl-9" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                {/* Updated password field with type toggle and icon */}
                <Input 
                  id="modal-login-password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Password" 
                  required 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  disabled={isLoading} 
                  className="pl-9 pr-10" 
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <LoaderCircle className="animate-spin" /> : 'Sign In'}
              </Button>
            </form>
            <DialogFooter className="text-sm text-muted-foreground justify-center">
              New here?
              <Button variant="link" className="p-0 h-auto" onClick={(e) => toggleAuthMode(e, 'signup')}>
                Create an account
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}