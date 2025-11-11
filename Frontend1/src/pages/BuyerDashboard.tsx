// Frontend1/src/pages/BuyerDashboard.tsx
// This file is now fixed to use `getApprovedProducts` and the correct sidebar logic.
import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
// --- FIX: Importing the REAL function `getApprovedProducts` ---
import { Product, getApprovedProducts, ProductFilters } from "../lib/products";
import { ExternalLink, LoaderCircle, Search, SlidersHorizontal, Heart, X, LayoutGrid, List, ShoppingCart, AlertCircle } from 'lucide-react';
import { useToast } from "../hooks/use-toast";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { addToWishlist } from "../lib/user";
import { getCurrentUser } from "../lib/auth";
import { Skeleton } from "../components/ui/skeleton";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "../components/ui/sheet";
import Rating from "../components/ui/Rating";
import { useAuthModal } from '@/context/AuthModalContext';
import debounce from 'lodash.debounce';
// --- FIX: Added missing Label import ---
import { Label } from "../components/ui/label";

// --- FIX: Backend URL for constructing correct image paths ---
const BACKEND_URL = import.meta.env.VITE_API_URL 
                    ? import.meta.env.VITE_API_URL.replace('/api', '') 
                    : 'http://localhost:8000';

// Helper to clean up image paths
const getImageUrl = (imagePath: string) => {
    if (!imagePath) return 'https://placehold.co/600x600/e2e8f0/a0aec0?text=No+Image'; // Return placeholder if no image
    if (imagePath.startsWith('http')) return imagePath; // Already a full URL (e.g., cloudinary)
    
    // This handles paths like '/uploads/image.png' or 'uploads/image.png'
    // and prevents double slashes
    return `${BACKEND_URL}/${imagePath.replace(/^\//, '')}`;
}


// --- Reusable ProductCard Component ---
interface ProductCardProps {
    product: Product;
    onAddToWishlist: (e: React.MouseEvent, product: Product) => void;
    currentUser: any;
    layout: 'grid' | 'list';
}

function ProductCard({ product, onAddToWishlist, currentUser, layout }: ProductCardProps) {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { setAuthModalOpen, setPostLoginRedirect } = useAuthModal();

    const handleCardClick = () => {
        navigate(`/product/${product._id}`);
    };

    const handleAffiliateClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser) {
            toast({ variant: "destructive", title: "Login Required" });
            setPostLoginRedirect(window.location.pathname);
            setAuthModalOpen(true);
            return;
        }
        window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
    };

     if (layout === 'list') {
         return (
            <Card className="overflow-hidden group cursor-pointer w-full flex flex-col sm:flex-row" onClick={handleCardClick}>
                <div className="relative aspect-square sm:w-48 shrink-0">
                     {product.images && product.images.length > 0 ? (
                        // --- FIX: Use getImageUrl helper ---
                        <img src={getImageUrl(product.images[0])} alt={product.name} className="w-full h-full object-cover"/>
                     ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-muted-foreground">No Image</div>
                     )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <CardTitle className="text-lg font-semibold leading-tight mb-1 group-hover:underline line-clamp-2">{product.name}</CardTitle>
                    <Rating value={product.rating} text={`(${product.numReviews} reviews)`} className="mb-2" />
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-3 flex-grow">{product.description}</p>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mt-auto pt-2">
                        <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="sm" onClick={handleAffiliateClick}>
                                 <ExternalLink className="h-4 w-4 mr-2" />
                                 Visit Site
                             </Button>
                             {currentUser && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={(e) => onAddToWishlist(e, product)}>
                                    <Heart className="h-4 w-4" />
                                </Button>
                             )}
                        </div>
                    </div>
                </div>
            </Card>
         );
     }

    // Default Grid Layout
    return (
        <Card className="overflow-hidden group cursor-pointer h-full flex flex-col" onClick={handleCardClick}>
            <CardHeader className="p-0 relative aspect-square">
                 {product.images && product.images.length > 0 ? (
                    // --- FIX: Use getImageUrl helper ---
                    <img
                        src={getImageUrl(product.images[0])}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                 ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-muted-foreground">No Image</div>
                 )}
                 <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                     {currentUser && (
                        <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 hover:bg-background rounded-full shadow" onClick={(e) => onAddToWishlist(e, product)}>
                            <Heart className="h-4 w-4" />
                        </Button>
                     )}
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col items-center text-center">
                <CardTitle className="text-base font-medium leading-tight mb-1">{product.name}</CardTitle>
                <p className="text-sm font-semibold">${product.price.toFixed(2)}</p>
                <Rating value={product.rating} text={`(${product.numReviews})`} className="justify-center mt-1" />
            </CardContent>
            <CardFooter className="p-3 pt-0">
                 <Button variant="outline" size="sm" className="w-full" onClick={handleAffiliateClick}>
                     <ExternalLink className="h-4 w-4 mr-2" />
                     Visit Seller
                 </Button>
            </CardFooter>
        </Card>
    );
}

