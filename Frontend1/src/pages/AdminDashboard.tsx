// maheshpatil369/shrinagar/Shrinagar-47183708fc2b865cb6e3d62f63fcad35ec0165db/Frontend1/src/pages/AdminDashboard.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { getCurrentUser, logout, User } from "@/lib/auth";
import { Product } from "@/lib/products";
import { Seller } from "@/lib/seller";
import { 
    AdminStats,
    getAdminDashboardStats,
    getAllSellers, 
    updateSellerStatus, 
    getAllProductsForAdmin, 
    updateProductStatusByAdmin,
    deleteProductByAdmin,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getSellerById,
} from "@/lib/admin";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, LoaderCircle, MoreVertical, CheckCircle, XCircle, Trash2, Users, Package, BarChart2, Clock, Eye, UserX, UserCheck, ExternalLink } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Legend, Tooltip as RechartsTooltip } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingSeller, setViewingSeller] = useState<Seller | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, sellersData, productsData, usersData] = await Promise.all([
        getAdminDashboardStats(),
        getAllSellers(),
        getAllProductsForAdmin(),
        getAllUsers(),
      ]);
      setStats(statsData);
      setSellers(sellersData);
      setProducts(productsData);
      setUsers(usersData);
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
      setUser(currentUser);
      fetchData();
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };
  
  const handleViewSeller = async (sellerId: string) => {
    try {
        const sellerDetails = await getSellerById(sellerId);
        setViewingSeller(sellerDetails);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch seller details." });
    }
  }

  const handleSellerStatusUpdate = async (sellerId: string, status: 'approved' | 'rejected' | 'suspended') => {
    try {
      await updateSellerStatus(sellerId, status);
      toast({ title: "Success", description: `Seller status updated to ${status}.` });
      fetchData(); // Refresh data
      if (viewingSeller?._id === sellerId) setViewingSeller(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update seller status." });
    }
  };
  
  const handleProductStatusUpdate = async (productId: string, status: 'approved' | 'rejected' | 'suspended') => {
    try {
      await updateProductStatusByAdmin(productId, status);
      toast({ title: "Success", description: `Product status updated to ${status}.` });
      fetchData(); // Refresh data
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Failed to update product status." });
    }
  };

  const handleProductDelete = async (productId: string) => {
    try {
        await deleteProductByAdmin(productId);
        toast({ title: "Success", description: "Product has been deleted."});
        fetchData();
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete product." });
    }
  }

  const handleUserRoleUpdate = async (userId: string, role: 'customer' | 'seller') => {
    try {
        await updateUserRole(userId, role);
        toast({ title: "Success", description: "User role updated."});
        fetchData();
    } catch(error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to update user role." });
    }
  }

  const handleUserDelete = async (userId: string) => {
    try {
        await deleteUser(userId);
        toast({ title: "Success", description: "User has been deleted."});
        fetchData();
    } catch(error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete user." });
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected':
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  const chartData = useMemo(() => ([
    { name: 'Users', value: stats?.totalUsers || 0 },
    { name: 'Sellers', value: stats?.totalSellers || 0 },
    { name: 'Products', value: stats?.totalProducts || 0 },
  ]), [stats]);

  if (isLoading || !user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading Admin Panel...</p>
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
          <Badge variant="default" className="bg-green-500 hover:bg-green-600"><ShieldCheck className="mr-2 h-4 w-4" />Admin Access</Badge>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>
      </header>
      
      <Tabs defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="sellers">Sellers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalUsers}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Sellers</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalSellers}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Products</CardTitle><BarChart2 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalProducts}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pending Approvals</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.pendingApprovals}</div></CardContent></Card>
            </div>
             <Card className="mt-6">
                <CardHeader><CardTitle>Site Overview</CardTitle></CardHeader>
                <CardContent className="h-[350px]">
                     <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={chartData}>
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                          <Bar dataKey="value" fill="hsl(var(--primary))" name="Total" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="sellers">
          <Card><CardHeader><CardTitle>Seller Management</CardTitle><CardDescription>Review and manage seller accounts.</CardDescription></CardHeader>
            <CardContent>
              <Table><TableHeader><TableRow><TableHead>Business Name</TableHead><TableHead>Owner</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {sellers.map((seller) => (
                    <TableRow key={seller._id}>
                      <TableCell className="font-medium">{seller.businessName}</TableCell>
                      <TableCell>{seller.user?.name || 'N/A'}</TableCell>
                      <TableCell><Badge variant={getStatusBadgeVariant(seller.status)} className="capitalize">{seller.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewSeller(seller._id)}><Eye className="mr-2 h-4 w-4"/> View Details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleSellerStatusUpdate(seller._id, 'approved')} disabled={seller.status === 'approved'}><CheckCircle className="mr-2 h-4 w-4 text-green-500"/> Approve</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleSellerStatusUpdate(seller._id, 'rejected')} className="text-orange-500"><XCircle className="mr-2 h-4 w-4"/> Reject</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleSellerStatusUpdate(seller._id, 'suspended')} className="text-red-500"><ShieldAlert className="mr-2 h-4 w-4"/> Suspend</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products">
           <Card><CardHeader><CardTitle>Product Moderation</CardTitle><CardDescription>Review and manage all product listings.</CardDescription></CardHeader>
            <CardContent>
                <Table><TableHeader><TableRow><TableHead>Product Name</TableHead><TableHead>Seller</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{(product.seller as any)?.name || 'N/A'}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell><Badge variant={getStatusBadgeVariant(product.status)} className="capitalize">{product.status}</Badge></TableCell>
                        <TableCell className="text-right">
                            <AlertDialog>
                               <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleProductStatusUpdate(product._id, 'approved')} disabled={product.status === 'approved'}><CheckCircle className="mr-2 h-4 w-4 text-green-500"/> Approve</DropdownMenuItem>
                                   <DropdownMenuItem onClick={() => handleProductStatusUpdate(product._id, 'rejected')} className="text-orange-500"><XCircle className="mr-2 h-4 w-4"/> Reject</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleProductStatusUpdate(product._id, 'suspended')} className="text-red-500"><ShieldAlert className="mr-2 h-4 w-4"/> Suspend</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                   <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-red-500"><Trash2 className="mr-2 h-4 w-4"/> Delete</DropdownMenuItem>
                                  </AlertDialogTrigger>
                                </DropdownMenuContent>
                              </DropdownMenu>
                               <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Delete Product?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the product listing.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleProductDelete(product._id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
            <Card><CardHeader><CardTitle>User Management</CardTitle><CardDescription>Manage customer and seller accounts.</CardDescription></CardHeader>
                <CardContent>
                    <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {users.map(u => (
                                <TableRow key={u._id}>
                                    <TableCell>{u.name}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell><Badge variant={u.role === 'seller' ? 'secondary' : 'outline'} className="capitalize">{u.role}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <AlertDialog>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {u.role === 'customer' && <DropdownMenuItem onClick={() => handleUserRoleUpdate(u._id, 'seller')}><UserCheck className="mr-2 h-4 w-4"/> Promote to Seller</DropdownMenuItem>}
                                                    {u.role === 'seller' && <DropdownMenuItem onClick={() => handleUserRoleUpdate(u._id, 'customer')}><UserX className="mr-2 h-4 w-4"/> Demote to Customer</DropdownMenuItem>}
                                                    <DropdownMenuSeparator />
                                                    <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-500"><Trash2 className="mr-2 h-4 w-4"/> Delete User</DropdownMenuItem></AlertDialogTrigger>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Delete User?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the user and all associated data. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleUserDelete(u._id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

       <Dialog open={!!viewingSeller} onOpenChange={() => setViewingSeller(null)}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{viewingSeller?.businessName}</DialogTitle>
                <DialogDescription>Review seller's details and verification documents before approval.</DialogDescription>
            </DialogHeader>
            {viewingSeller && <div className="space-y-4 text-sm py-4">
                <div><h4 className="font-semibold">Owner</h4><p className="text-muted-foreground">{viewingSeller.user.name} ({viewingSeller.user.email})</p></div>
                <div><h4 className="font-semibold">GST Number</h4><p className="text-muted-foreground">{viewingSeller.gstNumber}</p></div>
                <div><h4 className="font-semibold">PAN Number</h4><p className="text-muted-foreground">{viewingSeller.panNumber}</p></div>
                <div><h4 className="font-semibold">Address</h4><p className="text-muted-foreground">{`${viewingSeller.address.street}, ${viewingSeller.address.city}, ${viewingSeller.address.state} - ${viewingSeller.address.pincode}`}</p></div>
                <div><h4 className="font-semibold">Documents</h4>
                    <div className="flex items-center space-x-4 mt-2">
                        {viewingSeller.verificationDocuments?.gstCertificate ? <Button size="sm" variant="outline" asChild><a href={viewingSeller.verificationDocuments.gstCertificate} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4"/>View GST</a></Button> : <p className="text-muted-foreground text-xs">No GST Cert.</p>}
                        {viewingSeller.verificationDocuments?.panCard ? <Button size="sm" variant="outline" asChild><a href={viewingSeller.verificationDocuments.panCard} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4"/>View PAN</a></Button> : <p className="text-muted-foreground text-xs">No PAN Card.</p>}
                    </div>
                </div>
            </div>}
        </DialogContent>
       </Dialog>
    </div>
  );
}
