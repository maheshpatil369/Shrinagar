import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { signup, login } from "@/lib/auth";
import { signupSchema, loginSchema, type SignupData, type LoginData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Gem, Loader2 } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [loginErrors, setLoginErrors] = useState<Partial<Record<keyof LoginData, string>>>({});

  // Signup form state
  const [signupData, setSignupData] = useState<SignupData>({
    name: "",
    email: "",
    password: "",
    role: "buyer",
  });
  const [signupErrors, setSignupErrors] = useState<Partial<Record<keyof SignupData, string>>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});
    setIsLoading(true);

    try {
      // Validate input
      const validatedData = loginSchema.parse(loginData);
      
      // Call login API
      const user = await login(validatedData);
      
      toast({
        title: "Welcome back!",
        description: `Logged in as ${user.role}`,
      });
      
      // Redirect based on role
      switch (user.role) {
        case 'buyer':
          navigate('/buyer');
          break;
        case 'seller':
          navigate('/seller');
          break;
        case 'admin':
          navigate('/admin');
          break;
      }
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const errors: any = {};
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            errors[err.path[0]] = err.message;
          }
        });
        setLoginErrors(errors);
      } else {
        toast({
          title: "Login failed",
          description: error.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});
    setIsLoading(true);

    try {
      // Validate input
      const validatedData = signupSchema.parse(signupData);
      
      // Call signup API
      const user = await signup(validatedData);
      
      toast({
        title: "Account created!",
        description: `Welcome ${user.name}! Redirecting to your dashboard...`,
      });
      
      // Redirect based on role
      setTimeout(() => {
        switch (user.role) {
          case 'buyer':
            navigate('/buyer');
            break;
          case 'seller':
            navigate('/seller');
            break;
          case 'admin':
            navigate('/admin');
            break;
        }
      }, 1000);
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        const errors: any = {};
        error.errors.forEach((err: any) => {
          if (err.path[0]) {
            errors[err.path[0]] = err.message;
          }
        });
        setSignupErrors(errors);
      } else {
        toast({
          title: "Registration failed",
          description: error.message || "Unable to create account",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-muted/50 to-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gem className="w-8 h-8 text-accent" />
          </div>
          <CardTitle className="text-3xl">Luxury Jewelry</CardTitle>
          <CardDescription>Sign in or create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    disabled={isLoading}
                  />
                  {loginErrors.email && (
                    <p className="text-sm text-destructive">{loginErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    disabled={isLoading}
                  />
                  {loginErrors.password && (
                    <p className="text-sm text-destructive">{loginErrors.password}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
              
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground text-center mb-3">Demo Accounts:</p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>Buyer: buyer@demo.com / demo123</p>
                  <p>Seller: seller@demo.com / demo123</p>
                  <p>Admin: admin@demo.com / demo123</p>
                </div>
              </div>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={signupData.name}
                    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                    disabled={isLoading}
                  />
                  {signupErrors.name && (
                    <p className="text-sm text-destructive">{signupErrors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    disabled={isLoading}
                  />
                  {signupErrors.email && (
                    <p className="text-sm text-destructive">{signupErrors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password (min 6 characters)"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    disabled={isLoading}
                  />
                  {signupErrors.password && (
                    <p className="text-sm text-destructive">{signupErrors.password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-role">I am a</Label>
                  <Select 
                    value={signupData.role} 
                    onValueChange={(value: any) => setSignupData({ ...signupData, role: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="signup-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">Buyer - Browse & Purchase Jewelry</SelectItem>
                      <SelectItem value="seller">Seller - List & Sell Jewelry</SelectItem>
                      <SelectItem value="admin">Admin - Manage Platform</SelectItem>
                    </SelectContent>
                  </Select>
                  {signupErrors.role && (
                    <p className="text-sm text-destructive">{signupErrors.role}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
