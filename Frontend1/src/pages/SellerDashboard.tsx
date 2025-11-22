// maheshpatil369/shrinagar/Shrinagar-f1ede353ebcd0107a58d8a5b477911c8c5eb4f1d/Frontend1/src/pages/SellerDashboard.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


// --- UPDATED IMPORTS (Using alias paths) ---
import { getCurrentUser, logout, User, verifyToken } from "@/lib/auth";
import { Product, ProductFormData, createProduct, updateProduct, deleteProduct, uploadProductImage } from "@/lib/products";
import { Seller, getSellerDashboard, getSellerProducts, getSellerAnalytics, SellerAnalytics } from "@/lib/seller";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
// Correctly import X from lucide-react
// --- ADDED Package icon ---
import { PlusCircle, MoreVertical, Edit, Trash2, LoaderCircle, Upload, CheckCircle, Clock, Info, XCircle, ShieldAlert, TrendingUp, Eye, MousePointerClick, LogOut, X, Package } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SellerProfile from "./SellerProfile"; // This relative path should be correct
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
// --- IMPORTED cn ---
import { cn } from "@/lib/utils";
// --- END IMPORTS ---

const productSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  // PRICE REMOVED from validation
  brand: z.string().min(2, { message: "Brand is required." }),
  material: z.string().min(2, { message: "Material is required." }),
  category: z.enum(['ring', 'necklace', 'bracelet', 'earrings', 'watch', 'other']),
  images: z.array(z.string()).min(1, { message: "Please provide at least one image." }), // Expecting URLs now
  affiliateUrl: z.string().url({ message: "Please enter a valid URL." }),
});

