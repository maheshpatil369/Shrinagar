// maheshpatil369/shrinagar/Shrinagar-c908f2c7ebd73d867e2e79166bd07d6874cca960/Frontend1/src/pages/Auth.tsx
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, signup } from '../lib/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Terminal, Gem, Mail, Lock, User as UserIcon, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Auth() {
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
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

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
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-inter">
        <div className={cn(
            "relative overflow-hidden rounded-lg shadow-lg bg-card text-card-foreground w-full max-w-4xl min-h-[550px] transition-all duration-700 ease-in-out",
            isSignUp && 'right-panel-active'
        )}>
            {/* Sign Up Form */}
            <div className={cn(
                "absolute top-0 h-full w-1/2 left-0 transition-all duration-700 ease-in-out opacity-0 z-10",
                isSignUp && "transform translate-x-full opacity-100 z-20"
            )}>
                <form onSubmit={handleSignup} className="h-full flex flex-col justify-center items-center px-12 text-center">
                    <h1 className="text-3xl font-bold mb-4">Create Account</h1>
                    {signupError && (
                      <Alert variant="destructive" className="mb-4 text-left"><Terminal className="h-4 w-4" /><AlertTitle>Signup Failed</AlertTitle><AlertDescription>{signupError}</AlertDescription></Alert>
                    )}
                    <div className="w-full space-y-4">
                        <div className="relative"><UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="signup-name" placeholder="Name" required value={signupName} onChange={(e) => setSignupName(e.target.value)} disabled={isLoading} className="pl-9 bg-muted border-0" /></div>
                        <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="signup-email" type="email" placeholder="Email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} disabled={isLoading} className="pl-9 bg-muted border-0" /></div>
                        <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="signup-password" type="password" placeholder="Password" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} disabled={isLoading} className="pl-9 bg-muted border-0"/></div>
                    </div>
                    <div className="grid gap-2 mt-4 text-left w-full">
                        <Label className="text-muted-foreground">Register as a:</Label>
                        <RadioGroup defaultValue="customer" onValueChange={(value) => setSignupRole(value as 'customer' | 'seller')} className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="customer" id="role-customer" /><Label htmlFor="role-customer">Buyer</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="seller" id="role-seller" /><Label htmlFor="role-seller">Seller</Label></div>
                        </RadioGroup>
                    </div>
                    <Button type="submit" className="mt-6 w-full max-w-xs" disabled={isLoading}>{isLoading ? <LoaderCircle className="animate-spin" /> : 'Sign Up'}</Button>
                </form>
            </div>

            {/* Sign In Form */}
            <div className={cn(
                "absolute top-0 h-full w-1/2 left-0 transition-all duration-700 ease-in-out z-20",
                isSignUp && "transform translate-x-full opacity-0"
            )}>
                <form onSubmit={handleLogin} className="h-full flex flex-col justify-center items-center px-12 text-center">
                    <h1 className="text-3xl font-bold mb-4">Sign In</h1>
                    {loginError && (
                      <Alert variant="destructive" className="mb-4 text-left"><Terminal className="h-4 w-4" /><AlertTitle>Login Failed</AlertTitle><AlertDescription>{loginError}</AlertDescription></Alert>
                    )}
                    <div className="w-full space-y-4">
                        <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="login-email" type="email" placeholder="Email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} disabled={isLoading} className="pl-9 bg-muted border-0" /></div>
                        <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="login-password" type="password" placeholder="Password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} disabled={isLoading} className="pl-9 bg-muted border-0" /></div>
                    </div>
                    <a href="#" className="text-sm mt-4 text-muted-foreground hover:text-primary">Forgot your password?</a>
                    <Button type="submit" className="mt-6 w-full max-w-xs" disabled={isLoading}>{isLoading ? <LoaderCircle className="animate-spin" /> : 'Sign In'}</Button>
                </form>
            </div>
            
            {/* Overlay Container */}
            <div className={cn(
                "absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-50 transition-transform duration-700 ease-in-out",
                isSignUp && "transform -translate-x-full"
            )}>
                <div className={cn(
                    "bg-gradient-to-r from-pink-500 to-rose-500 text-white relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out",
                    isSignUp && "transform translate-x-1/2"
                )}>
                    {/* Overlay Left */}
                    <div className={cn(
                        "absolute top-0 w-1/2 h-full flex flex-col items-center justify-center text-center px-10 transition-transform duration-700 ease-in-out",
                        "transform -translate-x-[20%]",
                        isSignUp && "transform translate-x-0"
                    )}>
                        <Gem className="h-16 w-16 mb-4" />
                        <h1 className="text-3xl font-bold">Welcome Back!</h1>
                        <p className="text-sm mt-2">To keep connected with us please login with your personal info</p>
                        <Button variant="outline" className="mt-6 bg-transparent border-white text-white hover:bg-white/10" onClick={() => setIsSignUp(false)}>Sign In</Button>
                    </div>

                    {/* Overlay Right */}
                    <div className={cn(
                        "absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center text-center px-10 transition-transform duration-700 ease-in-out",
                        "transform translate-x-0",
                        isSignUp && "transform translate-x-[20%]"
                    )}>
                        <Gem className="h-16 w-16 mb-4" />
                        <h1 className="text-3xl font-bold">Hello, Friend!</h1>
                        <p className="text-sm mt-2">Enter your personal details and start your journey with us</p>
                        <Button variant="outline" className="mt-6 bg-transparent border-white text-white hover:bg-white/10" onClick={() => setIsSignUp(true)}>Sign Up</Button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

