import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// --- UPDATED IMPORTS (Using relative paths) ---
import { getCurrentUser, User } from "../lib/auth"; // Removed 'logout'
import { useUser } from "../context/UserContext"; // Added 'useUser'
import { Product } from "../lib/products";
import { Seller } from "../lib/seller";
import {
    getAdminDashboardStats,
    getPendingApprovals, // <-- FIX: Renamed
    updateSellerStatus,
    updateProductStatus,
    getSellerDetailsForAdmin, // <-- FIX: Renamed
    adminGetAllUsers, // <-- FIX: Renamed
    adminGetAllSellers, // <-- FIX: Renamed
    adminGetAllProducts, // <-- FIX: Renamed
    getAdminChartData,
    SellerHistory, // Import SellerHistory
} from "../lib/admin";
 
// --- UI IMPORTS (Using relative paths) ---
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { Badge } from "../components/ui/badge";
// Added LogOut
import { ShieldCheck, LoaderCircle, Users, Package, BarChart2, Clock, Eye, CheckCircle, XCircle, ShieldAlert, History, Search, LogOut, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
// Added AlertDialog imports
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../components/ui/chart"
// --- Recharts import updated ---
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import { cn, getImageUrl } from "../lib/utils"; // <-- IMPORTED getImageUrl
import { ThemeToggle } from "../components/ThemeToggle";
// --- END IMPORTS ---

type ViewingSellerDetails = {
  seller: Seller;
  products: Product[];
  history: SellerHistory[]; // Use imported SellerHistory type
};

// --- UPDATED CHART COLORS ---
const chartConfig = {
  users: {
    label: "Users",
    color: "#3b82f6", // Blue
  },
  products: {
    label: "Products",
    color: "#ec4899", // Pink
  },
} satisfies import("../components/ui/chart").ChartConfig; // <-- Updated path here

// --- PIE CHART CONFIG ---
const pieChartConfig = {
  customers: { label: "Customers", color: "#60a5fa" }, // Light Blue
  sellers: { label: "Sellers", color: "#c084fc" }, // Purple
};

const PIE_COLORS = [pieChartConfig.customers.color, pieChartConfig.sellers.color];


export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<{ sellers: Seller[], products: Product[] }>({ sellers: [], products: [] });
  const [mainTab, setMainTab] = useState("dashboard");
  const [managementTab, setManagementTab] = useState("users");
  
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allSellers, setAllSellers] = useState<Seller[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  const [userFilter, setUserFilter] = useState("all");
  const [sellerSearch, setSellerSearch] = useState("");
  const [sellerStatusFilter, setSellerStatusFilter] = useState("all");
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  
  const [viewingSellerDetails, setViewingSellerDetails] = useState<ViewingSellerDetails | null>(null);
  const [viewingProductDetails, setViewingProductDetails] = useState<Product | null>(null);

  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [chartData, setChartData] = useState([]);

  const { toast } = useToast();
  const navigate = useNavigate();

  // --- UseUser hook for logout ---
  const { logoutUser } = useUser();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, pendingData, usersData, sellersData, productsData] = await Promise.all([
        getAdminDashboardStats(),
        getPendingApprovals(), // <-- FIX: Renamed
        adminGetAllUsers(), // <-- FIX: Renamed
        adminGetAllSellers(), // <-- FIX: Renamed
        adminGetAllProducts() // <-- FIX: Renamed
      ]);
      setStats(statsData);
      setPending(pendingData);
      setAllUsers(usersData);
      setAllSellers(sellersData);
      setAllProducts(productsData);
      
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load dashboard data." });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchChartData = async (period: 'week' | 'month' | 'year') => {
      try {
          const data = await getAdminChartData(period);
          setChartData(data);
      } catch (error) {
           console.error("Failed to fetch chart data:", error);
           toast({ variant: "destructive", title: "Error", description: "Failed to load chart data." });
      }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
      setUser(currentUser);
      fetchData();
      fetchChartData(chartPeriod); // Fetch initial chart data
    } else {
      navigate('/auth'); // Redirect if not admin
    }
  }, [navigate]);
  
  // Refetch chart data when period changes
  useEffect(() => {
      if(user) { // Only fetch if user is logged in
        fetchChartData(chartPeriod);
      }
  }, [chartPeriod, user]);

  // --- ADDED: Memoized pending count ---
  const pendingApprovalsCount = useMemo(() => {
      return (pending.sellers.length + pending.products.length) || (stats?.pendingApprovals || 0);
  }, [pending, stats]);
  
  // --- PIE CHART DATA ---
  const pieData = useMemo(() => {
    const customers = stats?.totalUsers - stats?.totalSellers || 0;
    const sellers = stats?.totalSellers || 0;
    return [
      { name: "Customers", value: customers },
      { name: "Sellers", value: sellers },
    ];
  }, [stats]);


  // --- ADDED: Logout handler ---
  const handleLogout = () => {
    logoutUser();
    navigate("/auth");
    toast({ title: "Logged Out", description: "You have been logged out." });
  };
  
  // --- FILTERED LISTS ---
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => userFilter === 'all' || u.role === userFilter);
  }, [allUsers, userFilter]);

  const filteredSellers = useMemo(() => {
    return allSellers.filter(s => {
      const matchesSearch = s.businessName.toLowerCase().includes(sellerSearch.toLowerCase());
      const matchesStatus = sellerStatusFilter === 'all' || s.status === sellerStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allSellers, sellerSearch, sellerStatusFilter]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
      const matchesStatus = productStatusFilter === 'all' || p.status === productStatusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [allProducts, productSearch, productCategoryFilter, productStatusFilter]);

  // --- HANDLERS ---
  const handleSellerStatusUpdate = async (sellerId: string, status: 'approved' | 'rejected' | 'suspended') => {
    try {
      await updateSellerStatus(sellerId, status);
      toast({ title: "Success", description: `Seller status updated to ${status}.` });
      fetchData(); // Refetch all data
      if (viewingSellerDetails) {
        setViewingSellerDetails(null); // Close dialog
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to update seller status." });
    }
  };

  const handleProductStatusUpdate = async (productId: string, status: 'approved' | 'rejected') => {
     try {
      await updateProductStatus(productId, status);
      toast({ title: "Success", description: `Product status updated to ${status}.` });
      fetchData(); // Refetch all data
      if (viewingProductDetails) {
        setViewingProductDetails(null); // Close dialog
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to update product status." });
    }
  };

  const handleViewSeller = async (sellerId: string) => {
    try {
      // This is the API call that fetches the detailed seller data
      const details = await getSellerDetailsForAdmin(sellerId);
      // Set the state which triggers the Dialog to open
      setViewingSellerDetails(details);
    } catch (error: any) {
      // If the API call fails (e.g., 404, network error, data corruption), this catches it
      toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to fetch seller details." });
      console.error("Seller details fetch error:", error);
      // Crucially, we prevent setting the state if the fetch failed, ensuring the dialog doesn't open with partial data.
      setViewingSellerDetails(null); 
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rejected':
      case 'suspended': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };


  if (isLoading || !user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            {/* --- ICON/FONT SIZE INCREASED --- */}
            <LoaderCircle className="h-20 w-20 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground text-lg">Loading Admin Panel...</p>
        </div>
    );
  }

  // WRAP EVERYTHING IN A SINGLE FRAGMENT (<>...</>) TO PREVENT JSX CRASH
  return (
    <>
      <div className="container mx-auto p-4 md:p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            {/* --- FONT SIZE INCREASED --- */}
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-base">Welcome, {user.name}!</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {/* --- ICON SIZE INCREASED --- */}
            <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white text-base"><ShieldCheck className="mr-2 h-6 w-6" />Admin Access</Badge>
            
            {/* --- UPDATED LOGOUT BUTTON --- */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                {/* --- ICON SIZE INCREASED --- */}
                <Button variant="outline" className="text-base">
                  <LogOut className="mr-2 h-6 w-6" /> Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be returned to the login page.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>Confirm Logout</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>
        
        <Tabs value={mainTab} onValueChange={setMainTab}>
          {/* --- TABS STYLING UPDATED --- */}
          <TabsList className="grid w-full grid-cols-3 bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-lg">
            <TabsTrigger value="dashboard" className="text-base data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md">Dashboard Stats</TabsTrigger>
            <TabsTrigger value="approvals" className="text-base data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md">Approvals ({pendingApprovalsCount})</TabsTrigger>
            <TabsTrigger value="management" className="text-base data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md">Management</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
              {/* --- STAT CARDS UPDATED (COLORS, SIZES) --- */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                  <Card className="cursor-pointer hover:bg-muted/50 border-l-4 border-blue-500" onClick={() => { setMainTab("management"); setManagementTab("users"); }}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-base font-medium">Total Users</CardTitle>
                          <Users className="h-6 w-6 text-blue-500" />
                      </CardHeader>
                      <CardContent><div className="text-3xl font-bold">{stats?.totalUsers}</div></CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:bg-muted/50 border-l-4 border-purple-500" onClick={() => { setMainTab("management"); setManagementTab("sellers"); }}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-base font-medium">Total Sellers</CardTitle>
                          <Package className="h-6 w-6 text-purple-500" />
                      </CardHeader>
                      <CardContent><div className="text-3xl font-bold">{stats?.totalSellers}</div></CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:bg-muted/50 border-l-4 border-green-500" onClick={() => { setMainTab("management"); setManagementTab("products"); }}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-base font-medium">Total Products</CardTitle>
                          <BarChart2 className="h-6 w-6 text-green-500" />
                      </CardHeader>
                      <CardContent><div className="text-3xl font-bold">{stats?.totalProducts}</div></CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:bg-muted/50 border-l-4 border-red-500" onClick={() => setMainTab("approvals")}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-base font-medium">Pending Approvals</CardTitle>
                          <Clock className="h-6 w-6 text-red-500" />
                      </CardHeader>
                      {/* --- PENDING COUNT STYLE UPDATED --- */}
                      <CardContent><div className={cn("text-3xl font-bold", pendingApprovalsCount > 0 ? "text-red-500" : "")}>{pendingApprovalsCount}</div></CardContent>
                  </Card>
              </div>

              {/* --- CHART SECTION UPDATED (Bar + Pie) --- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                      <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                              {/* --- FONT SIZE INCREASED --- */}
                              <CardTitle className="text-2xl">Growth Overview</CardTitle>
                              <CardDescription className="text-base">New users and products over time.</CardDescription>
                          </div>
                          <Select value={chartPeriod} onValueChange={(value) => setChartPeriod(value as any)}>
                              <SelectTrigger className="w-[180px] text-base"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="week" className="text-base">Last 7 Days</SelectItem>
                                  <SelectItem value="month" className="text-base">Last 30 Days</SelectItem>
                                  <SelectItem value="year" className="text-base">Last Year</SelectItem>
                              </SelectContent>
                          </Select>
                      </CardHeader>
                      <CardContent>
                          {/* --- CHART SIZE & FONT UPDATED --- */}
                          <ChartContainer config={chartConfig} className="h-[250px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={chartData}>
                                      <CartesianGrid vertical={false} />
                                      <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => chartPeriod === 'year' ? format(new Date(`${value}-02`), 'MMM') : format(new Date(value), 'd MMM')} className="text-sm"/>
                                      <YAxis tickLine={false} axisLine={false} className="text-sm"/>
                                      <ChartTooltip content={<ChartTooltipContent />} />
                                      <ChartLegend content={<ChartLegendContent />} />
                                      <Bar dataKey="users" fill="var(--color-users)" radius={4} />
                                      <Bar dataKey="products" fill="var(--color-products)" radius={4} />
                                  </BarChart>
                              </ResponsiveContainer>
                          </ChartContainer>
                      </CardContent>
                  </Card>
                  
                  <Card>
                      <CardHeader>
                          <CardTitle className="text-2xl">User Roles</CardTitle>
                          <CardDescription className="text-base">Customer vs. Seller breakdown.</CardDescription>
                      </CardHeader>
                      <CardContent className="flex items-center justify-center">
                          <ChartContainer config={pieChartConfig} className="h-[250px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                      <Tooltip content={<ChartTooltipContent hideLabel />} />
                                      <Pie
                                          data={pieData}
                                          dataKey="value"
                                          nameKey="name"
                                          cx="50%"
                                          cy="50%"
                                          outerRadius={100}
                                          fill="#8884d8"
                                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                          className="text-sm"
                                      >
                                          {pieData.map((_entry, index) => (
                                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                          ))}
                                      </Pie>
                                      <ChartLegend content={<ChartLegendContent />} />
                                  </PieChart>
                              </ResponsiveContainer>
                          </ChartContainer>
                      </CardContent>
                  </Card>
              </div>
          </TabsContent>

          <TabsContent value="approvals" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-8">
                  <Card>
                      {/* --- FONT SIZE INCREASED --- */}
                      <CardHeader><CardTitle className="text-2xl">Pending Seller Applications ({pending.sellers.length})</CardTitle></CardHeader>
                      <CardContent>
                          {pending.sellers.length > 0 ? (
                              <Table>
                                  {/* --- FONT SIZE INCREASED --- */}
                                  <TableHeader><TableRow><TableHead className="text-base w-[50px]">Sr. No</TableHead><TableHead className="text-base">Business Name</TableHead><TableHead className="text-right text-base">Actions</TableHead></TableRow></TableHeader>
                                  <TableBody>
                                      {pending.sellers.map((seller, index) => (
                                          <TableRow key={seller._id}>
                                              <TableCell className="text-base">{index + 1}</TableCell>
                                              <TableCell className="font-medium text-base">{seller.businessName}</TableCell>
                                              <TableCell className="text-right space-x-2">
                                                  {/* --- ICON/FONT SIZE INCREASED --- */}
                                                  <Button variant="outline" size="sm" onClick={() => handleViewSeller(seller._id)} className="text-base"><Eye className="mr-2 h-5 w-5"/>Review</Button>
                                                  <AlertDialog>
                                                      <AlertDialogTrigger asChild><Button size="sm" variant="destructive" className="text-base"><XCircle className="mr-2 h-5 w-5"/>Reject</Button></AlertDialogTrigger>
                                                      <AlertDialogContent>
                                                          <AlertDialogHeader><AlertDialogTitle>Reject Seller?</AlertDialogTitle><AlertDialogDescription>This will permanently reject {seller.businessName}'s application.</AlertDialogDescription></AlertDialogHeader>
                                                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleSellerStatusUpdate(seller._id, 'rejected')}>Confirm Reject</AlertDialogAction></AlertDialogFooter>
                                                      </AlertDialogContent>
                                                  </AlertDialog>
                                                  <AlertDialog>
                                                      <AlertDialogTrigger asChild><Button size="sm" className="bg-green-600 hover:bg-green-700 text-base"><CheckCircle className="mr-2 h-5 w-5"/>Approve</Button></AlertDialogTrigger>
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
                          ) : <p className="text-muted-foreground text-base">No pending seller applications.</p>}
                      </CardContent>
                  </Card>
                  <Card>
                      {/* --- FONT SIZE INCREASED --- */}
                      <CardHeader><CardTitle className="text-2xl">Pending Product Listings ({pending.products.length})</CardTitle></CardHeader>
                      <CardContent>
                           {pending.products.length > 0 ? (
                              <Table>
                                  {/* --- FONT SIZE INCREASED --- */}
                                  <TableHeader><TableRow><TableHead className="text-base w-[50px]">Sr. No</TableHead><TableHead className="text-base">Product</TableHead><TableHead className="text-base">Seller</TableHead><TableHead className="text-right text-base">Actions</TableHead></TableRow></TableHeader>
                                  <TableBody>
                                      {pending.products.map((product, index) => (
                                          <TableRow key={product._id}>
                                              <TableCell className="text-base">{index + 1}</TableCell>
                                              <TableCell className="font-medium text-base">{product.name}</TableCell>
                                              {/* @ts-ignore */}
                                              <TableCell className="text-base">{product.seller?.businessName || 'N/A'}</TableCell>
                                              <TableCell className="text-right space-x-2">
                                                  {/* --- ICON/FONT SIZE INCREASED --- */}
                                                  <Button variant="outline" size="sm" onClick={() => setViewingProductDetails(product)} className="text-base"><Eye className="mr-2 h-5 w-5"/>Review</Button>
                                                  <AlertDialog>
                                                      <AlertDialogTrigger asChild><Button size="sm" variant="destructive" className="text-base"><XCircle className="mr-2 h-5 w-5"/>Reject</Button></AlertDialogTrigger>
                                                      <AlertDialogContent>
                                                          <AlertDialogHeader><AlertDialogTitle>Reject Product?</AlertDialogTitle><AlertDialogDescription>This will reject the product "{product.name}".</AlertDialogDescription></AlertDialogHeader>
                                                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleProductStatusUpdate(product._id, 'rejected')}>Confirm Reject</AlertDialogAction></AlertDialogFooter>
                                                      </AlertDialogContent>
                                                  </AlertDialog>
                                                  <AlertDialog>
                                                      <AlertDialogTrigger asChild><Button size="sm" className="bg-green-600 hover:bg-green-700 text-base"><CheckCircle className="mr-2 h-5 w-5"/>Approve</Button></AlertDialogTrigger>
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
                          ) : <p className="text-muted-foreground text-base">No pending product listings.</p>}
                      </CardContent>
                  </Card>
              </div>
          </TabsContent>

          <TabsContent value="management" className="mt-6">
              <Tabs defaultValue={managementTab} onValueChange={setManagementTab}>
                  {/* --- TABS STYLING UPDATED --- */}
                  <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                      <TabsTrigger value="users" className="text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">Users ({allUsers.length})</TabsTrigger>
                      <TabsTrigger value="sellers" className="text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">Sellers ({allSellers.length})</TabsTrigger>
                      <TabsTrigger value="products" className="text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">Products ({allProducts.length})</TabsTrigger>
                  </TabsList>
                  <TabsContent value="users" className="mt-4">
                      <Card>
                          <CardHeader>
                              {/* --- FONT SIZE INCREASED --- */}
                              <CardTitle className="text-2xl">All Users</CardTitle>
                              <div className="flex items-center justify-between">
                                  <CardDescription className="text-base">List of all registered customers and sellers.</CardDescription>
                                  <Select value={userFilter} onValueChange={(value) => setUserFilter(value as any)}>
                                      <SelectTrigger className="w-[180px] text-base"><SelectValue /></SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="all" className="text-base">All Roles</SelectItem>
                                          <SelectItem value="customer" className="text-base">Customers</SelectItem>
                                          <SelectItem value="seller" className="text-base">Sellers</SelectItem>
                                      </SelectContent>
                                  </Select>
                              </div>
                          </CardHeader>
                          <CardContent>
                              <Table>
                                  {/* --- FONT SIZE INCREASED --- */}
                                  <TableHeader><TableRow><TableHead className="text-base w-[50px]">Sr. No</TableHead><TableHead className="text-base">Name</TableHead><TableHead className="text-base">Email</TableHead><TableHead className="text-base">Role</TableHead><TableHead className="text-base">Joined On</TableHead></TableRow></TableHeader>
                                  <TableBody>
                                      {filteredUsers.map((u, index) => (
                                          <TableRow key={u._id}>
                                              <TableCell className="text-base">{index + 1}</TableCell>
                                              <TableCell className="text-base">{u.name}</TableCell>
                                              <TableCell className="text-base">{u.email}</TableCell>
                                              <TableCell className="text-base"><Badge variant="outline" className="capitalize">{u.role}</Badge></TableCell>
                                              <TableCell className="text-base">{(u as any).createdAt ? format(new Date((u as any).createdAt), "PP") : 'N/A'}</TableCell>
                                          </TableRow>
                                      ))}
                                  </TableBody>
                              </Table>
                          </CardContent>
                      </Card>
                  </TabsContent>
                  <TabsContent value="sellers" className="mt-4">
                      <Card>
                          <CardHeader>
                              {/* --- FONT SIZE INCREASED --- */}
                              <CardTitle className="text-2xl">All Sellers</CardTitle>
                              <CardDescription className="text-base">Search and manage all sellers in the system.</CardDescription>
                              <div className="mt-4 flex items-center gap-4">
                                  <div className="relative flex-grow">
                                      {/* --- ICON SIZE INCREASED --- */}
                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                      <Input placeholder="Search by business name..." className="pl-10 text-base" value={sellerSearch} onChange={e => setSellerSearch(e.target.value)} />
                                  </div>
                                  <Select value={sellerStatusFilter} onValueChange={setSellerStatusFilter}>
                                      <SelectTrigger className="w-[180px] text-base"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="all" className="text-base">All Statuses</SelectItem>
                                          {['pending', 'approved', 'rejected', 'suspended'].map(status => (<SelectItem key={status} value={status} className="capitalize text-base">{status}</SelectItem>))}
                                      </SelectContent>
                                  </Select>
                              </div>
                          </CardHeader>
                          <CardContent>
                              <Table>
                                  {/* --- FONT SIZE INCREASED --- */}
                                  <TableHeader><TableRow><TableHead className="text-base w-[50px]">Sr. No</TableHead><TableHead className="text-base">Business Name</TableHead><TableHead className="text-base">Owner</TableHead><TableHead className="text-base">Status</TableHead><TableHead className="text-right text-base">Actions</TableHead></TableRow></TableHeader>
                                  <TableBody>
                                      {filteredSellers.map((s, index) => (
                                          <TableRow key={s._id}>
                                              <TableCell className="text-base">{index + 1}</TableCell>
                                              <TableCell className="text-base">{s.businessName}</TableCell>
                                              <TableCell className="text-base">{s.user?.name || 'N/A'}</TableCell> {/* Safer access */}
                                              <TableCell className="text-base"><Badge className={cn("capitalize", getStatusBadgeClass(s.status))}>{s.status}</Badge></TableCell>
                                              <TableCell className="text-right space-x-2">
                                                  {/* --- ICON/FONT SIZE INCREASED --- */}
                                                  <Button variant="ghost" size="sm" onClick={() => handleViewSeller(s._id)} className="text-base"><Eye className="h-5 w-5 mr-1"/>Details</Button>

                                                  {s.status !== 'approved' && (
                                                      <AlertDialog>
                                                          <AlertDialogTrigger asChild><Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={s.status === 'approved'}><CheckCircle className="h-5 w-5"/></Button></AlertDialogTrigger>
                                                          <AlertDialogContent>
                                                              <AlertDialogHeader><AlertDialogTitle>Approve Seller?</AlertDialogTitle><AlertDialogDescription>This will approve {s.businessName}.</AlertDialogDescription></AlertDialogHeader>
                                                              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleSellerStatusUpdate(s._id, 'approved')}>Confirm Approve</AlertDialogAction></AlertDialogFooter>
                                                          </AlertDialogContent>
                                                      </AlertDialog>
                                                  )}

                                                  {s.status !== 'rejected' && (
                                                      <AlertDialog>
                                                          <AlertDialogTrigger asChild><Button size="sm" variant="destructive" disabled={s.status === 'rejected'}><XCircle className="h-5 w-5"/></Button></AlertDialogTrigger>
                                                          <AlertDialogContent>
                                                              <AlertDialogHeader><AlertDialogTitle>Reject Seller?</AlertDialogTitle><AlertDialogDescription>This will reject {s.businessName}'s application.</AlertDialogDescription></AlertDialogHeader>
                                                              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleSellerStatusUpdate(s._id, 'rejected')}>Confirm Reject</AlertDialogAction></AlertDialogFooter>
                                                          </AlertDialogContent>
                                                      </AlertDialog>
                                                  )}
                                                  
                                                  {s.status === 'approved' && (
                                                     <AlertDialog>
                                                      <AlertDialogTrigger asChild><Button size="sm" variant="secondary"><ShieldAlert className="h-5 w-5" /></Button></AlertDialogTrigger>
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
                              {/* --- FONT SIZE INCREASED --- */}
                              <CardTitle className="text-2xl">All Products</CardTitle>
                              <CardDescription className="text-base">Search and manage all products in the system.</CardDescription>
                              <div className="mt-4 flex items-center gap-4">
                                  <div className="relative flex-grow">
                                      {/* --- ICON SIZE INCREASED --- */}
                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                      <Input placeholder="Search by product name..." className="pl-10 text-base" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                                  </div>
                                  <Select value={productCategoryFilter} onValueChange={setProductCategoryFilter}>
                                      <SelectTrigger className="w-[180px] text-base"><SelectValue placeholder="All Categories" /></SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="all" className="text-base">All Categories</SelectItem>
                                          {['ring', 'necklace', 'bracelet', 'earrings', 'watch', 'other'].map(cat => (<SelectItem key={cat} value={cat} className="capitalize text-base">{cat}</SelectItem>))}
                                      </SelectContent>
                                  </Select>
                                  <Select value={productStatusFilter} onValueChange={setProductStatusFilter}>
                                      <SelectTrigger className="w-[180px] text-base"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                                      <SelectContent>
                                          <SelectItem value="all" className="text-base">All Statuses</SelectItem>
                                          {['pending', 'approved', 'rejected', 'suspended'].map(status => (<SelectItem key={status} value={status} className="capitalize text-base">{status}</SelectItem>))}
                                      </SelectContent>
                                  </Select>
                              </div>
                          </CardHeader>
                          <CardContent>
                              <Table>
                                  {/* --- FONT SIZE INCREASED --- */}
                                  <TableHeader><TableRow><TableHead className="text-base w-[50px]">Sr. No</TableHead><TableHead className="text-base">Product</TableHead><TableHead className="text-base">Seller</TableHead><TableHead className="text-base">Price</TableHead><TableHead className="text-base">Status</TableHead><TableHead className="text-right text-base">Actions</TableHead></TableRow></TableHeader>
                                  <TableBody>
                                      {filteredProducts.map((p, index) => (
                                          <TableRow key={p._id}>
                                              <TableCell className="text-base">{index + 1}</TableCell>
                                              <TableCell className="text-base">{p.name}</TableCell>
                                              {/* @ts-ignore */}
                                              <TableCell className="text-base">{p.seller.name}</TableCell>
                                              <TableCell className="text-base">${p.price.toFixed(2)}</TableCell>
                                              <TableCell className="text-base"><Badge className={cn("capitalize", getStatusBadgeClass(p.status))}>{p.status}</Badge></TableCell>
                                              <TableCell className="text-right space-x-2">
                                                  {/* --- ICON/FONT SIZE INCREASED --- */}
                                                  <Button variant="ghost" size="sm" onClick={() => setViewingProductDetails(p)} className="text-base"><Eye className="h-5 w-5 mr-1"/>Review</Button>
                                                  {p.status !== 'rejected' && (
                                                  <AlertDialog>
                                                      <AlertDialogTrigger asChild><Button size="sm" variant="destructive" disabled={p.status === 'rejected'}><XCircle className="h-5 w-5"/></Button></AlertDialogTrigger>
                                                      <AlertDialogContent>
                                                          <AlertDialogHeader><AlertDialogTitle>Reject Product?</AlertDialogTitle><AlertDialogDescription>This will reject the product "{p.name}".</AlertDialogDescription></AlertDialogHeader>
                                                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleProductStatusUpdate(p._id, 'rejected')}>Confirm Reject</AlertDialogAction></AlertDialogFooter>
                                                      </AlertDialogContent>
                                                  </AlertDialog>
                                                  )}
                                                  {p.status !== 'approved' && (
                                                  <AlertDialog>
                                                      <AlertDialogTrigger asChild><Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={p.status === 'approved'}><CheckCircle className="h-5 w-5"/></Button></AlertDialogTrigger>
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
        </div>

      {/* Seller Details Dialog */}
      <Dialog open={!!viewingSellerDetails} onOpenChange={() => setViewingSellerDetails(null)}>
        <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
                {/* --- FONT SIZE INCREASED --- */}
                <DialogTitle className="text-2xl">{viewingSellerDetails?.seller.businessName}</DialogTitle>
                <DialogDescription className="text-base">
                    Review seller's profile, products, and history. Status: 
                    <Badge className={cn("capitalize ml-2", getStatusBadgeClass(viewingSellerDetails?.seller.status || ''))}>{viewingSellerDetails?.seller.status}</Badge>
                </DialogDescription>
            </DialogHeader>
            {/* --- ADDED NULL CHECK AND FALLBACK RENDERING FOR NESTED DATA --- */}
            {viewingSellerDetails && (
                <Tabs defaultValue="profile" className="flex-grow flex flex-col overflow-hidden">
                    <TabsList>
                        {/* --- FONT SIZE INCREASED --- */}
                        <TabsTrigger value="profile" className="text-base">Profile Details</TabsTrigger>
                        <TabsTrigger value="products" className="text-base">Products ({viewingSellerDetails.products.length})</TabsTrigger>
                        <TabsTrigger value="history" className="text-base">Account History</TabsTrigger>
                    </TabsList>
                    <ScrollArea className="flex-grow mt-4 pr-6">
                        <TabsContent value="profile">
                             {/* --- FONT SIZE INCREASED --- */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                                 <div><h4 className="font-semibold">Owner</h4><p className="text-muted-foreground">{viewingSellerDetails.seller.user.name} ({viewingSellerDetails.seller.user.email})</p></div>
                                 <div><h4 className="font-semibold">GST Number</h4><p className="text-muted-foreground">{viewingSellerDetails.seller.gstNumber || 'N/A'}</p></div>
                                 <div><h4 className="font-semibold">PAN Number</h4><p className="text-muted-foreground">{viewingSellerDetails.seller.panNumber || 'N/A'}</p></div>
                                 
                                 {/* --- Safer Address Rendering --- */}
                                 <div>
                                    <h4 className="font-semibold">Address</h4>
                                    {viewingSellerDetails.seller.address ? (
                                        <p className="text-muted-foreground">
                                            {`${viewingSellerDetails.seller.address.street || 'N/A'}, ${viewingSellerDetails.seller.address.city || 'N/A'}, ${viewingSellerDetails.seller.address.state || 'N/A'} - ${viewingSellerDetails.seller.address.pincode || 'N/A'}`}
                                        </p>
                                    ) : (
                                        <p className="text-muted-foreground">N/A</p>
                                    )}
                                 </div>
                                 
                                 <div className="col-span-full">
                                    <h4 className="font-semibold mb-2">Verification Documents</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <Card>
                                             <CardHeader><CardTitle className="text-base">GST Certificate</CardTitle></CardHeader>
                                             <CardContent>
                                                {/* --- SAFE GUARDED ACCESS + USING getImageUrl --- */}
                                                {viewingSellerDetails.seller.verificationDocuments?.gstCertificate ? (
                                                    <a href={getImageUrl(viewingSellerDetails.seller.verificationDocuments.gstCertificate)} target="_blank" rel="noopener noreferrer" className='inline-flex items-center text-primary hover:underline text-sm'>
                                                        <ExternalLink className="h-4 w-4 mr-2" /> View Document
                                                    </a>
                                                ) : (
                                                    <p className="text-muted-foreground">Not Provided</p>
                                                )}
                                             </CardContent>
                                         </Card>
                                         <Card>
                                             <CardHeader><CardTitle className="text-base">PAN Card</CardTitle></CardHeader>
                                             <CardContent>
                                                {/* --- SAFE GUARDED ACCESS + USING getImageUrl --- */}
                                                {viewingSellerDetails.seller.verificationDocuments?.panCard ? (
                                                     <a href={getImageUrl(viewingSellerDetails.seller.verificationDocuments.panCard)} target="_blank" rel="noopener noreferrer" className='inline-flex items-center text-primary hover:underline text-sm'>
                                                        <ExternalLink className="h-4 w-4 mr-2" /> View Document
                                                    </a>
                                                ) : (
                                                    <p className="text-muted-foreground">Not Provided</p>
                                                )}
                                             </CardContent>
                                         </Card>
                                     </div>
                                 </div>
                                </div>
                        </TabsContent>
                        <TabsContent value="products">
                           <Table>
                                {/* --- FONT SIZE INCREASED --- */}
                                <TableHeader><TableRow><TableHead className="text-base">Product</TableHead><TableHead className="text-base">Price</TableHead><TableHead className="text-base">Status</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {viewingSellerDetails.products.map(p => (
                                        <TableRow key={p._id}>
                                            <TableCell className="text-base"><div className="flex items-center gap-4"><img src={getImageUrl(p.images[0] || '')} alt={p.name} className="w-10 h-10 object-cover rounded-md border"/><span>{p.name}</span></div></TableCell>
                                            <TableCell className="text-base">${p.price.toFixed(2)}</TableCell>
                                            <TableCell className="text-base"><Badge className={cn("capitalize", getStatusBadgeClass(p.status))}>{p.status}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>
                        <TabsContent value="history">
                            <div className="space-y-4">
                                {viewingSellerDetails.history.length > 0 ? viewingSellerDetails.history.map(entry => (
                                    <Card key={entry._id}>
                                        <CardHeader>
                                            {/* --- FONT/ICON SIZE INCREASED --- */}
                                            <CardTitle className="text-lg flex items-center justify-between">
                                                <span>{entry.notes || 'Profile Update'}</span>
                                                <span className="text-sm font-normal text-muted-foreground flex items-center gap-2"><History className="h-4 w-4"/>{format(new Date(entry.createdAt), "PPpp")}</span>
                                            </CardTitle>
                                            {/* --- SAFELY ACCESS NAME --- */}
                                            <CardDescription className="text-base">Changed by: {entry.changedBy?.name || 'Unknown User'} ({entry.changedBy?.role || 'N/A'})</CardDescription>
                                        </CardHeader>
                                        {entry.changes.length > 0 && (
                                        <CardContent>
                                            <Table>
                                                {/* --- FONT SIZE INCREASED --- */}
                                                <TableHeader><TableRow><TableHead className="text-base">Field</TableHead><TableHead className="text-base">Old Value</TableHead><TableHead className="text-base">New Value</TableHead></TableRow></TableHeader>
                                                <TableBody>
                                                    {entry.changes.map((change, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell className="font-medium text-base">{change.field}</TableCell>
                                                            <TableCell className="text-red-400 text-base">{change.oldValue}</TableCell>
                                                            <TableCell className="text-green-400 text-base">{change.newValue}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                        )}
                                    </Card>
                                )) : <p className="text-muted-foreground">No history found for this seller.</p>}
                            </div>
                        </TabsContent>
                    </ScrollArea>
                    {/* --- ICON/FONT SIZE INCREASED --- */}
                    <div className="flex justify-end gap-2 pt-4 border-t mt-auto">
                        {/* Only show actions if seller exists and is not approved/rejected */}
                        {viewingSellerDetails.seller.status !== 'rejected' && (
                             <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="destructive" className="text-base"><XCircle className="mr-2 h-5 w-5"/>Reject</Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Reject Seller?</AlertDialogTitle><AlertDialogDescription>This will permanently reject {viewingSellerDetails.seller.businessName}'s application and reset their approval status.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleSellerStatusUpdate(viewingSellerDetails.seller._id, 'rejected')}>Confirm Reject</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        {viewingSellerDetails.seller.status === 'approved' && (
                             <AlertDialog>
                                <AlertDialogTrigger asChild><Button variant="secondary" className="text-base"><ShieldAlert className="mr-2 h-5 w-5"/>Suspend</Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Suspend Seller?</AlertDialogTitle><AlertDialogDescription>This will suspend {viewingSellerDetails.seller.businessName}'s selling privileges.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleSellerStatusUpdate(viewingSellerDetails.seller._id, 'suspended')}>Confirm Suspend</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        {viewingSellerDetails.seller.status !== 'approved' && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild><Button className="bg-green-600 hover:bg-green-700 text-base"><CheckCircle className="mr-2 h-5 w-5"/>Approve</Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Approve Seller?</AlertDialogTitle><AlertDialogDescription>This will approve {viewingSellerDetails.seller.businessName} and allow them to list products.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleSellerStatusUpdate(viewingSellerDetails.seller._id, 'approved')}>Confirm Approve</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </Tabs>
            )}
        </DialogContent>
      </Dialog>

      {/* Product Review Dialog (Unchanged, but now using getImageUrl) */}
      <Dialog open={!!viewingProductDetails} onOpenChange={() => setViewingProductDetails(null)}>
          <DialogContent className="sm:max-w-3xl">
              <DialogHeader>
                  {/* --- FONT SIZE INCREASED --- */}
                  <DialogTitle className="text-2xl">{viewingProductDetails?.name}</DialogTitle>
                  <DialogDescription className="text-base">
                      Reviewing product from {/* @ts-ignore */}
                      <strong>{viewingProductDetails?.seller?.businessName || viewingProductDetails?.seller?.name}</strong>. Status: 
                      <Badge className={cn("capitalize ml-2", getStatusBadgeClass(viewingProductDetails?.status || ''))}>{viewingProductDetails?.status}</Badge>
                  </DialogDescription>
              </DialogHeader>
              {viewingProductDetails && (
                  <div className="grid grid-cols-2 gap-6 pt-4">
                      <Carousel className="col-span-2 sm:col-span-1 relative">
                          <CarouselContent>
                              {viewingProductDetails.images.length > 0 ? (
                                  viewingProductDetails.images.map((img, idx) => (
                                      <CarouselItem key={idx}>
                                          <img src={getImageUrl(img)} alt={`${viewingProductDetails.name} ${idx+1}`} className="w-full h-64 object-cover rounded-md border" />
                                      </CarouselItem>
                                  ))
                              ) : (
                                  <CarouselItem>
                                      <div className="w-full h-64 flex items-center justify-center bg-muted rounded-md border">
                                          <p className="text-muted-foreground">No Image</p>
                                      </div>
                                  </CarouselItem>
                              )}
                          </CarouselContent>
                          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                      </Carousel>
                      {/* --- FONT SIZE INCREASED --- */}
                      <div className="space-y-4 text-base col-span-2 sm:col-span-1">
                          <div><h4 className="font-semibold">Description</h4><p className="text-muted-foreground">{viewingProductDetails.description}</p></div>
                          <div><h4 className="font-semibold">Price</h4><p className="text-muted-foreground">${viewingProductDetails.price.toFixed(2)}</p></div>
                          <div><h4 className="font-semibold">Brand</h4><p className="text-muted-foreground">{viewingProductDetails.brand}</p></div>
                          <div><h4 className="font-semibold">Material</h4><p className="text-muted-foreground">{viewingProductDetails.material}</p></div>
                          <div><h4 className="font-semibold">Category</h4><p className="text-muted-foreground capitalize">{viewingProductDetails.category}</p></div>
                      </div>
                  </div>
              )}
               {/* --- ICON/FONT SIZE INCREASED --- */}
               <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                  <Button variant="destructive" onClick={() => viewingProductDetails && handleProductStatusUpdate(viewingProductDetails._id, 'rejected')} className="text-base"><XCircle className="mr-2 h-5 w-5"/>Reject Product</Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-base" onClick={() => viewingProductDetails && handleProductStatusUpdate(viewingProductDetails._id, 'approved')}><CheckCircle className="mr-2 h-5 w-5"/>Approve Product</Button>
              </div>
          </DialogContent>
      </Dialog>
    </>
  );
}