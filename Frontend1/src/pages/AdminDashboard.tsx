// /Frontend1/src/pages/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser, logout, User, verifyToken } from "@/lib/auth";
import { Product } from "@/lib/products";
import { Seller, getAllSellers, updateSellerStatus, getAllProducts, updateProductStatus } from "@/lib/admin";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, LoaderCircle, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type VerificationStatus = 'verifying' | 'verified' | 'failed';

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('verifying');
  
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sellersData, productsData] = await Promise.all([
        getAllSellers(),
        getAllProducts(),
      ]);
      setSellers(sellersData);
      setProducts(productsData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch admin data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
      verifyToken(currentUser.token)
        .then(verifiedUser => {
          setUser(verifiedUser);
          setVerificationStatus('verified');
          fetchData();
        })
        .catch(() => {
          setVerificationStatus('failed');
          setTimeout(() => navigate('/auth'), 2000);
        });
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleSellerStatusUpdate = async (sellerId: string, status: 'approved' | 'rejected' | 'suspended') => {
    try {
      await updateSellerStatus(sellerId, status);
      toast({ title: "Success", description: `Seller status updated to ${status}.` });
      fetchData(); // Refresh data
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update seller status." });
    }
  };
  
  const handleProductStatusUpdate = async (productId: string, status: 'approved' | 'rejected' | 'suspended') => {
    try {
      await updateProductStatus(productId, status);
      toast({ title: "Success", description: `Product status updated to ${status}.` });
      fetchData(); // Refresh data
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Failed to update product status." });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected':
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
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
                 <h1 className="text-3xl font-bold text-destructive">Access Denied</h1>
                 <p className="text-muted-foreground">Verifying credentials or redirecting...</p>
                 <StatusIndicator />
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user.name}!</p>
        </div>
        <div className="flex items-center gap-4">
          <StatusIndicator />
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>
      </header>
      
      <Tabs defaultValue="sellers">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sellers">Seller Management</TabsTrigger>
          <TabsTrigger value="products">Product Approvals</TabsTrigger>
        </TabsList>
        <TabsContent value="sellers">
          <Card>
            <CardHeader>
              <CardTitle>Sellers</CardTitle>
              <CardDescription>Review and manage seller accounts.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="text-center"><LoaderCircle className="h-8 w-8 animate-spin inline-block" /></div> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellers.map((seller) => (
                    <TableRow key={seller._id}>
                      <TableCell className="font-medium">{seller.businessName}</TableCell>
                      <TableCell>{seller.user?.name || 'N/A'}</TableCell>
                      <TableCell><Badge variant={getStatusBadgeVariant(seller.status)} className="capitalize">{seller.status}</Badge></TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleSellerStatusUpdate(seller._id, 'approved')} disabled={seller.status === 'approved'}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500"/> Approve
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleSellerStatusUpdate(seller._id, 'rejected')} className="text-red-500">
                              <XCircle className="mr-2 h-4 w-4"/> Reject
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products">
           <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Review and approve new product submissions.</CardDescription>
            </CardHeader>
            <CardContent>
               {isLoading ? <div className="text-center"><LoaderCircle className="h-8 w-8 animate-spin inline-block" /></div> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{sellers.find(s => s.user._id === product.seller)?.businessName || 'N/A'}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell><Badge variant={getStatusBadgeVariant(product.status)} className="capitalize">{product.status}</Badge></TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleProductStatusUpdate(product._id, 'approved')} disabled={product.status === 'approved'}>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500"/> Approve
                              </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => handleProductStatusUpdate(product._id, 'rejected')} className="text-red-500">
                                <XCircle className="mr-2 h-4 w-4"/> Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
               )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

