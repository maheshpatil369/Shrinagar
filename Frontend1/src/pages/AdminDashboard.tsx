// maheshpatil369/shrinagar/Shrinagar-b9ec823c114ce2847f5e61759f8372f4bfe46c3b/Frontend1/src/pages/AdminDashboard.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// --- UPDATED IMPORTS (Using relative paths) ---
import { getCurrentUser, User } from "../lib/auth";
import { useUser } from "../context/UserContext";
import { Product } from "../lib/products";
import { Seller } from "../lib/seller";
import {
  getAdminDashboardStats,
  getPendingApprovals,
  updateSellerStatus,
  updateProductStatus,
  getSellerDetailsForAdmin,
  adminGetAllUsers,
  adminGetAllSellers,
  adminGetAllProducts,
  getAdminChartData,
  SellerHistory,
  // --- NEW IMPORTS ---
  adminGetAllReviews,
  adminDeleteReview,
  AdminReview,
} from "../lib/admin";

// --- UI IMPORTS (Using relative paths) ---
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Input } from "../components/ui/input";
import { useToast } from "../hooks/use-toast";
import { Badge } from "../components/ui/badge";
import {
  ShieldCheck,
  LoaderCircle,
  Users,
  Package,
  BarChart2,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  ShieldAlert,
  History,
  Search,
  LogOut,
  Maximize,
  Trash2,
  MessageSquare, // Added MessageSquare icon for Reviews
  Copy, // Added Copy icon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { cn, getImageUrl } from "../lib/utils";
import Rating from "../components/ui/Rating"; // Import Rating component


// Types
type ViewingSellerDetails = {
  seller: Seller;
  products: Product[];
  history: SellerHistory[];
};

type DocumentPreview = {
  title: string;
  url: string;
} | null;

// Chart configs (keeps your original values)
const chartConfig = {
  users: { label: "Users", color: "#3b82f6" },
  products: { label: "Products", color: "#ec4899" },
} satisfies import("../components/ui/chart").ChartConfig;

const pieChartConfig = {
  customers: { label: "Customers", color: "#60a5fa" },
  sellers: { label: "Sellers", color: "#c084fc" },
};
const PIE_COLORS = [pieChartConfig.customers.color, pieChartConfig.sellers.color];

// Utility function to copy text to clipboard (using deprecated execCommand for iFrame compatibility)
const copyToClipboard = (text: string, toast: ReturnType<typeof useToast>['toast']) => {
  try {
    const input = document.createElement('textarea');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    toast({
      title: "Copied!",
      description: "Product ID copied to clipboard.",
      duration: 2000,
    });
  } catch (err) {
    console.error('Failed to copy text', err);
    toast({
      variant: "destructive",
      title: "Copy Failed",
      description: "Could not copy ID.",
      duration: 2000,
    });
  }
};


export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<{ sellers: Seller[]; products: Product[] }>({ sellers: [], products: [] });
  const [mainTab, setMainTab] = useState("dashboard");
  const [managementTab, setManagementTab] = useState("users");

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allSellers, setAllSellers] = useState<Seller[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  // --- NEW STATE FOR REVIEWS ---
  const [allReviews, setAllReviews] = useState<AdminReview[]>([]);

  const [userFilter, setUserFilter] = useState("all");
  const [sellerSearch, setSellerSearch] = useState("");
  const [sellerStatusFilter, setSellerStatusFilter] = useState("all");
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  // --- NEW STATE FOR REVIEW SEARCH ---
  const [reviewSearch, setReviewSearch] = useState("");

  const [viewingSellerDetails, setViewingSellerDetails] = useState<ViewingSellerDetails | null>(null);
  const [viewingProductDetails, setViewingProductDetails] = useState<Product | null>(null);
  const [documentToPreview, setDocumentToPreview] = useState<DocumentPreview>(null);

  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [chartData, setChartData] = useState<any[]>([]);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { logoutUser } = useUser();

  // Helper function to find seller name by ID (used for display in reviews table)
  const getSellerNameById = (sellerId: string): string => {
    const seller = allSellers.find(s => (s as any).user?._id === sellerId);
    return seller?.businessName || seller?.user?.name || 'Unknown Seller';
  };

  // Fetchers
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, pendingData, usersData, sellersData, productsData, reviewsData] = await Promise.all([
        getAdminDashboardStats(),
        getPendingApprovals(),
        adminGetAllUsers(),
        adminGetAllSellers(),
        adminGetAllProducts(),
        adminGetAllReviews(), // --- NEW FETCH ---
      ]);
      setStats(statsData);
      setPending(pendingData);
      setAllUsers(usersData);
      setAllSellers(sellersData);
      setAllProducts(productsData);
      setAllReviews(reviewsData); // --- SET NEW STATE ---
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
      fetchChartData(chartPeriod);
    } else {
      navigate('/auth');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    if (user) fetchChartData(chartPeriod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartPeriod, user]);

  const pendingApprovalsCount = useMemo(() => {
    return (pending.sellers.length + pending.products.length) || (stats?.pendingApprovals || 0);
  }, [pending, stats]);

  const pieData = useMemo(() => {
    const customers = Math.max(0, (stats?.totalUsers || 0) - (stats?.totalSellers || 0));
    const sellers = stats?.totalSellers || 0;
    return [
      { name: "Customers", value: customers },
      { name: "Sellers", value: sellers },
    ];
  }, [stats]);

  const handleLogout = () => {
    logoutUser();
    navigate("/auth");
    toast({ title: "Logged Out", description: "You have been logged out." });
  };

  // Filters
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => userFilter === 'all' || u.role === userFilter);
  }, [allUsers, userFilter]);

  const filteredSellers = useMemo(() => {
    return allSellers.filter(s => {
      const matchesSearch = s.businessName?.toLowerCase()?.includes(sellerSearch.toLowerCase()) ?? false;
      const matchesStatus = sellerStatusFilter === 'all' || s.status === sellerStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allSellers, sellerSearch, sellerStatusFilter]);

  const filteredProducts = useMemo(() => {
    const searchLower = productSearch.toLowerCase();
    return allProducts.filter(p => {
      // Search by product name OR product ID
      const matchesSearch = p.name?.toLowerCase()?.includes(searchLower) || p._id.toLowerCase().includes(searchLower);
      const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
      const matchesStatus = productStatusFilter === 'all' || p.status === productStatusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [allProducts, productSearch, productCategoryFilter, productStatusFilter]);

  // --- NEW FILTERED REVIEWS ---
  const filteredReviews = useMemo(() => {
      const searchLower = reviewSearch.toLowerCase();
      return allReviews.filter(r =>
          r.productName?.toLowerCase().includes(searchLower) ||
          r.userName?.toLowerCase().includes(searchLower) ||
          r.comment?.toLowerCase().includes(searchLower) ||
          r.productId?.toLowerCase().includes(searchLower) // Added product ID search
      );
  }, [allReviews, reviewSearch]);


  // Handlers
  const handleSellerStatusUpdate = async (sellerId: string, status: 'approved' | 'rejected' | 'suspended') => {
    try {
      await updateSellerStatus(sellerId, status);
      toast({ title: "Success", description: `Seller status updated to ${status}.` });
      await fetchData();
      setViewingSellerDetails(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error?.response?.data?.message || "Failed to update seller status." });
    }
  };

  const handleProductStatusUpdate = async (productId: string, status: 'approved' | 'rejected') => {
    try {
      await updateProductStatus(productId, status);
      toast({ title: "Success", description: `Product status updated to ${status}.` });
      await fetchData();
      setViewingProductDetails(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error?.response?.data?.message || "Failed to update product status." });
    }
  };

  // --- NEW REVIEW DELETE HANDLER ---
  const handleDeleteReview = async (productId: string, reviewId: string) => {
      try {
          await adminDeleteReview(productId, reviewId);
          toast({ title: "Success", description: "Review deleted successfully." });
          await fetchData(); // Refetch data
      } catch (error: any) {
          toast({ variant: "destructive", title: "Error", description: error?.response?.data?.message || "Failed to delete review." });
      }
  }


  const handleViewSeller = async (sellerId: string) => {
    try {
      const details = await getSellerDetailsForAdmin(sellerId);
      // Expected structure: { seller, products, history }
      setViewingSellerDetails(details);
    } catch (error: any) {
      console.error("Error fetching seller details:", error);
      toast({ variant: "destructive", title: "Error", description: error?.response?.data?.message || "Failed to fetch seller details." });
      setViewingSellerDetails(null);
    }
  };

  const handleDocumentPreview = (title: string, path: string) => {
    const url = getImageUrl(path);
    setDocumentToPreview({ title, url });
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
        <LoaderCircle className="h-20 w-20 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground text-lg">Loading Admin Panel...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto p-4 md:p-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 sm:gap-0">
          <div>
            {/* Added breakpoint font size for better mobile scaling */}
            <h1 className="text-3xl sm:text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-base">Welcome, {user.name}!</p>
          </div>
          <div className="flex items-center gap-4">
            {/* <ThemeToggle /> */}
            <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white text-base"><ShieldCheck className="mr-2 h-6 w-6" />Admin </Badge>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-base">
                  <LogOut className="mr-2 h-6 w-6" /> Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                  <AlertDialogDescription>You will be returned to the login page.</AlertDialogDescription>
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
          {/* Tabs List now has smaller text on small screens */}
          <TabsList className="grid w-full grid-cols-3 bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-lg">
            <TabsTrigger value="dashboard" className="text-sm sm:text-base data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md">Dashboard Stats</TabsTrigger>
            <TabsTrigger value="approvals" className="text-sm sm:text-base data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md">Approvals ({pendingApprovalsCount})</TabsTrigger>
            <TabsTrigger value="management" className="text-sm sm:text-base data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md">Management</TabsTrigger>
          </TabsList>

          {/* ----------------- DASHBOARD ----------------- */}
        <TabsContent value="dashboard" className="mt-6">

  {/* ====== TOP CARDS (Users / Sellers / Products / Approvals) ====== */}
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">

    {/* Total Users */}
    <Card
      className="cursor-pointer hover:bg-muted/50 border-l-4 border-blue-500"
      onClick={() => { setMainTab("management"); setManagementTab("users"); }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 sm:h-8 sm:w-8 text-blue-500" />
          <CardTitle className="text-xl sm:text-2xl font-semibold">Total Users</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-3xl sm:text-4xl font-bold">{stats?.totalUsers}</div>
      </CardContent>
    </Card>

    {/* Total Sellers */}
    <Card
      className="cursor-pointer hover:bg-muted/50 border-l-4 border-purple-500"
      onClick={() => { setMainTab("management"); setManagementTab("sellers"); }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Package className="h-7 w-7 sm:h-8 sm:w-8 text-purple-500" />
          <CardTitle className="text-xl sm:text-2xl font-semibold">Total Sellers</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-3xl sm:text-4xl font-bold">{stats?.totalSellers}</div>
      </CardContent>
    </Card>

    {/* Total Products */}
    <Card
      className="cursor-pointer hover:bg-muted/50 border-l-4 border-green-500"
      onClick={() => { setMainTab("management"); setManagementTab("products"); }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <BarChart2 className="h-7 w-7 sm:h-8 sm:w-8 text-green-500" />
          <CardTitle className="text-xl sm:text-2xl font-semibold">Total Products</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-3xl sm:text-4xl font-bold">{stats?.totalProducts}</div>
      </CardContent>
    </Card>

    {/* Pending Approvals */}
    <Card
      className="cursor-pointer hover:bg-muted/50 border-l-4 border-red-500"
      onClick={() => setMainTab("approvals")}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-red-500" />
          <CardTitle className="text-xl sm:text-2xl font-semibold">Pending Approvals</CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div
          className={cn(
            "text-3xl sm:text-4xl font-bold",
            pendingApprovalsCount > 0 ? "text-red-500" : ""
          )}
        >
          {pendingApprovalsCount}
        </div>
      </CardContent>
    </Card>
  </div>


  {/* ====== CHARTS SECTION ====== */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

    {/* Growth Overview Chart */}
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="w-full flex items-center justify-between flex-col sm:flex-row gap-4 sm:gap-0">

          <div className="flex flex-col">
            <CardTitle className="text-2xl">Growth Overview</CardTitle>
            <CardDescription className="text-base">
              New users and products over time.
            </CardDescription>
          </div>

          <Select
            value={chartPeriod}
            onValueChange={(value) => setChartPeriod(value as any)}
          >
            <SelectTrigger className="w-full sm:w-[150px] text-base">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) =>
                  chartPeriod === "year"
                    ? format(new Date(`${value}-02`), "MMM")
                    : format(new Date(value), "d MMM")
                }
              />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />

              <Bar dataKey="users" fill="var(--color-users)" radius={4} />
              <Bar dataKey="products" fill="var(--color-products)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>

    {/* Pie Chart */}
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">User Roles</CardTitle>
        <CardDescription className="text-base">
          Customer vs. Seller breakdown.
        </CardDescription>
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
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {pieData.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
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


          {/* ----------------- APPROVALS ----------------- */}
          <TabsContent value="approvals" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader><CardTitle className="text-xl sm:text-2xl">Pending Seller Applications ({pending.sellers.length})</CardTitle></CardHeader>
                {/* Ensure table scrolls horizontally */}
                <CardContent className="overflow-x-auto">
                  {pending.sellers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-base w-[50px]">Sr. No</TableHead>
                          <TableHead className="text-base">Business Name</TableHead>
                          <TableHead className="text-right text-base">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pending.sellers.map((seller, index) => (
                          <TableRow key={seller._id}>
                            <TableCell className="text-sm">{index + 1}</TableCell>
                            <TableCell className="font-medium text-sm">{seller.businessName}</TableCell>
                            <TableCell className="text-right space-x-2 whitespace-nowrap">
                              <Button variant="outline" size="sm" onClick={() => handleViewSeller(seller._id)} className="text-xs sm:text-base"><Eye className="mr-2 h-4 w-4" />Review</Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button size="sm" variant="destructive" className="text-xs sm:text-base"><XCircle className="mr-2 h-4 w-4" />Reject</Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Seller?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently reject {seller.businessName}'s application.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleSellerStatusUpdate(seller._id, 'rejected')}>Confirm Reject</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs sm:text-base"><CheckCircle className="mr-2 h-4 w-4" />Approve</Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Approve Seller?</AlertDialogTitle>
                                    <AlertDialogDescription>This will allow {seller.businessName} to start listing products.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleSellerStatusUpdate(seller._id, 'approved')}>Confirm Approve</AlertDialogAction>
                                  </AlertDialogFooter>
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
                <CardHeader><CardTitle className="text-xl sm:text-2xl">Pending Product Listings ({pending.products.length})</CardTitle></CardHeader>
                {/* Ensure table scrolls horizontally */}
                <CardContent className="overflow-x-auto">
                  {pending.products.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-base w-[50px]">Sr. No</TableHead>
                          <TableHead className="text-base">Product</TableHead>
                          <TableHead className="text-base">Seller</TableHead>
                          <TableHead className="text-right text-base">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pending.products.map((product, index) => (
                          <TableRow key={product._id}>
                            <TableCell className="text-sm">{index + 1}</TableCell>
                            <TableCell className="font-medium text-sm">{product.name}</TableCell>
                            <TableCell className="text-sm">{(product as any).seller?.businessName || 'N/A'}</TableCell>
                            <TableCell className="text-right space-x-2 whitespace-nowrap">
                              <Button variant="outline" size="sm" onClick={() => setViewingProductDetails(product)} className="text-xs sm:text-base"><Eye className="mr-2 h-4 w-4" />Review</Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button size="sm" variant="destructive" className="text-xs sm:text-base"><XCircle className="mr-2 h-4 w-4" />Reject</Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reject Product?</AlertDialogTitle>
                                    <AlertDialogDescription>This will reject the product "{product.name}".</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleProductStatusUpdate(product._id, 'rejected')}>Confirm Reject</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild><Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs sm:text-base"><CheckCircle className="mr-2 h-4 w-4" />Approve</Button></AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Approve Product?</AlertDialogTitle>
                                    <AlertDialogDescription>This will make "{product.name}" visible to all buyers.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleProductStatusUpdate(product._id, 'approved')}>Confirm Approve</AlertDialogAction>
                                  </AlertDialogFooter>
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

          {/* ----------------- MANAGEMENT (Users / Sellers / Products / Reviews) ----------------- */}
          <TabsContent value="management" className="mt-6">
            <Tabs defaultValue={managementTab} onValueChange={setManagementTab}>
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <TabsTrigger value="users" className="text-xs sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">Users ({allUsers.length})</TabsTrigger>
                <TabsTrigger value="sellers" className="text-xs sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">Sellers ({allSellers.length})</TabsTrigger>
                <TabsTrigger value="products" className="text-xs sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">Products ({allProducts.length})</TabsTrigger>
                   {/* --- NEW TAB --- */}
                <TabsTrigger value="reviews" className="text-xs sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md">Reviews ({allReviews.length})</TabsTrigger>
              </TabsList>

              {/* USERS */}
              <TabsContent value="users" className="mt-4">
                <Card className="shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-2xl font-semibold">All Users</CardTitle>
                        <CardDescription className="text-base">List of all customers and sellers registered in the system.</CardDescription>
                      </div>

                      <Select value={userFilter} onValueChange={(v) => setUserFilter(v as any)}>
                        <SelectTrigger className="w-full sm:w-[180px] text-base shadow-sm hover:shadow-md transition">
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="customer" className="capitalize">Customer</SelectItem>
                          <SelectItem value="seller" className="capitalize">Seller</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>

                  {/* Ensure table scrolls horizontally */}
                  <CardContent className="overflow-x-auto rounded-lg border">
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/70 transition">
                          <TableHead className="text-base w-[80px]">Sr. No.</TableHead>
                          <TableHead className="text-base">Name</TableHead>
                          <TableHead className="text-base">Email</TableHead>
                          <TableHead className="text-base">Role</TableHead>
                          <TableHead className="text-base">Joined On</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((u, index) => (
                            <TableRow key={u._id} className="hover:bg-muted/40 transition cursor-pointer">
                              <TableCell className="text-sm font-medium">{index + 1}</TableCell>
                              <TableCell className="text-sm">{u.name}</TableCell>
                              <TableCell className="text-sm text-primary hover:underline">{u.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className={`capitalize text-xs px-2 py-1 rounded-full border
                                  ${u.role === "customer" ? "border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-900/20" : ""}
                                  ${u.role === "seller" ? "border-purple-400 text-purple-600 bg-purple-50 dark:bg-purple-900/20" : ""}`}>
                                  {u.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm font-normal text-muted-foreground whitespace-nowrap">
                                {(u as any).createdAt ? format(new Date((u as any).createdAt), "PP") : "N/A"}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">No users found for this filter.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SELLERS */}
              <TabsContent value="sellers" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">All Sellers</CardTitle>
                    <CardDescription className="text-base">Search and manage all sellers in the system.</CardDescription>
                    {/* Filter bar stacks correctly on small screens */}
                    <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                      <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input placeholder="Search by business name..." className="pl-10 text-base" value={sellerSearch} onChange={e => setSellerSearch(e.target.value)} />
                      </div>
                      <Select value={sellerStatusFilter} onValueChange={setSellerStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] text-base"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-base">All Statuses</SelectItem>
                          {['pending', 'approved', 'rejected', 'suspended'].map(status => (<SelectItem key={status} value={status} className="capitalize text-base">{status}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  {/* Ensure table scrolls horizontally */}
                  <CardContent className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-base w-[50px]">Sr. No</TableHead>
                          <TableHead className="text-base">Business Name</TableHead>
                          <TableHead className="text-base">Owner</TableHead>
                          <TableHead className="text-base">Status</TableHead>
                          <TableHead className="text-right text-base">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSellers.map((s, index) => (
                          <TableRow key={s._id}>
                            <TableCell className="text-sm">{index + 1}</TableCell>
                            <TableCell className="text-sm">{s.businessName}</TableCell>
                            <TableCell className="text-sm">{s.user?.name || 'N/A'}</TableCell>
                            <TableCell className="text-sm"><Badge className={cn("capitalize text-xs px-2 py-1", getStatusBadgeClass(s.status))}>{s.status}</Badge></TableCell>
                            <TableCell className="text-right space-x-2 whitespace-nowrap">
                              <Button variant="outline" size="sm" onClick={() => handleViewSeller(s._id)} className="text-xs"><Eye className="h-4 w-4 mr-1" />Details</Button>

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

              {/* PRODUCTS (management) */}
              <TabsContent value="products" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">All Products</CardTitle>
                    <CardDescription className="text-base">Search and manage all products in the system.</CardDescription>
                    {/* Filter bar stacks correctly on small screens */}
                    <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                      <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        {/* Updated placeholder to include ID search */}
                        <Input placeholder="Search by product name or ID..." className="pl-10 text-base" value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                      </div>
                      <Select value={productCategoryFilter} onValueChange={setProductCategoryFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] text-base"><SelectValue placeholder="All Categories" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-base">All Categories</SelectItem>
                          {['ring', 'necklace', 'bracelet', 'earrings', 'watch', 'other'].map(cat => (<SelectItem key={cat} value={cat} className="capitalize text-base">{cat}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <Select value={productStatusFilter} onValueChange={setProductStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px] text-base"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" className="text-base">All Statuses</SelectItem>
                          {['pending', 'approved', 'rejected', 'suspended'].map(status => (<SelectItem key={status} value={status} className="capitalize text-base">{status}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  {/* Ensure table scrolls horizontally */}
                  <CardContent className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-base w-[50px]">Sr. No</TableHead>
                          <TableHead className="text-base">Product</TableHead>
                          {/* Added Seller Column */}
                          <TableHead className="text-base">Seller</TableHead>
                          <TableHead className="text-base">Price</TableHead>
                          <TableHead className="text-base">Status</TableHead>
                          <TableHead className="text-right text-base">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((p, index) => (
                          <TableRow key={p._id}>
                            <TableCell className="text-sm">{index + 1}</TableCell>
                            <TableCell className="text-sm">{p.name}</TableCell>
                            {/* Display Seller Name (using populated value from backend) */}
                            <TableCell className="text-xs sm:text-sm">{(p as any).seller?.name || 'N/A'}</TableCell>
                            <TableCell className="text-sm">₹{p.price.toFixed(2)}</TableCell>
                            <TableCell className="text-sm"><Badge className={cn("capitalize text-xs px-2 py-1", getStatusBadgeClass(p.status))}>{p.status}</Badge></TableCell>
                            <TableCell className="text-right space-x-2 whitespace-nowrap">
                              <Button variant="ghost" size="sm" onClick={() => setViewingProductDetails(p)} className="text-xs"><Eye className="h-4 w-4 mr-1" />Review</Button>

                              {p.status !== 'rejected' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild><Button size="sm" variant="destructive" disabled={p.status === 'rejected'}><XCircle className="h-4 w-4" /></Button></AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Reject Product?</AlertDialogTitle><AlertDialogDescription>This will reject the product "{p.name}".</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleProductStatusUpdate(p._id, 'rejected')}>Confirm Reject</AlertDialogAction></AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}

                              {p.status !== 'approved' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild><Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={p.status === 'approved'}><CheckCircle className="h-4 w-4" /></Button></AlertDialogTrigger>
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
               {/* --- NEW REVIEWS TAB --- */}
               <TabsContent value="reviews" className="mt-4">
                  <Card>
                      <CardHeader>
                          <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                            <MessageSquare className="h-6 w-6" /> All Customer Reviews
                          </CardTitle>
                          <CardDescription className="text-sm sm:text-base">Manage and moderate all product reviews across the marketplace.</CardDescription>
                          <div className="mt-4 relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              {/* Updated placeholder to include ID search */}
                              <Input
                                  placeholder="Search by product name, user, comment, or product ID..."
                                  className="pl-10 text-base"
                                  value={reviewSearch}
                                  onChange={e => setReviewSearch(e.target.value)}
                              />
                          </div>
                      </CardHeader>
                      <CardContent>
                          {/* Ensure table scrolls horizontally */}
                          <div className="overflow-x-auto">
                              <Table>
                                  <TableHeader>
                                      <TableRow>
                                          <TableHead className="text-sm w-[50px]">Sr. No</TableHead>
                                          {/* Added Product ID column */}
                                          <TableHead className="text-sm w-[150px]">Product ID</TableHead>
                                          <TableHead className="text-sm w-[200px]">Product Name</TableHead>
                                          <TableHead className="text-sm w-[100px]">Rating</TableHead>
                                          <TableHead className="text-sm">Comment</TableHead>
                                          <TableHead className="text-sm w-[120px]">User</TableHead>
                                          <TableHead className="text-right text-sm w-[80px]">Delete</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {filteredReviews.length > 0 ? (
                                          filteredReviews.map((review, index) => (
                                              <TableRow key={review._id}>
                                                  <TableCell className="text-xs sm:text-sm">{index + 1}</TableCell>
                                                  {/* Display Product ID with Copy Button */}
                                                  <TableCell className="text-xs font-mono flex items-center space-x-1 whitespace-nowrap">
                                                      <span className="truncate max-w-[120px]">{review.productId}</span>
                                                      <Button
                                                          variant="ghost"
                                                          size="icon"
                                                          className="h-6 w-6 text-primary hover:bg-primary/10"
                                                          onClick={() => copyToClipboard(review.productId, toast)}
                                                      >
                                                          <Copy className="h-3.5 w-3.5" />
                                                      </Button>
                                                  </TableCell>
                                                  <TableCell className="font-medium text-xs sm:text-sm">{review.productName}</TableCell>
                                                  <TableCell className="whitespace-nowrap">
                                                      <Rating value={review.rating} />
                                                  </TableCell>
                                                  <TableCell className="text-xs sm:text-sm max-w-[150px] truncate">{review.comment}</TableCell>
                                                  <TableCell className="text-xs sm:text-sm text-muted-foreground">{review.userName}</TableCell>
                                                  <TableCell className="text-right">
                                                      <AlertDialog>
                                                          <AlertDialogTrigger asChild>
                                                              <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-700 h-8 w-8">
                                                                  <Trash2 className="h-4 w-4" />
                                                              </Button>
                                                          </AlertDialogTrigger>
                                                          <AlertDialogContent>
                                                              <AlertDialogHeader>
                                                                  <AlertDialogTitle>Confirm Deletion?</AlertDialogTitle>
                                                                  <AlertDialogDescription>
                                                                      You are about to delete a review for **{review.productName}** by {review.userName}. This action is irreversible.
                                                                  </AlertDialogDescription>
                                                              </AlertDialogHeader>
                                                              <AlertDialogFooter>
                                                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                  <AlertDialogAction
                                                                      onClick={() => handleDeleteReview(review.productId, review._id)}
                                                                      className="bg-destructive hover:bg-destructive/90"
                                                                  >
                                                                      Delete Review
                                                                  </AlertDialogAction>
                                                              </AlertDialogFooter>
                                                          </AlertDialogContent>
                                                      </AlertDialog>
                                                  </TableCell>
                                              </TableRow>
                                          ))
                                      ) : (
                                          <TableRow>
                                              <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">No reviews found matching your search or filters.</TableCell>
                                          </TableRow>
                                      )}
                                  </TableBody>
                              </Table>
                          </div>
                      </CardContent>
                  </Card>
               </TabsContent>
               {/* --- END NEW REVIEWS TAB --- */}
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

    {/* ===================== SELLER DETAILS DIALOG (UPDATED CLEAN VERSION) ===================== */}
<Dialog open={!!viewingSellerDetails} onOpenChange={() => setViewingSellerDetails(null)}>
  <DialogContent
    className="
      sm:max-w-5xl
      w-[95vw]
      max-h-[92vh]
      flex flex-col
      overflow-y-auto
      rounded-xl
      shadow-2xl
      p-4 sm:p-6 /* Reduced padding on small screens */
      bg-white
    "
  >

    {/* ================= HEADER ================= */}
    <DialogHeader className="border-b pb-4">
      <DialogTitle className="text-2xl sm:text-3xl font-bold">
        {viewingSellerDetails?.seller.businessName}
      </DialogTitle>

      <DialogDescription className="text-sm sm:text-base flex items-center gap-2">
        Seller Details & Verification
        <Badge
          className={cn(
            "capitalize ml-2 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm rounded-full",
            getStatusBadgeClass(viewingSellerDetails?.seller.status || "")
          )}
        >
          {viewingSellerDetails?.seller.status}
        </Badge>
      </DialogDescription>
    </DialogHeader>

    {/* ================= BODY ================= */}
    {viewingSellerDetails && (
      <div className="flex flex-col flex-grow min-h-0">

        <Tabs defaultValue="profile" className="flex flex-col flex-grow min-h-0">

          {/* ---- TABS ---- */}
          <TabsList className="grid grid-cols-3 p-1 mb-4 bg-gray-100 rounded-xl shadow-inner text-sm">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="products">Products ({viewingSellerDetails.products.length})</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* ===================================================================================== */}
          {/* ================================= PROFILE TAB ====================================== */}
          {/* ===================================================================================== */}

          <TabsContent value="profile" className="flex-grow min-h-0">
            <div className="h-full overflow-y-auto pr-3 pb-6 custom-scrollbar">

              {/* RENDER GRID RESPONSIVELY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* OWNER INFORMATION */}
                <Card className="shadow-md border rounded-xl">
                  <CardHeader><CardTitle className="text-lg sm:text-xl">Owner Information</CardTitle></CardHeader>
                  <CardContent className="text-sm sm:text-base space-y-2">
                    <p><strong>Name:</strong> {viewingSellerDetails.seller.user?.name || "N/A"}</p>
                    <p><strong>Email:</strong> {viewingSellerDetails.seller.user?.email || "N/A"}</p>
                  </CardContent>
                </Card>

                {/* BUSINESS INFORMATION */}
                <Card className="shadow-md border rounded-xl">
                  <CardHeader><CardTitle className="text-lg sm:text-xl">Business Information</CardTitle></CardHeader>
                  <CardContent className="text-sm sm:text-base space-y-2">
                    <p><strong>GST No:</strong> {viewingSellerDetails.seller.gstNumber || "N/A"}</p>
                    <p><strong>PAN No:</strong> {viewingSellerDetails.seller.panNumber || "N/A"}</p>
                    <p><strong>Address:</strong><br />
                      {viewingSellerDetails.seller.address
                        ? `${viewingSellerDetails.seller.address.street},
                            ${viewingSellerDetails.seller.address.city},
                            ${viewingSellerDetails.seller.address.state} -
                            ${viewingSellerDetails.seller.address.pincode}`
                        : "N/A"}
                    </p>
                  </CardContent>
                </Card>

                {/* VERIFICATION DOCUMENTS */}
                <Card className="shadow-md border rounded-xl md:col-span-2">
                  <CardHeader className="sticky top-0 bg-white z-10 border-b">
                    <CardTitle className="text-lg sm:text-xl">Verification Documents</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-3">

                    {/* GST CERTIFICATE */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium text-sm">GST Certificate</span>
                      {viewingSellerDetails.seller.verificationDocuments?.gstCertificate ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDocumentPreview(
                              "GST Certificate",
                              viewingSellerDetails.seller.verificationDocuments!.gstCertificate
                            )
                          }
                        >
                          View Document
                        </Button>
                      ) : (
                        <p className="text-muted-foreground text-sm">Not Provided</p>
                      )}
                    </div>

                    {/* PAN CARD */}
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium text-sm">PAN Card</span>
                      {viewingSellerDetails.seller.verificationDocuments?.panCard ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDocumentPreview(
                              "PAN Card",
                              viewingSellerDetails.seller.verificationDocuments!.panCard
                            )
                          }
                        >
                          View Document
                        </Button>
                      ) : (
                        <p className="text-muted-foreground text-sm">Not Provided</p>
                      )}
                    </div>

                  </CardContent>
                </Card>

              </div>

            </div>
          </TabsContent>

          {/* ===================================================================================== */}
          {/* ================================= PRODUCTS TAB ===================================== */}
          {/* ===================================================================================== */}

          <TabsContent value="products" className="flex-grow min-h-0">
            <div className="h-full overflow-y-auto pr-3 pb-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {viewingSellerDetails.products.map((p) => (
                  <Card key={p._id} className="border rounded-xl shadow-md p-4 flex gap-4">
                    <img
                      src={getImageUrl(p.images[0] || "")}
                      alt={p.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border"
                    />

                    <div>
                      <p className="text-base sm:text-lg font-semibold">{p.name}</p>
                      <p className="text-sm text-muted-foreground">${p.price.toFixed(2)}</p>
                      <Badge className={cn("capitalize mt-1 text-xs px-2 py-0.5", getStatusBadgeClass(p.status))}>
                        {p.status}
                      </Badge>
                    </div>
                  </Card>
                ))}

              </div>
            </div>
          </TabsContent>

          {/* ===================================================================================== */}
          {/* ================================== HISTORY TAB ====================================== */}
          {/* ===================================================================================== */}

          <TabsContent value="history" className="flex-grow min-h-0">
            <div className="h-full overflow-y-auto pr-3 pb-6 custom-scrollbar">

              <div className="space-y-4">
                {viewingSellerDetails.history.length > 0 ? (
                  viewingSellerDetails.history.map((entry) => (
                    <Card key={entry._id} className="shadow-md border rounded-xl">
                      <CardHeader>
                        <CardTitle className="text-base sm:text-lg">{entry.notes || "Profile Update"}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm flex items-center gap-2">
                          {entry.changedBy?.name || "Unknown"} •{" "}
                          {entry.createdAt ? format(new Date(entry.createdAt), "PPpp") : "N/A"}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground">No history found.</p>
                )}
              </div>

            </div>
          </TabsContent>

        </Tabs>

      </div>
    )}

  </DialogContent>
</Dialog>
{/* ===================== END SELLER DETAILS DIALOG ===================== */}


      {/* ---------------- PRODUCT REVIEW DIALOG ---------------- */}
    {/* ---------------- PRODUCT REVIEW DIALOG (2-SIDED LAYOUT) ---------------- */}
<Dialog open={!!viewingProductDetails} onOpenChange={() => setViewingProductDetails(null)}>
  <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[92vh] overflow-hidden p-4 sm:p-6 bg-white rounded-xl shadow-xl">

    {/* HEADER */}
    <DialogHeader className="border-b pb-3">
      <DialogTitle className="text-xl sm:text-2xl font-semibold">
        {viewingProductDetails?.name}
      </DialogTitle>
      <DialogDescription className="text-sm sm:text-base">
        Product Review & Approval
      </DialogDescription>
    </DialogHeader>

    {/* BODY (TWO SIDE LAYOUT) - Stacks on mobile */}
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mt-4 h-full overflow-hidden">

      {/* ========== LEFT SIDE: IMAGE / CAROUSEL ========== */}
      <div className="w-full lg:w-1/2 h-full flex items-center justify-center overflow-hidden">

        {viewingProductDetails?.images?.length ? (
          <Carousel className="w-full h-full max-h-[300px] sm:max-h-[400px] flex items-center justify-center">
            <CarouselContent>
              {viewingProductDetails.images.map((img, idx) => (
                <CarouselItem
                  key={idx}
                  className="flex items-center justify-center"
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`${viewingProductDetails.name} ${idx + 1}`}
                    className="max-h-[280px] sm:max-h-[380px] w-auto object-contain rounded-lg border"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <div className="w-full h-48 sm:h-full flex items-center justify-center bg-muted rounded-lg border">
            <p className="text-muted-foreground">No Image</p>
          </div>
        )}

      </div>

      {/* ========== RIGHT SIDE: PRODUCT DETAILS ========== */}
      <div className="w-full lg:w-1/2 h-full overflow-y-auto custom-scrollbar pr-3">

        <Card className="p-4 border rounded-xl shadow-sm space-y-3">
          <p className="text-sm sm:text-base"><strong>Name:</strong> {viewingProductDetails?.name}</p>
          <p className="text-sm sm:text-base"><strong>Price:</strong> ₹{viewingProductDetails?.price?.toFixed(2)}</p>
          <p className="text-sm sm:text-base"><strong>Category:</strong> {viewingProductDetails?.category}</p>

          <p>
            <strong className="text-sm sm:text-base">Status:</strong>{' '}
            <Badge className={cn(
              "capitalize text-xs px-2 py-0.5",
              getStatusBadgeClass(viewingProductDetails?.status || '')
            )}>
              {viewingProductDetails?.status}
            </Badge>
          </p>

          <div>
            <strong className="text-sm sm:text-base">Description:</strong>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {viewingProductDetails?.description}
            </p>
          </div>

          {/* More product fields here if you want */}
        </Card>

      </div>
    </div>

    {/* FOOTER */}
    <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
      <Button
        variant="destructive"
        size="sm"
        onClick={() =>
          viewingProductDetails &&
          handleProductStatusUpdate(viewingProductDetails._id, "rejected")
        }
      >
        Reject
      </Button>

      <Button
        className="bg-green-600 hover:bg-green-700 text-white"
        size="sm"
        onClick={() =>
          viewingProductDetails &&
          handleProductStatusUpdate(viewingProductDetails._id, "approved")
        }
      >
        Approve
      </Button>
    </div>

  </DialogContent>
</Dialog>


      {/* ---------------- DOCUMENT PREVIEW DIALOG (CENTERED) ---------------- */}
      <Dialog open={!!documentToPreview} onOpenChange={() => setDocumentToPreview(null)}>
        <DialogContent className="sm:max-w-4xl w-[95vw] max-h-[90vh] flex flex-col rounded-xl p-4 overflow-hidden bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">{documentToPreview?.title}</h2>
            <Button variant="outline" size="sm" onClick={() => setDocumentToPreview(null)}>Close</Button>
          </div>

          <div className="flex-grow flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
            {documentToPreview?.url ? (
              <img src={documentToPreview.url} alt={documentToPreview.title} className="max-w-full max-h-full object-contain" />
            ) : (
              <p className="text-muted-foreground">Document Not Available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}