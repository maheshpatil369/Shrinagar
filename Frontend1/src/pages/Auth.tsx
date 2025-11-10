// maheshpatil369/shrinagar/Shrinagar-c908f2c7ebd73d867e2e79166bd07d6874cca960/Frontend1/src/pages/Auth.tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, signup, verifyToken, getCurrentUser } from '@/lib/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Terminal, Gem, Mail, Lock, User as UserIcon, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'; // Assuming LoadingSpinner is saved here

// Keyframes for animations
const keyframes = `
  @keyframes show {
    0%, 49.99% {
      opacity: 0;
      z-index: 1;
    }
    50%, 100% {
      opacity: 1;
      z-index: 2;
    }
  }
`;

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true); // Added for initial token check

  // Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'customer' | 'seller'>('customer');

  // Loading and Error States
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = getCurrentUser();
      if (currentUser?.token) {
        try {
          const verifiedUser = await verifyToken(currentUser.token);
          // Redirect immediately if token is valid
          switch (verifiedUser.role) {
            case 'admin': navigate('/admin', { replace: true }); break;
            case 'seller': navigate('/seller', { replace: true }); break;
            default: navigate('/buyer', { replace: true }); break;
          }
        } catch (error) {
          // Token invalid, clear it and proceed to show auth page
          localStorage.removeItem('userInfo');
          setIsVerifying(false);
        }
      } else {
        setIsVerifying(false); // No token, proceed to show auth page
      }
    };
    checkAuth();
  }, [navigate]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);
    try {
      const user = await login({ email: loginEmail, password: loginPassword });
      localStorage.setItem('userInfo', JSON.stringify(user));

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
    } catch (err: any) {
      setLoginError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // <-- This disables the button
    setSignupError(null);
    try {
      const user = await signup({ name: signupName, email: signupEmail, password: signupPassword, role: signupRole });
      localStorage.setItem('userInfo', JSON.stringify(user));

      // Redirect logic after signup
      if (from) {
        navigate(from, { replace: true });
      } else {
        switch (user.role) {
          case 'seller': navigate('/seller'); break;
          default: navigate('/buyer'); break;
        }
      }
    } catch (err: any) {
      setSignupError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false); // <-- This re-enables the button when done
    }
  };

  if (isVerifying) {
    return <LoadingSpinner fullScreen message="Checking authentication..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-inter">
      <style>{keyframes}</style> {/* Inject keyframes */}
      <div className={cn(
        "relative overflow-hidden rounded-lg shadow-2xl bg-card text-card-foreground w-full max-w-4xl min-h-[600px]", // Increased min-height
      )}>
        {/* Sign Up Form Container - Positioned Absolutely */}
        <div className={cn(
          "absolute top-0 left-0 h-full w-1/2 transition-all duration-700 ease-in-out z-10",
          isSignUp ? "transform translate-x-full opacity-100 z-20" : "transform translate-x-0 opacity-0 pointer-events-none" // Control visibility/position
        )}>
          <form onSubmit={handleSignup} className="h-full flex flex-col justify-center items-center px-6 sm:px-12 text-center">
            <h1 className="text-3xl font-bold mb-4">Create Account</h1>
            {signupError && (
              <Alert variant="destructive" className="mb-4 text-left"><Terminal className="h-4 w-4" /><AlertTitle>Signup Failed</AlertTitle><AlertDescription>{signupError}</AlertDescription></Alert>
            )}
            <div className="w-full space-y-4">
              <div className="relative"><UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="signup-name" placeholder="Name" required value={signupName} onChange={(e) => setSignupName(e.target.value)} disabled={isLoading} className="pl-9 bg-muted border-0" /></div>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="signup-email" type="email" placeholder="Email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} disabled={isLoading} className="pl-9 bg-muted border-0" /></div>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="signup-password" type="password" placeholder="Password" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} disabled={isLoading} className="pl-9 bg-muted border-0" /></div>
            </div>
            <div className="grid gap-2 mt-4 text-left w-full">
              <Label className="text-muted-foreground">Register as a:</Label>
              <RadioGroup value={signupRole} onValueChange={(value) => setSignupRole(value as 'customer' | 'seller')} className="flex items-center space-x-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="customer" id="role-customer" /><Label htmlFor="role-customer">Buyer</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="seller" id="role-seller" /><Label htmlFor="role-seller">Seller</Label></div>
              </RadioGroup>
            </div>
            
            {/* THIS IS THE BUTTON IN QUESTION:
              The `disabled={isLoading}` prop is what makes it unclickable.
              This is correct behavior to prevent duplicate form submissions
              while the network request is in progress.
            */}
            <Button type="submit" className="mt-6 w-full max-w-xs" disabled={isLoading}>
              {isLoading ? <LoaderCircle className="animate-spin" /> : 'Sign Up'}
            </Button>
          </form>
        </div>

        {/* Sign In Form Container - Positioned Absolutely */}
        <div className={cn(
          "absolute top-0 left-0 h-full w-1/2 transition-all duration-700 ease-in-out z-20",
          isSignUp && "transform translate-x-0 opacity-0 pointer-events-none z-10" // Control visibility/position
        )}>
          <form onSubmit={handleLogin} className="h-full flex flex-col justify-center items-center px-6 sm:px-12 text-center">
            <h1 className="text-3xl font-bold mb-4">Sign In</h1>
            {loginError && (
              <Alert variant="destructive" className="mb-4 text-left"><Terminal className="h-4 w-4" /><AlertTitle>Login Failed</AlertTitle><AlertDescription>{loginError}</AlertDescription></Alert>
            )}
            <div className="w-full space-y-4">
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="login-email" type="email" placeholder="Email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} disabled={isLoading} className="pl-9 bg-muted border-0" /></div>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="login-password" type="password" placeholder="Password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} disabled={isLoading} className="pl-9 bg-muted border-0" /></div>
            </div>
            <Button variant="link" className="text-sm mt-4 text-muted-foreground hover:text-primary px-0 h-auto">Forgot your password?</Button>
            <Button type="submit" className="mt-6 w-full max-w-xs" disabled={isLoading}>{isLoading ? <LoaderCircle className="animate-spin" /> : 'Sign In'}</Button>
          </form>
        </div>

        {/* Overlay Container */}
        <div className={cn(
          "absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-50 transition-transform duration-700 ease-in-out",
          isSignUp ? "transform -translate-x-full" : "transform translate-x-0" // Shift overlay container
        )}>
          <div className={cn(
            "bg-gradient-to-r from-rose-500 to-pink-500 text-white relative h-full w-[200%] transition-transform duration-700 ease-in-out",
            isSignUp ? "transform translate-x-1/2" : "transform translate-x-0" // Shift gradient background within overlay
          )}>
            {/* Overlay Left Panel (Shows when Sign Up is hidden) */}
            <div className={cn(
              "absolute top-0 w-1/2 h-full flex flex-col items-center justify-center text-center px-6 sm:px-10",
              "transform translate-x-0" // Stays on the left side of the gradient div
            )}>
              <Gem className="h-16 w-16 mb-4" />
              <h1 className="text-3xl font-bold">Welcome Back!</h1>
              <p className="text-sm mt-2 px-4">Already have an account? Sign in to access your dashboard.</p>
              <Button variant="outline" className="mt-6 bg-transparent border-white text-white hover:bg-white/10" onClick={() => setIsSignUp(false)}>Sign In</Button>
            </div>

            {/* Overlay Right Panel (Shows when Sign In is hidden) */}
            <div className={cn(
              "absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center text-center px-6 sm:px-10",
              "transform translate-x-0" // Stays on the right side of the gradient div
            )}>
              <Gem className="h-16 w-16 mb-4" />
              <h1 className="text-3xl font-bold">Hello, Friend!</h1>
              <p className="text-sm mt-2 px-4">New here? Sign up to discover exquisite jewelry or become a seller.</p>
              <Button variant="outline" className="mt-6 bg-transparent border-white text-white hover:bg-white/10" onClick={() => setIsSignUp(true)}>Sign Up</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}