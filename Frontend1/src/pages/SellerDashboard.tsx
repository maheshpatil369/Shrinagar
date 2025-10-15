// maheshpatil369/shrinagar/Shrinagar-fec0a47de051ffa389da59e3900a2428b5397e43/Frontend1/src/pages/SellerDashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { getCurrentUser, logout, User, verifyToken } from "../lib/auth";
import { Product, ProductFormData, getMyProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from "../lib/products";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../components/ui/use-toast";
import { Badge } from "../components/ui/badge";
import { PlusCircle, MoreVertical, Edit, Trash2, Eye, BarChart2, ShieldCheck, ShieldAlert, LoaderCircle, Upload } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";

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

type VerificationStatus = 'verifying' | 'verified' | 'failed';

export default function SellerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('verifying');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      brand: "",
      material: "",
      category: "other",
      images: "",
      affiliateUrl: "",
    },
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && (currentUser.role === 'seller' || currentUser.role === 'admin')) {
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
    setIsLoadingProducts(true);
    try {
      const sellerProducts = await getMyProducts();
      setProducts(sellerProducts);
    } catch (error) {
      console.error("Failed to fetch products", error);
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch your products.",
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };
  
  const handleOpenDialog = (product: Product | null) => {
    setEditingProduct(product);
    if (product) {
      form.reset({
        ...product,
        images: product.images.join(', '),
      });
    } else {
      form.reset({
        name: "", description: "", price: 0, brand: "", material: "", category: "other", images: "", affiliateUrl: "",
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, data);
        toast({ title: "Success", description: "Product updated successfully." });
      } else {
        await createProduct(data);
        toast({ title: "Success", description: "Product created successfully. It is now pending approval." });
      }
      fetchProducts();
      setIsDialogOpen(false);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${editingProduct ? 'update' : 'create'} product.`,
      });
    }
  };
  
  const handleDelete = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast({ title: "Success", description: "Product deleted successfully." });
      fetchProducts();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product.",
      });
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
        // Append new image URL, handling case where input is empty
        const newImages = currentImages ? `${currentImages}, ${data.image}` : data.image;
        form.setValue('images', newImages, { shouldValidate: true });
        toast({
            title: "Success",
            description: "Image uploaded and URL added.",
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Upload Error",
            description: error?.response?.data?.message || "Failed to upload image.",
        });
    } finally {
        setIsUploading(false);
        // Reset file input value to allow uploading the same file again
        if(e.target) {
            e.target.value = '';
        }
    }
  };
  
  const getStatusBadgeVariant = (status: Product['status']) => {
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
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <ShieldCheck className="mr-2 h-4 w-4" />
            Token Verified
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <ShieldAlert className="mr-2 h-4 w-4" />
            Token Invalid
          </Badge>
        );
      case 'verifying':
      default:
        return (
          <Badge variant="secondary">
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Verifying Token...
          </Badge>
        );
    }
  };

  if (verificationStatus === 'verifying') {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <LoaderCircle className="h-12 w-12 animate-spin text-gray-500" />
            <p className="mt-4 text-gray-600 dark:text-gray-300">Verifying authentication...</p>
        </div>
    );
  }

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800 text-center">
                 <h1 className="text-3xl font-bold text-destructive">Authentication Failed</h1>
                 <p className="text-muted-foreground">Your session is invalid or has expired. Redirecting to login...</p>
                 <StatusIndicator />
            </div>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
       <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}!</p>
        </div>
        <div className="flex items-center gap-4">
           <StatusIndicator />
           <Button onClick={() => handleOpenDialog(null)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
          </Button>
          <Button onClick={handleLogout} variant="outline">Logout</Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingProducts ? (<div className="text-center"><LoaderCircle className="h-8 w-8 animate-spin inline-block" /></div>) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Analytics</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length > 0 ? products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="capitalize">{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(product.status)} className="capitalize">{product.status}</Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" /> {product.viewCount || 0}
                    </div>
                     <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <BarChart2 className="h-4 w-4" /> {product.clickCount || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(product)}>
                            <Edit className="mr-2 h-4 w-4"/> Edit
                          </DropdownMenuItem>
                           <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-red-500">
                              <Trash2 className="mr-2 h-4 w-4"/> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your product.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(product._id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )) : (
                 <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">No products found. Add one to get started!</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Diamond Solitaire Ring" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="brand" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl><Input placeholder="e.g., Luxe Jewels" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
               <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe your product..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <div className="grid grid-cols-3 gap-4">
                 <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 12500" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                       </FormControl>
                       <SelectContent>
                        {['ring', 'necklace', 'bracelet', 'earrings', 'watch', 'other'].map(cat => (
                           <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                        ))}
                       </SelectContent>
                     </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="material" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material</FormLabel>
                    <FormControl><Input placeholder="e.g., 18K White Gold" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="images" render={({ field }) => (
                <FormItem>
                    <FormLabel>Image URLs</FormLabel>
                    <FormControl>
                        <Textarea
                            placeholder="Upload an image or paste URLs here, separated by commas."
                            {...field}
                        />
                    </FormControl>
                     <div className="flex items-center gap-2 pt-1">
                        <Input
                            type="file"
                            id="image-file-upload"
                            name="image"
                            accept="image/*"
                            onChange={uploadFileHandler}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById('image-file-upload')?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                            Upload Image
                        </Button>
                         <p className="text-xs text-muted-foreground">
                            Upload one image at a time.
                        </p>
                    </div>
                    <FormMessage />
                </FormItem>
                )} />
               <FormField control={form.control} name="affiliateUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affiliate URL</FormLabel>
                    <FormControl><Input type="url" placeholder="https://yourstore.com/product/..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
               <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">{editingProduct ? 'Save Changes' : 'Create Product'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