export default function SellerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // --- ADDED: Memoized pending products count ---
  const pendingProductsCount = useMemo(() => {
    return products.filter(p => p.status === 'pending').length;
  }, [products]);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    // REMOVED price from defaultValues
    defaultValues: { name: "", description: "", brand: "", material: "", category: "other", images: [], affiliateUrl: "" },
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sellerData, productsData, analyticsData] = await Promise.all([
        getSellerDashboard(),
        getSellerProducts(),
        getSellerAnalytics(),
      ]);
      setSeller(sellerData);
      setProducts(productsData);
      setAnalytics(analyticsData);
    } catch (error) {
      // Check if the error indicates the seller profile doesn't exist yet
      if ((error as any)?.response?.status === 404 || (error as any)?.response?.data === null || (error as any)?.message?.includes('not found')) {
          setSeller(null); // Explicitly set seller to null if not found
          setProducts([]);
          setAnalytics(null);
      } else {
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch seller data." });
      }
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && (currentUser.role === 'seller' || currentUser.role === 'admin')) {
      // Verify token before setting user and fetching data
       verifyToken(currentUser.token)
        .then(verifiedUser => {
            setUser(verifiedUser);
            fetchData(); // Fetch data only after successful verification
        })
        .catch(() => {
            logout(); // Log out if token is invalid
            navigate('/auth');
        });
    } else {
      logout(); // Ensure clean state if no user or wrong role
      navigate('/auth');
    }
    // Removed toast from dependency array as it's stable
  }, [navigate]);

  const handleOpenDialog = (product: Product | null) => {
    if (seller?.status !== 'approved') {
        toast({ variant: "destructive", title: "Profile Not Approved", description: "Your seller profile must be approved to add products." });
        return;
    }
    setEditingProduct(product);
    // Ensure images are correctly reset/populated (now expects URLs)
    // REMOVED price from reset object
    form.reset(product ? { ...product, images: product.images || [] } : { name: "", description: "", brand: "", material: "", category: "other", images: [], affiliateUrl: "" });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: z.infer<typeof productSchema>) => {
     // Prepare payload slightly differently now as images are URLs
    const payload = {
        name: data.name,
        description: data.description,
        // PRICE REMOVED from payload
        category: data.category,
        brand: data.brand,
        material: data.material,
        images: data.images, // Pass the array of URLs directly
        affiliateUrl: data.affiliateUrl,
    };

    try {
      if (editingProduct) {
        // Pass the prepared payload for update
        await updateProduct(editingProduct._id, payload);
        toast({ title: "Success", description: "Product updated and sent for re-approval." });
      } else {
         // Pass the prepared payload for create
        await createProduct(payload as ProductFormData); // Type assertion might be needed if updateProduct expects different type
        toast({ title: "Success", description: "Product created and sent for approval." });
      }
      fetchData();
      setIsDialogOpen(false);
    } catch (error: any) {
       toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || `Failed to ${editingProduct ? 'update' : 'create'} product.` });
    }
  };


  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast({ title: "Success", description: "Product deleted." });
      fetchData(); // Refetch data to update the list
    } catch (error: any) {
       toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Failed to delete product." });
    }
  };

  const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setIsUploading(true);

    try {
        // This function now returns { message: string, image: string (URL) }
        const data = await uploadProductImage(formData);
        const currentImages = form.getValues('images') || [];
        // Append the new Cloudinary URL to the array
        form.setValue('images', [...currentImages, data.image], { shouldValidate: true });
        toast({ title: "Success", description: "Image uploaded." });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Upload Error", description: error?.response?.data?.message || "Failed to upload image." });
    } finally {
        setIsUploading(false);
        // Clear the file input after upload attempt
        if(e.target) e.target.value = '';
    }
  };


  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default'; // Use default for approved (often green or primary)
      case 'pending': return 'secondary'; // Use secondary for pending (often grey)
      case 'rejected':
      case 'suspended': return 'destructive'; // Use destructive for negative statuses (red)
      default: return 'outline';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };


  if (isLoading || !user) {
    // Show loading state while verifying token or fetching initial data
    return (
        <div className="flex items-center justify-center min-h-screen">
            {/* --- ICON SIZE INCREASED --- */}
            <LoaderCircle className="h-20 w-20 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
    <header className="flex flex-wrap items-center justify-between gap-3 mb-8">
  
  {/* LEFT SIDE — Title + Welcome */}
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-3">
      <h1 className="text-4xl font-bold truncate">Seller Portal</h1>
    </div>
    <p className="text-xl text-muted-foreground leading-tight mt-1 truncate">
      Welcome back, {user.name}!
    </p>
  </div>

  {/* RIGHT SIDE — Seller Badge + Logout (mobile small / desktop original) */}
  <div className="flex items-center gap-3 flex-shrink-0">

    {/* SELLER BADGE */}
    <Badge
      className="
        bg-orange-500 hover:bg-orange-600 text-white flex items-center
        text-xs px-2 py-0.5 
        md:text-base md:px-3 md:py-1
      "
    >
      <Package className="mr-2 h-4 w-4 md:h-6 md:w-6" />
      Seller
    </Badge>

    {/* LOGOUT BUTTON */}
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="
            flex items-center whitespace-nowrap
            h-7 px-2 py-1 text-xs
            md:h-10 md:px-4 md:py-2 md:text-base
          "
        >
          <LogOut className="mr-2 h-4 w-4 md:h-6 md:w-6" /> Logout
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





       {!seller ? (
         <Alert className="mb-6"><Info className="h-6 w-6" /><AlertTitle>Welcome, Seller!</AlertTitle><AlertDescription>Please complete your profile to start listing products.</AlertDescription></Alert>
      ) : seller.status === 'pending' ? (
        <Alert className="mb-6"><Clock className="h-6 w-6" /><AlertTitle>Profile Under Review</AlertTitle><AlertDescription>Your profile is being verified. You will be notified of updates.</AlertDescription></Alert>
      ) : seller.status === 'approved' ? (
        // --- UPDATED APPROVED ALERT TO BE EXPLICITLY GREEN ---
        <Alert className="mb-6 bg-green-100 dark:bg-green-900/50 border-green-500 text-green-700 dark:text-green-300 [&>svg]:text-green-700 dark:[&>svg]:text-green-300">
          <CheckCircle className="h-6 w-6" />
          <AlertTitle>Profile Approved!</AlertTitle>
          <AlertDescription>You can now add and manage your products.</AlertDescription>
        </Alert>
      ) : seller.status === 'rejected' ? (
        <Alert className="mb-6" variant="destructive"><XCircle className="h-6 w-6" /><AlertTitle>Profile Rejected</AlertTitle><AlertDescription>Please review your profile details and resubmit.</AlertDescription></Alert>
      ) : seller.status === 'suspended' ? (
        <Alert className="mb-6" variant="destructive"><ShieldAlert className="h-6 w-6" /><AlertTitle>Account Suspended</AlertTitle><AlertDescription>Please contact support for more information.</AlertDescription></Alert>
      ) : null}

      {/* --- ADDED NEW COLORFUL STATS GRID --- */}
{analytics && (
  <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mb-8">

    <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-blue-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Total Products</CardTitle>
        <Package className="h-6 w-6 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{products.length}</div>
      </CardContent>
    </Card>

    <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-green-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Total Views</CardTitle>
        <Eye className="h-6 w-6 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{analytics.totalViews || 0}</div>
      </CardContent>
    </Card>

    <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-amber-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Total Clicks</CardTitle>
        <MousePointerClick className="h-6 w-6 text-amber-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{analytics.totalClicks || 0}</div>
      </CardContent>
    </Card>

    <Card className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-red-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Pending Products</CardTitle>
        <Clock className="h-6 w-6 text-red-500" />
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold", pendingProductsCount > 0 ? "text-red-500" : "")}>
          {pendingProductsCount}
        </div>
      </CardContent>
    </Card>

  </div>
)}


      {/* --- END OF NEW STATS GRID --- */}


       <Tabs defaultValue="products">
        {/* --- UPDATED TAB BACKGROUNDS FROM YELLOW TO INDIGO/PURPLE --- */}
        <TabsList className="grid w-full grid-cols-3 bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-lg">
          {/* --- FONT SIZE INCREASED & BG CHANGED --- */}
          <TabsTrigger value="products" className="text-base data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md">Products</TabsTrigger>
          <TabsTrigger value="analytics" className="text-base data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md">Analytics</TabsTrigger>
          <TabsTrigger value="profile" className="text-base data-[state=active]:bg-indigo-600 dark:data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-md">Profile</TabsTrigger>
        </TabsList>

     <TabsContent value="products" className="mt-6">
  <Card>

    {/* HEADER (DESKTOP SAME, MOBILE FIXED) */}
    <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">

      <div>
        <CardTitle className="text-2xl">Your Products</CardTitle>
        <CardDescription className="text-base">Manage your inventory.</CardDescription>
      </div>

      {/* Mobile button goes below title — Desktop unchanged */}
      <div className="mt-4 md:mt-0 w-full md:w-auto">
        <Button
          onClick={() => handleOpenDialog(null)}
          disabled={seller?.status !== 'approved'}
          className="bg-pink-600 text-white hover:bg-pink-700 w-full md:w-auto"
        >
          <PlusCircle className="mr-2 h-6 w-6" /> Add Product
        </Button>
      </div>

    </CardHeader>

    <CardContent>

      {/* MOBILE SCROLL WRAPPER — DESKTOP UNCHANGED */}
      <div className="overflow-x-auto">
        <Table className="min-w-[850px] md:min-w-0">

          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-base">Sr. No.</TableHead>
              <TableHead className="text-base">Name</TableHead>
              {/* PRICE COLUMN REMOVED */}
              <TableHead className="text-base">Status</TableHead>
              <TableHead className="text-base">Views</TableHead>
              <TableHead className="text-base">Clicks</TableHead>
              <TableHead className="text-right text-base">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.length > 0 ? (
              products.map((product, index) => (
                <TableRow key={product._id}>
                  <TableCell className="text-base">{index + 1}</TableCell>

                  <TableCell className="font-medium flex items-center gap-4 text-base">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-md border"
                    />
                    {product.name}
                  </TableCell>

                  {/* PRICE CELL REMOVED */}

                  <TableCell className="text-base">
                    <Badge
                      variant={getStatusBadgeVariant(product.status)}
                      className="capitalize"
                    >
                      {product.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-base">{product.viewCount}</TableCell>
                  <TableCell className="text-base">{product.clickCount}</TableCell>

                  <TableCell className="text-right">
                    <AlertDialog>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-6 w-6" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(product)}>
                            <Edit className="mr-2 h-6 w-6" /> Edit
                          </DropdownMenuItem>

                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-500">
                              <Trash2 className="mr-2 h-6 w-6" /> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action will permanently delete "{product.name}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product._id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24 text-base">
                  No products found. Add your first product!
                </TableCell>
              </TableRow>
            )}
          </TableBody>

        </Table>
      </div>

    </CardContent>
  </Card>
</TabsContent>


   <TabsContent value="analytics" className="mt-6">

  {/* --- TOP ANALYTICS CARDS (MOBILE = 2 COLS / DESKTOP = 3 COLS) --- */}
  <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Total Views</CardTitle>
        <Eye className="h-6 w-6 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {analytics?.totalViews || 0}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Total Clicks</CardTitle>
        <MousePointerClick className="h-6 w-6 text-amber-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
          {analytics?.totalClicks || 0}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Conversion Rate</CardTitle>
        <TrendingUp className="h-6 w-6 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
          {(analytics?.conversionRate || 0).toFixed(2)}%
        </div>
      </CardContent>
    </Card>

  </div>


  {/* --- SECOND ROW: PERFORMANCE CHART + TOP PRODUCTS --- */}
  <div className="grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-7 mt-4">

    {/* --- CHART FULL WIDTH ON MOBILE/TABLET --- */}
    <Card className="col-span-1 lg:col-span-4">
      <CardHeader>
        <CardTitle className="text-2xl">Product Performance</CardTitle>
        <CardDescription className="text-base">
          Views vs. Clicks for each product.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            views: { label: "Views", color: "#3b82f6" },
            clicks: { label: "Clicks", color: "#ec4899" }
          }}
          className="h-[260px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analytics?.performanceData || []}
              margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className="text-xs md:text-sm"
                tickFormatter={(value) =>
                  value.length > 12 ? value.slice(0, 12) + "..." : value
                }
              />
              <YAxis className="text-xs md:text-sm" />
              <Tooltip content={<ChartTooltipContent indicator="dot" />} />
              <Bar dataKey="views" fill="var(--color-views)" radius={4} />
              <Bar dataKey="clicks" fill="var(--color-clicks)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>


    {/* --- TOP PRODUCTS TABLE (FULL WIDTH ON MOBILE/TABLET) --- */}
    <Card className="col-span-1 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-2xl">Top 5 Products by Views</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-base">Product</TableHead>
              <TableHead className="text-right text-base">Views</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analytics?.topProducts?.length > 0 ? (
              analytics.topProducts.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="font-medium text-base">
                    {p.name}
                  </TableCell>
                  <TableCell className="text-right text-base">
                    {p.viewCount}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center h-24 text-base"
                >
                  No product data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

  </div>
</TabsContent>


         <TabsContent value="profile" className="mt-6">
            <SellerProfile seller={seller} onProfileUpdate={fetchData} />
         </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          {/* --- FONT SIZE INCREASED --- */}
          <DialogHeader><DialogTitle className="text-2xl">{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 {/* --- FONT SIZE INCREASED --- */}
                 <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel className="text-base">Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="brand" render={({ field }) => (<FormItem><FormLabel className="text-base">Brand</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
               {/* --- FONT SIZE INCREASED --- */}
               <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel className="text-base">Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
               <div className="grid grid-cols-3 gap-4">
                 {/* PRICE FIELD REMOVED */}
                 <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel className="text-base">Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select category..."/></SelectTrigger></FormControl><SelectContent>{['ring', 'necklace', 'bracelet', 'earrings', 'watch', 'other'].map(cat => (<SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="material" render={({ field }) => (<FormItem><FormLabel className="text-base">Material</FormLabel><FormControl><Input placeholder="e.g., Gold, Silver, Diamond" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="images" render={({ field }) => (
                <FormItem>
                    {/* --- FONT SIZE INCREASED --- */}
                    <FormLabel className="text-base">Images</FormLabel>
                    <FormControl>
                      <div>
                        <div className="flex items-center gap-2 pt-1">
                            <Input type="file" id="image-file-upload" name="image" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={uploadFileHandler} className="hidden" />
                            {/* --- ICON SIZE INCREASED --- */}
                            <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('image-file-upload')?.click()} disabled={isUploading}>{isUploading ? <LoaderCircle className="mr-2 h-6 w-6 animate-spin" /> : <Upload className="mr-2 h-6 w-6" />}Upload Image</Button>
                             <p className="text-xs text-muted-foreground">Upload one at a time. URLs will be stored.</p>
                        </div>
                        {field.value && field.value.length > 0 && (
                          <div className="mt-2 flex gap-2 flex-wrap">
                            {field.value.map((image, index) => (
                              <div key={index} className="relative w-20 h-20">
                                {/* Display image using the URL */}
                                <img src={image} alt={`upload-${index}`} className="w-full h-full object-cover rounded-md border" />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                  onClick={() => {
                                    const newImages = [...field.value];
                                    newImages.splice(index, 1);
                                    form.setValue('images', newImages);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )} />
               {/* --- FONT SIZE INCREASED & SYNTAX FIXED --- */}
               <FormField control={form.control} name="affiliateUrl" render={({ field }) => (<FormItem><FormLabel className="text-base">Affiliate URL</FormLabel><FormControl><Input type="url" placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>)} />
               <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                {/* --- ICON SIZE INCREASED --- */}
                <Button type="submit" disabled={form.formState.isSubmitting || isUploading}>{form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-2 h-6 w-6"/> : null}{editingProduct ? 'Update Product' : 'Create Product'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}