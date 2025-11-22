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
  className="
    sm:max-w-md 
    bg-[#0e1b33] 
    text-white 
    border border-white/10 
    shadow-[0_0_25px_rgba(255,215,0,0.15)] 
    rounded-2xl
    data-[state=open]:animate-in 
    data-[state=open]:fade-in-0 
    data-[state=open]:slide-in-from-top-8 
    data-[state=closed]:animate-out 
    data-[state=closed]:fade-out-0 
    data-[state=closed]:slide-out-to-bottom-8 
    duration-300
  "
>

  {/* SIGN UP UI */}
  {isSignUp ? (
    <>
      <DialogHeader className="pb-4">
        <DialogTitle className="text-3xl font-bold flex items-center gap-2">
          <Gem className="h-7 w-7 text-brand-yellow drop-shadow" />
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
            Create Account
          </span>
        </DialogTitle>
        <DialogDescription className="text-white/60">
          Sign up to explore exclusive jewelry designs or become a seller.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSignup} className="space-y-5">

        {/* ERROR BOX */}
        {error && (
          <Alert className="bg-red-600/20 border border-red-500/40 text-red-300">
            <AlertTitle>Signup Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* INPUT: NAME */}
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-400" />
          <Input
            className="pl-10 bg-[#051024] border-white/20 text-white focus:ring-yellow-400 focus:border-yellow-400"
            placeholder="Full Name"
            required
            disabled={isLoading}
            value={signupName}
            onChange={(e) => setSignupName(e.target.value)}
          />
        </div>

        {/* INPUT: EMAIL */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-400" />
          <Input
            type="email"
            className="pl-10 bg-[#051024] border-white/20 text-white focus:ring-yellow-400 focus:border-yellow-400"
            placeholder="Email Address"
            required
            disabled={isLoading}
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
          />
        </div>

        {/* INPUT: PASSWORD */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-400" />
          <Input
            type={showPassword ? "text" : "password"}
            className="pl-10 pr-10 bg-[#051024] border-white/20 text-white focus:ring-yellow-400 focus:border-yellow-400"
            placeholder="Password"
            required
            disabled={isLoading}
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-400 hover:text-white"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        {/* ROLE SELECT */}
        <div>
          <Label className="text-white/70">Register as:</Label>
          <RadioGroup
            value={signupRole}
            onValueChange={(v) => setSignupRole(v as any)}
            className="flex space-x-4 mt-1"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="customer" id="cust" />
              <Label htmlFor="cust">Customer</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="seller" id="sell" />
              <Label htmlFor="sell">Seller</Label>
            </div>
          </RadioGroup>
        </div>

        {/* BUTTON */}
        <Button
          className="
            w-full 
            bg-yellow-400 text-black 
            hover:bg-yellow-300
            font-semibold 
            shadow-[0_0_15px_rgba(255,215,0,0.5)]
          "
          disabled={isLoading}
        >
          {isLoading ? <LoaderCircle className="animate-spin" /> : "Create Account"}
        </Button>

      </form>

      <DialogFooter className="text-center pt-3 text-white/70">
        Already have an account?
        <Button variant="link" onClick={(e) => toggleAuthMode(e, "login")} className="text-yellow-300">
          Sign In
        </Button>
      </DialogFooter>
    </>
  ) : (
    <>
      {/* LOGIN UI */}

      <DialogHeader className="pb-4">
        <DialogTitle className="text-3xl font-bold flex items-center gap-2">
          <Gem className="h-7 w-7 text-brand-yellow drop-shadow" />
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
            Welcome Back
          </span>
        </DialogTitle>
        <DialogDescription className="text-white/60">
          Sign in to access your wishlist, dashboard, and purchases.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleLogin} className="space-y-5">

        {error && (
          <Alert className="bg-red-600/20 border border-red-500/40 text-red-300">
            <AlertTitle>Login Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* EMAIL */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-400" />
          <Input
            type="email"
            className="pl-10 bg-[#051024] border-white/20 text-white focus:ring-yellow-400 focus:border-yellow-400"
            placeholder="Email Address"
            required
            disabled={isLoading}
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-400" />
          <Input
            type={showPassword ? "text" : "password"}
            className="pl-10 pr-10 bg-[#051024] border-white/20 text-white focus:ring-yellow-400 focus:border-yellow-400"
            placeholder="Password"
            required
            disabled={isLoading}
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-400 hover:text-white"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        <Button
          className="
            w-full 
            bg-yellow-400 text-black 
            hover:bg-yellow-300
            font-semibold
            shadow-[0_0_15px_rgba(255,215,0,0.5)]
          "
          disabled={isLoading}
        >
          {isLoading ? <LoaderCircle className="animate-spin" /> : "Sign In"}
        </Button>
      </form>

      <DialogFooter className="text-center pt-3 text-white/70">
        New here?
        <Button variant="link" onClick={(e) => toggleAuthMode(e, "signup")} className="text-yellow-300">
          Create an account
        </Button>
      </DialogFooter>
    </>
  )}

</DialogContent>

    </Dialog>
  );
}