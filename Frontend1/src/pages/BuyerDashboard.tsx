import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { getCurrentUser, logout, User, verifyToken } from "../lib/auth";
import { Product, getApprovedProducts } from "../lib/products";
import { ShieldCheck, ShieldAlert, LoaderCircle, ExternalLink } from 'lucide-react';
import { useToast } from "../components/ui/use-toast";

type VerificationStatus = 'verifying' | 'verified' | 'failed';

export default function BuyerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('verifying');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      verifyToken(currentUser.token)
        .then(verifiedUser => {
          setUser(verifiedUser);
          setVerificationStatus('verified');
          fetchProducts();
        })
        .catch(() => {
          setVerificationStatus('failed');
          setTimeout(() => navigate('/auth'), 2000);
        });
    } else {
      navigate('/auth');
    }
  }, [navigate]);
  
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const approvedProducts = await getApprovedProducts();
      setProducts(approvedProducts);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not fetch jewelry.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const StatusIndicator = () => {
    switch (verificationStatus) {
      case 'verified':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><ShieldCheck className="mr-2 h-4 w-4" />Token Verified</Badge>;
      case 'failed':
        return <Badge variant="destructive"><ShieldAlert className="mr-2 h-4 w-4" />Token Invalid</Badge>;
      default:
        return <Badge variant="secondary"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Verifying...</Badge>;
    }
  };

  if (verificationStatus !== 'verified' || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800 text-center">
          <h1 className="text-3xl font-bold text-destructive">Authentication Issue</h1>
          <p className="text-muted-foreground">Verifying your session or redirecting to login...</p>
          <StatusIndicator />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Jewelry Marketplace</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}! Browse approved products below.</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusIndicator />
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>
      </header>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
            <h2 className="text-2xl font-semibold">No Jewelry Found</h2>
            <p className="text-muted-foreground mt-2">Check back later for new arrivals!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product._id} className="overflow-hidden flex flex-col">
              <CardHeader className="p-0">
                <img 
                  src={`http://localhost:8000${product.images[0]}`}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              </CardHeader>
              <CardContent className="p-4 flex-grow">
                <Badge variant="secondary" className="mb-2 capitalize">{product.category}</Badge>
                <CardTitle className="text-lg font-semibold leading-tight mb-1">{product.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{product.brand}</p>
                 <p className="text-lg font-bold mt-2">${product.price.toFixed(2)}</p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button asChild className="w-full">
                  <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer">
                    View Product <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

