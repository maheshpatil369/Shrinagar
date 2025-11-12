// maheshpatil369/shrinagar/Shrinagar-f1ede353ebcd0107a58d8a5b477911c8c5eb4f1d/Frontend1/src/pages/AdminDashboard.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';

import { getCurrentUser, logout, User } from "../lib/auth";
import { Product } from "../lib/products";
import { Seller } from "../lib/seller";
import {
    getAdminDashboardStats,
    getPendingApprovals,
    getSellerDetailsForAdmin,
    updateSellerStatus,
    updateProductStatus,
    SellerHistory,
    adminGetAllUsers,
    adminGetAllSellers,
    adminGetAllProducts,
    getAdminChartData,
} from "../lib/admin";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { Badge } from "../components/ui/badge";
import { ShieldCheck, LoaderCircle, Users, Package, BarChart2, Clock, Eye, CheckCircle, XCircle, ShieldAlert, History, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { cn } from "../lib/utils"; // <-- IMPORT cn
import { ThemeToggle } from "../components/ThemeToggle";


type ViewingSellerDetails = {
    seller: Seller;
    products: Product[];
    history: SellerHistory[];
};

type AdminStats = {
    totalUsers: number;
    totalSellers: number;
    totalProducts: number;
    pendingApprovals: number;
};

const chartConfig = {
  users: {
    label: "Users",
    color: "hsl(var(--chart-1))",
  },
  products: {
    label: "Products",
    color: "hsl(var(--chart-2))",
  },
} satisfies import("../components/ui/chart").ChartConfig;

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pending, setPending] = useState<{ sellers: Seller[], products: Product[] }>({ sellers: [], products: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [viewingSellerDetails, setViewingSellerDetails] = useState<ViewingSellerDetails | null>(null);
  const [viewingProductDetails, setViewingProductDetails] = useState<Product | null>(null);
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allSellers, setAllSellers] = useState<Seller[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const [mainTab, setMainTab] = useState("dashboard");
  const [managementTab, setManagementTab] = useState("users");
  const [userFilter, setUserFilter] = useState<"all" | "customer" | "seller">("all");
  
  const [productSearch, setProductSearch] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  
  const [sellerSearch, setSellerSearch] = useState("");
  const [sellerStatusFilter, setSellerStatusFilter] = useState("all");


  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [chartData, setChartData] = useState([]);

  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, pendingData, usersData, sellersData, productsData] = await Promise.all([
        getAdminDashboardStats(),
        getPendingApprovals(),
        adminGetAllUsers(),
        adminGetAllSellers(),
        adminGetAllProducts(),
      ]);
      setStats(statsData);
      setPending(pendingData);
      setAllUsers(usersData);
      setAllSellers(sellersData);
      setAllProducts(productsData);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch admin data." });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchChartData = async (period: 'week' | 'month' | 'year') => {
      try {
          const data = await getAdminChartData(period);
          setChartData(data);
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Failed to load chart data." });
      }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
      setUser(currentUser);
      fetchData();
      fetchChartData(chartPeriod);
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  useEffect(() => {
      if (user) {
        fetchChartData(chartPeriod);
      }
  }, [chartPeriod, user]);

  const handleViewSeller = async (sellerId: string) => {
    try {
        const sellerDetails = await getSellerDetailsForAdmin(sellerId);
        setViewingSellerDetails(sellerDetails);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch seller details." });
    }
  };

  const handleSellerStatusUpdate = async (sellerId: string, status: 'approved' | 'rejected' | 'suspended') => {
    try {
      await updateSellerStatus(sellerId, status);
      toast({ title: "Success", description: `Seller status updated to ${status}.` });
      fetchData(); // Refetch all data
      if (viewingSellerDetails?.seller._id === sellerId) setViewingSellerDetails(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update seller status." });
    }
  };

  const handleProductStatusUpdate = async (productId: string, status: 'approved' | 'rejected') => {
      try {
          await updateProductStatus(productId, status);
          toast({ title: "Success", description: `Product status updated to ${status}.` });
          fetchData(); // Refetch all data
          if (viewingProductDetails?._id === productId) setViewingProductDetails(null);
      } catch (error) {
          toast({ variant: "destructive", title: "Error", description: "Failed to update product status."});
      }
  };
  
  // --- NEW: Function to return color classes for badges ---
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700 border";
      case 'pending':
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 border";
      case 'rejected':
      case 'suspended':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700 border";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 border";
    }
  };

  const filteredUsers = useMemo(() => {
      if (userFilter === 'all') return allUsers;
      return allUsers.filter(u => u.role === userFilter);
  }, [allUsers, userFilter]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
        const searchMatch = product.name.toLowerCase().includes(productSearch.toLowerCase());
        const statusMatch = productStatusFilter === 'all' || product.status === productStatusFilter;
        const categoryMatch = productCategoryFilter === 'all' || product.category === productCategoryFilter;
        return searchMatch && statusMatch && categoryMatch;
    });
  }, [allProducts, productSearch, productStatusFilter, productCategoryFilter]);

  const filteredSellers = useMemo(() => {
    return allSellers.filter(seller => {
        const searchMatch = seller.businessName.toLowerCase().includes(sellerSearch.toLowerCase());
        const statusMatch = sellerStatusFilter === 'all' || seller.status === sellerStatusFilter;
        return searchMatch && statusMatch;
    });
  }, [allSellers, sellerSearch, sellerStatusFilter]);

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
          <ThemeToggle />
          <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white"><ShieldCheck className="mr-2 h-4 w-4" />Admin Access</Badge>
          <Button onClick={() => logout()} variant="outline">Logout</Button>
        </div>
      </header>
      
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard Stats</TabsTrigger>
          <TabsTrigger value="approvals">Approvals ({pending.sellers.length + pending.products.length})</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-6">
            {/* --- UPDATED: Added colorful borders and icons --- */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card className="cursor-pointer hover:bg-muted/50 border-l-4 border-blue-500" onClick={() => { setMainTab("management"); setManagementTab("users"); }}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalUsers}</div></CardContent></Card>
                <Card className="cursor-pointer hover:bg-muted/50 border-l-4 border-purple-500" onClick={() => { setMainTab("management"); setManagementTab("sellers"); }}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Sellers</CardTitle><Package className="h-4 w-4 text-purple-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalSellers}</div></CardContent></Card>
                <Card className="cursor-pointer hover:bg-muted/50 border-l-4 border-green-500" onClick={() => { setMainTab("management"); setManagementTab("products"); }}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Products</CardTitle><BarChart2 className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalProducts}</div></CardContent></Card>
                <Card className="cursor-pointer hover:bg-muted/50 border-l-4 border-amber-500" onClick={() => setMainTab("approvals")}><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pending Approvals</CardTitle><Clock className="h-4 w-4 text-amber-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.pendingApprovals}</div></CardContent></Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Growth Overview</CardTitle>
                        <CardDescription>New users and products over time.</CardDescription>
                    </div>
                    <Select value={chartPeriod} onValueChange={(value) => setChartPeriod(value as any)}>
                        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Last 7 Days</SelectItem>
                            <SelectItem value="month">Last 30 Days</SelectItem>
                            <SelectItem value="year">Last Year</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                         <BarChart data={chartData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => chartPeriod === 'year' ? format(new Date(`${value}-02`), 'MMM') : format(new Date(value), 'd MMM')} />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="users" fill="var(--color-users)" radius={4} />
                            <Bar dataKey="products" fill="var(--color-products)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="approvals" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><CardTitle>Pending Seller Applications ({pending.sellers.length})</CardTitle></CardHeader>
                    <CardContent>
                        {pending.sellers.length > 0 ? (
                            <Table>
                                <TableHeader><TableRow><TableHead>Business Name</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {pending.sellers.map(seller => (
                                        <TableRow key={seller._id}>
                                            <TableCell className="font-medium">{seller.businessName}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => handleViewSeller(seller._id)}><Eye className="mr-2 h-4 w-4"/>Review</Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button size="sm" variant="destructive"><XCircle className="mr-2 h-4 w-4"/>Reject</Button></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Reject Seller?</AlertDialogTitle><AlertDialogDescription>This will permanently reject {seller.businessName}'s application.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleSellerStatusUpdate(seller._id, 'rejected')}>Confirm Reject</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button size="sm" className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-2 h-4 w-4"/>Approve</Button></AlertDialogTrigger>
                                                     <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Approve Seller?</AlertDialogTitle><AlertDialogDescription>This will allow {seller.businessName} to start listing products.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleSellerStatusUpdate(seller._id, 'approved')}>Confirm Approve</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : <p className="text-muted-foreground text-sm">No pending seller applications.</p>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Pending Product Listings ({pending.products.length})</CardTitle></CardHeader>
                    <CardContent>
                         {pending.products.length > 0 ? (
                            <Table>
                                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Seller</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {pending.products.map(product => (
                                        <TableRow key={product._id}>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            {/* @ts-ignore */}
                                            <TableCell>{product.seller?.businessName || 'N/A'}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => setViewingProductDetails(product)}><Eye className="mr-2 h-4 w-4"/>Review</Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button size="sm" variant="destructive"><XCircle className="mr-2 h-4 w-4"/>Reject</Button></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Reject Product?</AlertDialogTitle><AlertDialogDescription>This will reject the product "{product.name}".</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleProductStatusUpdate(product._id, 'rejected')}>Confirm Reject</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button size="sm" className="bg-green-600 hover:bg-green-700"><CheckCircle className="mr-2 h-4 w-4"/>Approve</Button></AlertDialogTrigger>
                                                     <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Approve Product?</AlertDialogTitle><AlertDialogDescription>This will make "{product.name}" visible to all buyers.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleProductStatusUpdate(product._id, 'approved')}>Confirm Approve</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : <p className="text-muted-foreground text-sm">No pending product listings.</p>}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
        
        <TabsContent value="management" className="mt-6">
            <Tabs defaultValue={managementTab} onValueChange={setManagementTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="users">Users ({allUsers.length})</TabsTrigger>
                    <TabsTrigger value="sellers">Sellers ({allSellers.length})</TabsTrigger>
                    <TabsTrigger value="products">Products ({allProducts.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="users" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Users</CardTitle>
                            <div className="flex items-center justify-between">
                                <CardDescription>List of all registered customers and sellers.</CardDescription>
                                <Select value={userFilter} onValueChange={(value) => setUserFilter(value as any)}>
                                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="customer">Customers</SelectItem>
                                        <SelectItem value="seller">Sellers</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Joined On</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredUsers.map(u => (
                                        <TableRow key={u._id}><TableCell>{u.name}</TableCell><TableCell>{u.email}</TableCell><TableCell><Badge variant="outline" className="capitalize">{u.role}</Badge></TableCell><TableCell>{(u as any).createdAt ? format(new Date((u as any).createdAt), "PP") : 'N/A'}</TableCell></TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="sellers" className="mt-4">
                    <Card>
                        <CardHeader>
                             <CardTitle>All Sellers</CardTitle>
                             <CardDescription>Search and manage all sellers in the system.</CardDescription>
                             <div className="mt-4 flex items-center gap-4">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by business name..." className="pl-9" value={sellerSearch} onChange={e => setSellerSearch(e.target.value)} />
                                </div>
                                <Select value={sellerStatusFilter} onValueChange={setSellerStatusFilter}>
                                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {['pending', 'approved', 'rejected', 'suspended'].map(status => (<SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Business Name</TableHead><TableHead>Owner</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredSellers.map(s => (
                                        <TableRow key={s._id}>
                                            <TableCell>{s.businessName}</TableCell>
                                            <TableCell>{s.user.name}</TableCell>
                                            {/* --- UPDATED: Using new color function --- */}
                                            <TableCell><Badge className={cn("capitalize", getStatusBadgeClass(s.status))}>{s.status}</Badge></TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleViewSeller(s._id)}><Eye className="h-4 w-4 mr-1"/>Details</Button>

                                                {s.status !== 'approved' && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={s.status === 'approved'}><CheckCircle className="h-4 w-4"/></Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>Approve Seller?</AlertDialogTitle><AlertDialogDescription>This will approve {s.businessName}.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleSellerStatusUpdate(s._id, 'approved')}>Confirm Approve</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}

                                                {s.status !== 'rejected' && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button size="sm" variant="destructive" disabled={s.status === 'rejected'}><XCircle className="h-4 w-4"/></Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>Reject Seller?</AlertDialogTitle><AlertDialogDescription>This will reject {s.businessName}'s application.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleSellerStatusUpdate(s._id, 'rejected')}>Confirm Reject</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                                
                                                {s.status === 'approved' && (
                                                   <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button size="sm" variant="secondary"><ShieldAlert className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Suspend Seller?</AlertDialogTitle><AlertDialogDescription>This will suspend {s.businessName}'s account.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleSellerStatusUpdate(s._id, 'suspended')}>Confirm Suspend</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                   </AlertDialog>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="products" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>All Products</CardTitle>
                            <CardDescription>Search and manage all products in the system.</CardDescription>
                            <div className="mt-4 flex items-center gap-4">
                                <div className="relative flex-grow">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Search by product name..." className="pl-9" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                                </div>
                                <Select value={productCategoryFilter} onValueChange={setProductCategoryFilter}>
                                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {['ring', 'necklace', 'bracelet', 'earrings', 'watch', 'other'].map(cat => (<SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                                <Select value={productStatusFilter} onValueChange={setProductStatusFilter}>
                                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {['pending', 'approved', 'rejected', 'suspended'].map(status => (<SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Seller</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredProducts.map(p => (
                                        <TableRow key={p._id}>
                                            <TableCell>{p.name}</TableCell>
                                            {/* @ts-ignore */}
                                            <TableCell>{p.seller.name}</TableCell>
                                            <TableCell>${p.price.toFixed(2)}</TableCell>
                                            {/* --- UPDATED: Using new color function --- */}
                                            <TableCell><Badge className={cn("capitalize", getStatusBadgeClass(p.status))}>{p.status}</Badge></TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="ghost" size="sm" onClick={() => setViewingProductDetails(p)}><Eye className="h-4 w-4 mr-1"/>Review</Button>
                                                {p.status !== 'rejected' && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button size="sm" variant="destructive" disabled={p.status === 'rejected'}><XCircle className="h-4 w-4"/></Button></AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Reject Product?</AlertDialogTitle><AlertDialogDescription>This will reject the product "{p.name}".</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleProductStatusUpdate(p._id, 'rejected')}>Confirm Reject</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                )}
                                                {p.status !== 'approved' && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={p.status === 'approved'}><CheckCircle className="h-4 w-4"/></Button></AlertDialogTrigger>
                                                     <AlertDialogContent>
                                                        <AlertDialogHeader><AlertDialogTitle>Approve Product?</AlertDialogTitle><AlertDialogDescription>This will make "{p.name}" visible to all buyers.</AlertDialogDescription></AlertDialogHeader>
                                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleProductStatusUpdate(p._id, 'approved')}>Confirm Approve</AlertDialogAction></AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </TabsContent>
      </Tabs>

      {/* Seller Details Dialog */}
       <Dialog open={!!viewingSellerDetails} onOpenChange={() => setViewingSellerDetails(null)}>
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>{viewingSellerDetails?.seller.businessName}</DialogTitle>
                <DialogDescription>
                    Review seller's profile, products, and history. Status: {/* --- UPDATED: Using new color function --- */}
                    <Badge className={cn("capitalize", getStatusBadgeClass(viewingSellerDetails?.seller.status || ''))}>{viewingSellerDetails?.seller.status}</Badge>
                </DialogDescription>
            </DialogHeader>
            {viewingSellerDetails && (
                <Tabs defaultValue="profile" className="flex-grow flex flex-col overflow-hidden">
                    <TabsList>
                        <TabsTrigger value="profile">Profile Details</TabsTrigger>
                        <TabsTrigger value="products">Products ({viewingSellerDetails.products.length})</TabsTrigger>
                        <TabsTrigger value="history">Account History</TabsTrigger>
                    </TabsList>
                    <ScrollArea className="flex-grow mt-4 pr-6">
                        <TabsContent value="profile">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                 <div><h4 className="font-semibold">Owner</h4><p className="text-muted-foreground">{viewingSellerDetails.seller.user.name} ({viewingSellerDetails.seller.user.email})</p></div>
                                 <div><h4 className="font-semibold">GST Number</h4><p className="text-muted-foreground">{viewingSellerDetails.seller.gstNumber}</p></div>
                                 <div><h4 className="font-semibold">PAN Number</h4><p className="text-muted-foreground">{viewingSellerDetails.seller.panNumber}</p></div>
                                 <div><h4 className="font-semibold">Address</h4><p className="text-muted-foreground">{`${viewingSellerDetails.seller.address.street}, ${viewingSellerDetails.seller.address.city}, ${viewingSellerDetails.seller.address.state} - ${viewingSellerDetails.seller.address.pincode}`}</p></div>
                                 <div className="col-span-full"><h4 className="font-semibold mb-2">Verification Documents</h4>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <Card>
                                             <CardHeader><CardTitle className="text-base">GST Certificate</CardTitle></CardHeader>
                                             <CardContent>{viewingSellerDetails.seller.verificationDocuments?.gstCertificate ? <img src={viewingSellerDetails.seller.verificationDocuments.gstCertificate} alt="GST Certificate" className="rounded-md border"/> : <p className="text-muted-foreground">Not Provided</p>}</CardContent>
                                         </Card>
                                         <Card>
                                             <CardHeader><CardTitle className="text-base">PAN Card</CardTitle></CardHeader>
                                             <CardContent>{viewingSellerDetails.seller.verificationDocuments?.panCard ? <img src={viewingSellerDetails.seller.verificationDocuments.panCard} alt="PAN Card" className="rounded-md border"/> : <p className="text-muted-foreground">Not Provided</p>}</CardContent>
                                         </Card>
                                     </div>
                                 </div>
                                </div>
                        </TabsContent>
                        <TabsContent value="products">
                           <Table>
                                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {viewingSellerDetails.products.map(p => (
                                        <TableRow key={p._id}>
                                            <TableCell><div className="flex items-center gap-4"><img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-md border"/><span>{p.name}</span></div></TableCell>
                                            <TableCell>${p.price.toFixed(2)}</TableCell>
                                            {/* --- UPDATED: Using new color function --- */}
                                            <TableCell><Badge className={cn("capitalize", getStatusBadgeClass(p.status))}>{p.status}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>
                        <TabsContent value="history">
                            <div className="space-y-4">
                                {viewingSellerDetails.history.map(entry => (
                                    <Card key={entry._id}>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center justify-between">
                                                <span>{entry.notes || 'Profile Update'}</span>
                                                <span className="text-xs font-normal text-muted-foreground flex items-center gap-2"><History className="h-3 w-3"/>{format(new Date(entry.createdAt), "PPpp")}</span>
                                            </CardTitle>
                                            <CardDescription>Changed by: {entry.changedBy.name} ({entry.changedBy.role})</CardDescription>
                                        </CardHeader>
                                        {entry.changes.length > 0 && (
                                        <CardContent>
                                            <Table>
                                                <TableHeader><TableRow><TableHead>Field</TableHead><TableHead>Old Value</TableHead><TableHead>New Value</TableHead></TableRow></TableHeader>
                                                <TableBody>
                                                    {entry.changes.map((change, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell className="font-medium">{change.field}</TableCell>
                                                            <TableCell className="text-red-400">{change.oldValue}</TableCell>
                                                            <TableCell className="text-green-400">{change.newValue}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </ScrollArea>
                    <div className="flex justify-end gap-2 pt-4 border-t mt-auto">
                        <Button variant="destructive" onClick={() => handleSellerStatusUpdate(viewingSellerDetails.seller._id, 'rejected')}><XCircle className="mr-2 h-4 w-4"/>Reject</Button>
                        <Button variant="secondary" onClick={() => handleSellerStatusUpdate(viewingSellerDetails.seller._id, 'suspended')}><ShieldAlert className="mr-2 h-4 w-4"/>Suspend</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleSellerStatusUpdate(viewingSellerDetails.seller._id, 'approved')}><CheckCircle className="mr-2 h-4 w-4"/>Approve</Button>
                    </div>
                </Tabs>
            )}
        </DialogContent>
       </Dialog>

        {/* Product Review Dialog */}
        <Dialog open={!!viewingProductDetails} onOpenChange={() => setViewingProductDetails(null)}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{viewingProductDetails?.name}</DialogTitle>
                    <DialogDescription>
                        Reviewing product from {/* @ts-ignore */}
                        <strong>{viewingProductDetails?.seller?.businessName}</strong>. Status: {/* --- UPDATED: Using new color function --- */}
                        <Badge className={cn("capitalize", getStatusBadgeClass(viewingProductDetails?.status || ''))}>{viewingProductDetails?.status}</Badge>
                    </DialogDescription>
                </DialogHeader>
                {viewingProductDetails && (
                    <div className="grid grid-cols-2 gap-6 pt-4">
                        <Carousel className="w-full col-span-2 sm:col-span-1">
                            <CarouselContent>
                                {viewingProductDetails.images.map((image, index) => (
                                <CarouselItem key={index}>
                                    <div className="aspect-square border rounded-lg overflow-hidden">
                                        <img src={image} alt={`Product view ${index + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                        </Carousel>
                        <div className="space-y-4 text-sm col-span-2 sm:col-span-1">
                            <div><h4 className="font-semibold">Description</h4><p className="text-muted-foreground">{viewingProductDetails.description}</p></div>
                            <div><h4 className="font-semibold">Price</h4><p className="text-muted-foreground">${viewingProductDetails.price.toFixed(2)}</p></div>
                            <div><h4 className="font-semibold">Brand</h4><p className="text-muted-foreground">{viewingProductDetails.brand}</p></div>
                            <div><h4 className="font-semibold">Material</h4><p className="text-muted-foreground">{viewingProductDetails.material}</p></div>
                            <div><h4 className="font-semibold">Category</h4><p className="text-muted-foreground capitalize">{viewingProductDetails.category}</p></div>
                        </div>
                    </div>
                )}
                 <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                    <Button variant="destructive" onClick={() => viewingProductDetails && handleProductStatusUpdate(viewingProductDetails._id, 'rejected')}><XCircle className="mr-2 h-4 w-4"/>Reject Product</Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => viewingProductDetails && handleProductStatusUpdate(viewingProductDetails._id, 'approved')}><CheckCircle className="mr-2 h-4 w-4"/>Approve Product</Button>
                </div>
            </DialogContent>
        </Dialog>

    </div>
  );
}