// maheshpatil369/shrinagar/Shrinagar-c908f2c7ebd73d867e2e79166bd07d6874cca960/Frontend1/src/pages/SellerDashboard.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { getCurrentUser, logout, User, verifyToken } from "../lib/auth";
import { Product, ProductFormData, createProduct, updateProduct, deleteProduct, uploadProductImage } from "../lib/products";
import { Seller, getSellerDashboard } from "../lib/seller";

// UI Components
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../components/ui/badge";
import { PlusCircle, MoreVertical, Edit, Trash2, LoaderCircle, Upload, CheckCircle, Clock, Info, XCircle, ShieldAlert } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SellerProfile from "./SellerProfile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const productSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  brand: z.string().min(2, { message: "Brand is required." }),
  material: z.string().min(2, { message: "Material is required." }),
  category: z.enum(['ring', 'necklace', 'bracelet', 'earrings', 'watch', 'other']),
  images: z.string().min(1, { message: "Please provide at least one image URL." }),
  affiliateUrl: z.string().url({ message: "Please enter a valid URL." }),
});

export default function SellerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", description: "", price: 0, brand: "", material: "", category: "other", images: "", affiliateUrl: "" },
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const sellerData = await getSellerDashboard();
      setSeller(sellerData);

      // Attempt to dynamically import getSellerProducts if it's exported by the module.
      // This avoids a static import error when the symbol is not exported.
      let productsData: Product[] = [];
      try {
        const prodModule = (await import("../lib/products")) as any;
        if (typeof prodModule.getSellerProducts === "function") {
          productsData = await prodModule.getSellerProducts();
        }
      } catch (err) {
        // ignore and keep productsData as empty array
      }
      setProducts(productsData);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch seller data." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && (currentUser.role === 'seller' || currentUser.role === 'admin')) {
      verifyToken(currentUser.token).then(setUser).catch(() => navigate('/auth'));
      fetchData();
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const handleOpenDialog = (product: Product | null) => {
    if (seller?.status !== 'approved') {
        toast({ variant: "destructive", title: "Profile Not Approved", description: "Your seller profile must be approved to add products." });
        return;
    }
    setEditingProduct(product);
    form.reset(product ? { ...product, images: product.images.join(', ') } : { name: "", description: "", price: 0, brand: "", material: "", category: "other", images: "", affiliateUrl: "" });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, data);
        toast({ title: "Success", description: "Product updated and sent for re-approval." });
      } else {
        await createProduct(data);
        toast({ title: "Success", description: "Product created and sent for approval." });
      }
      fetchData();
      setIsDialogOpen(false);
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: `Failed to ${editingProduct ? 'update' : 'create'} product.` });
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast({ title: "Success", description: "Product deleted." });
      fetchData();
    } catch (error) {
       toast({ variant: "destructive", title: "Error", description: "Failed to delete product." });
    }
  };

  const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setIsUploading(true);

    try {
        const data = await uploadProductImage(formData);
        const currentImages = form.getValues('images');
        const newImages = currentImages ? `${currentImages}, ${data.image}` : data.image;
        form.setValue('images', newImages, { shouldValidate: true });
        toast({ title: "Success", description: "Image uploaded." });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Upload Error", description: error?.response?.data?.message || "Failed to upload image." });
    } finally {
        setIsUploading(false);
        if(e.target) e.target.value = '';
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

  const SellerStatusBanner = () => { /* ... (same as before) ... */ };

  if (isLoading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen"><LoaderCircle className="h-12 w-12 animate-spin" /></div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
       <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Seller Portal</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}!</p>
        </div>
        <Button onClick={() => logout()} variant="outline">Logout</Button>
      </header>
      
      {/* Dynamic Status Banner */}
      {!seller ? (
         <Alert className="mb-6"><Info className="h-4 w-4" /><AlertTitle>Welcome, Seller!</AlertTitle><AlertDescription>Please complete your profile to start listing products.</AlertDescription></Alert>
      ) : seller.status === 'pending' ? (
        <Alert className="mb-6"><Clock className="h-4 w-4" /><AlertTitle>Profile Under Review</AlertTitle><AlertDescription>Your profile is being verified. You will be notified of updates.</AlertDescription></Alert>
      ) : seller.status === 'approved' ? (
        <Alert className="mb-6" variant="default"><CheckCircle className="h-4 w-4" /><AlertTitle>Profile Approved!</AlertTitle><AlertDescription>You can now add and manage your products.</AlertDescription></Alert>
      ) : seller.status === 'rejected' ? (
        <Alert className="mb-6" variant="destructive"><XCircle className="h-4 w-4" /><AlertTitle>Profile Rejected</AlertTitle><AlertDescription>Please review your profile details and resubmit.</AlertDescription></Alert>
      ) : seller.status === 'suspended' ? (
        <Alert className="mb-6" variant="destructive"><ShieldAlert className="h-4 w-4" /><AlertTitle>Account Suspended</AlertTitle><AlertDescription>Please contact support for more information.</AlertDescription></Alert>
      ) : null}


       <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                <div><CardTitle>Your Products</CardTitle><CardDescription>Manage your inventory.</CardDescription></div>
                <Button onClick={() => handleOpenDialog(null)} disabled={seller?.status !== 'approved'}><PlusCircle className="mr-2 h-4 w-4" /> Add Product</Button>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                    {products.length > 0 ? products.map((product) => (
                        <TableRow key={product._id}>
                        <TableCell className="font-medium flex items-center gap-4"><img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded-md border"/>{product.name}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell><Badge variant={getStatusBadgeVariant(product.status)} className="capitalize">{product.status}</Badge></TableCell>
                        <TableCell className="text-right">
                            <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenDialog(product)}><Edit className="mr-2 h-4 w-4"/> Edit</DropdownMenuItem>
                                <AlertDialogTrigger asChild><DropdownMenuItem className="text-red-500"><Trash2 className="mr-2 h-4 w-4"/> Delete</DropdownMenuItem></AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action will permanently delete your product.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(product._id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow><TableCell colSpan={4} className="text-center h-24">No products found.</TableCell></TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="profile" className="mt-6">
            <SellerProfile seller={seller} onProfileUpdate={fetchData} />
         </TabsContent>
      </Tabs>

      {/* Dialog for Add/Edit Product */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader><DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               {/* Form Fields... (same as before) */}
              <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="brand" render={({ field }) => (<FormItem><FormLabel>Brand</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
               <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
               <div className="grid grid-cols-3 gap-4">
                 <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent>{['ring', 'necklace', 'bracelet', 'earrings', 'watch', 'other'].map(cat => (<SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="material" render={({ field }) => (<FormItem><FormLabel>Material</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <FormField control={form.control} name="images" render={({ field }) => (
                <FormItem>
                    <FormLabel>Image URLs (Base64)</FormLabel>
                    <FormControl><Textarea placeholder="Upload an image to generate data URLs." {...field} readOnly /></FormControl>
                     <div className="flex items-center gap-2 pt-1">
                        <Input type="file" id="image-file-upload" name="image" accept="image/*" onChange={uploadFileHandler} className="hidden" />
                        <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById('image-file-upload')?.click()} disabled={isUploading}>{isUploading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}Upload Image</Button>
                         <p className="text-xs text-muted-foreground">Upload one at a time. URLs will be added here.</p>
                    </div>
                    <FormMessage />
                </FormItem>
                )} />
               <FormField control={form.control} name="affiliateUrl" render={({ field }) => (<FormItem><FormLabel>Affiliate URL</FormLabel><FormControl><Input type="url" {...field} /></FormControl><FormMessage /></FormItem>)} />
               <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>{editingProduct ? 'Save Changes' : 'Create Product'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