// --- FilterSidebar Component ---
function FilterSidebar({ filters, onFilterChange, onPriceChange, uniqueBrands, uniqueMaterials }: {
    filters: ProductFilters;
    onFilterChange: (key: keyof ProductFilters, value: string | undefined) => void;
    onPriceChange: (values: number[]) => void;
    uniqueBrands: string[];
    uniqueMaterials: string[];
}) {
    
    // This local state is for the slider's immediate feedback
    const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice ?? 0);
    const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice ?? 50000);

    // Update local slider state if filters change from URL
    useEffect(() => {
        setLocalMinPrice(filters.minPrice ?? 0);
        setLocalMaxPrice(filters.maxPrice ?? 50000);
    }, [filters.minPrice, filters.maxPrice]);
    
    const handlePriceSliderChange = (values: number[]) => {
        setLocalMinPrice(values[0]);
        setLocalMaxPrice(values[1]);
        onPriceChange(values); // This calls the debounced function from parent
    };
    
    return (
        <div className="space-y-6">
            <div>
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search jewelry..."
                        className="pl-9"
                        value={filters.keyword || ''}
                        onChange={e => onFilterChange('keyword', e.target.value || undefined)}
                    />
                </div>
            </div>
            <div>
                <Label className="text-sm font-medium">Category</Label>
                <Select
                    value={filters.category || 'all'}
                    onValueChange={value => onFilterChange('category', value === "all" ? undefined : value)}
                 >
                    <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {['ring', 'necklace', 'bracelet', 'earrings', 'watch', 'other'].map(cat => (
                           <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div>
                <Label className="text-sm font-medium">Brand</Label>
                <Select
                    value={filters.brand || 'all'}
                    onValueChange={value => onFilterChange('brand', value === "all" ? undefined : value)}
                    disabled={uniqueBrands.length === 0}
                 >
                    <SelectTrigger><SelectValue placeholder="All Brands" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Brands</SelectItem>
                        {uniqueBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div>
                <Label className="text-sm font-medium">Material</Label>
                <Select
                    value={filters.material || 'all'}
                    onValueChange={value => onFilterChange('material', value === "all" ? undefined : value)}
                    disabled={uniqueMaterials.length === 0}
                 >
                    <SelectTrigger><SelectValue placeholder="All Materials" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Materials</SelectItem>
                        {uniqueMaterials.map(mat => <SelectItem key={mat} value={mat}>{mat}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label className="text-sm font-medium">Price Range</Label>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>${localMinPrice}</span>
                    <span>${localMaxPrice}</span>
                </div>
                <Slider
                    defaultValue={[0, 50000]}
                    max={50000}
                    step={100}
                    className="mt-2"
                    value={[localMinPrice, localMaxPrice]}
                    onValueChange={handlePriceSliderChange}
                />
            </div>
        </div>
    );
}

// --- Main Dashboard Component ---
export default function BuyerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const { setAuthModalOpen, setPostLoginRedirect } = useAuthModal();

  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  
  // Read filters and sort option directly from URL search params
  const filters = useMemo((): ProductFilters => ({
      keyword: searchParams.get('keyword') || undefined,
      category: searchParams.get('category') || undefined,
      brand: searchParams.get('brand') || undefined,
      material: searchParams.get('material') || undefined,
      minPrice: Number(searchParams.get('minPrice')) || undefined,
      maxPrice: Number(searchParams.get('maxPrice')) || undefined,
  }), [searchParams]);
  
  const sortOption = searchParams.get('sort') || 'default';

  // Debounced function to update URL
  const debouncedUpdateUrlParams = useCallback(
    debounce((newFilters: ProductFilters) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== '' && value !== 0 && !(key === 'maxPrice' && value === 50000)) {
                newParams.set(key, String(value));
            } else {
                newParams.delete(key);
            }
        });
        setSearchParams(newParams, { replace: true });
    }, 500),
  [setSearchParams, searchParams]);
  
  // Fetch products when filters in URL (searchParams) change
  useEffect(() => {
    setIsLoading(true);
    
    // --- FIX: Using the correct function `getApprovedProducts` ---
    getApprovedProducts(filters)
      .then(approvedProducts => {
        setProducts(approvedProducts);
        setError(null);
      })
      .catch(error => {
        console.error("Failed to fetch products:", error);
        setError("Could not fetch jewelry. Please try refreshing.");
        toast({ variant: "destructive", title: "Error", description: "Could not fetch jewelry." });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [filters, toast]); // Re-run fetch when filters object (derived from searchParams) changes

  // Handlers to update URL
  const handleFilterChange = (key: keyof ProductFilters, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value };
    debouncedUpdateUrlParams(newFilters);
  };

  const handlePriceChange = (values: number[]) => {
     const newFilters = { ...filters, minPrice: values[0], maxPrice: values[1] };
     debouncedUpdateUrlParams(newFilters);
  };
  
  const handleSortChange = (value: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (value === 'default') {
          newParams.delete('sort');
      } else {
          newParams.set('sort', value);
      }
      setSearchParams(newParams, { replace: true });
  };

  // Memoized values for sidebar and sorting
  const uniqueBrands = useMemo(() => {
    const brands = products.map(p => p.brand).filter(Boolean);
    return [...new Set(brands)].sort();
  }, [products]);

  const uniqueMaterials = useMemo(() => {
    const materials = products.map(p => p.material).filter(Boolean);
    return [...new Set(materials)].sort();
  }, [products]);

  const sortedProducts = useMemo(() => {
      let sorted = [...products];
      // Note: Filtering logic is now handled by the backend via `getApprovedProducts(filters)`
      // We only need to handle client-side *sorting* here.
      
      switch (sortOption) {
          case 'price-asc':
              sorted.sort((a, b) => a.price - b.price);
              break;
          case 'price-desc':
              sorted.sort((a, b) => b.price - b.price);
              break;
          case 'name-asc':
              sorted.sort((a, b) => a.name.localeCompare(b.name));
              break;
          case 'name-desc':
               sorted.sort((a, b) => b.name.localeCompare(a.name));
               break;
          default:
              break;
      }
      return sorted;
  }, [products, sortOption]);


   const handleAddToWishlist = async (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser) {
            toast({ variant: "destructive", title: "Login Required", description: "Please log in to add items to your wishlist." });
            setPostLoginRedirect(window.location.pathname);
            setAuthModalOpen(true);
            return;
        }
        try {
            await addToWishlist(product._id);
            toast({ title: "Success", description: `${product.name} added to your wishlist!` });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Could not add to wishlist." });
        }
    };


  return (
    <div className="container mx-auto max-w-screen-2xl p-4 md:px-8 flex flex-col md:flex-row gap-8">
        {/* --- Sidebar --- */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0">
             <h2 className="text-xl font-semibold mb-4 hidden md:block">Filters</h2>
             {/* Desktop Sidebar */}
             <div className="hidden md:block">
                 <FilterSidebar 
                    filters={filters} 
                    onFilterChange={handleFilterChange} 
                    onPriceChange={handlePriceChange}
                    uniqueBrands={uniqueBrands} 
                    uniqueMaterials={uniqueMaterials} 
                />
             </div>
             {/* Mobile Filter Button/Sheet */}
             <div className="md:hidden mb-4">
                  <Sheet>
                      <SheetTrigger asChild>
                          <Button variant="outline" className="w-full justify-center">
                              <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                          </Button>
                      </SheetTrigger>
                      <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                           <SheetHeader className="mb-6 border-b pb-4">
                              <SheetTitle className="text-lg font-semibold">Filters</SheetTitle>
                           </SheetHeader>
                           <FilterSidebar 
                                filters={filters} 
                                onFilterChange={handleFilterChange} 
                                onPriceChange={handlePriceChange}
                                uniqueBrands={uniqueBrands} 
                                uniqueMaterials={uniqueMaterials} 
                            />
                           <SheetClose asChild className="mt-6 w-full">
                                <Button>Apply Filters</Button>
                           </SheetClose>
                      </SheetContent>
                  </Sheet>
             </div>
        </aside>

        {/* --- Main Product Grid --- */}
        <main className="flex-1 min-w-0">
             <div className="flex items-center justify-between mb-6 border-b pb-4">
                 <h1 className="text-2xl font-bold">Shop</h1>
                 <div className="flex items-center gap-2">
                     <Select value={sortOption} onValueChange={handleSortChange}>
                        <SelectTrigger className="w-[180px] text-xs h-9">
                            <SelectValue placeholder="Default Sorting" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Default Sorting</SelectItem>
                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                             <SelectItem value="name-asc">Name: A to Z</SelectItem>
                             <SelectItem value="name-desc">Name: Z to A</SelectItem>
                        </SelectContent>
                    </Select>

                     <Button variant={layout === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9" onClick={() => setLayout('grid')}>
                         <LayoutGrid className="h-4 w-4" />
                         <span className="sr-only">Grid View</span>
                     </Button>
                     <Button variant={layout === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-9 w-9" onClick={() => setLayout('list')}>
                         <List className="h-4 w-4" />
                         <span className="sr-only">List View</span>
                     </Button>
                 </div>
             </div>

            {isLoading ? (
                 layout === 'grid' ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-lg" />)}
                     </div>
                 ) : (
                      <div className="space-y-4">
                         {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
                     </div>
                 )
            ) : error ? (
                 <div className="text-center py-20 border rounded-lg">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-semibold">Error</h2>
                    <p className="text-muted-foreground mt-2">{error}</p>
                </div>
            ) : sortedProducts.length === 0 ? (
                <div className="text-center py-20 border rounded-lg">
                    <h2 className="text-xl font-semibold">No Jewelry Found</h2>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
                </div>
            ) : layout === 'grid' ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedProducts.map((product) => (
                       <ProductCard key={product._id} product={product} onAddToWishlist={handleAddToWishlist} currentUser={currentUser} layout="grid" />
                    ))}
                </div>
            ) : ( // List Layout
                <div className="space-y-4">
                     {sortedProducts.map((product) => (
                       <ProductCard key={product._id} product={product} onAddToWishlist={handleAddToWishlist} currentUser={currentUser} layout="list" />
                    ))}
                </div>
            )}
        </main>
    </div>
  );
}