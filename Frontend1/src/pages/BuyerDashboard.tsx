import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom"; // Added useSearchParams
import { Button } from "../components/ui/button"; // Path fix
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card"; // Path fix
import { Badge } from "../components/ui/badge"; // Path fix
import { Product, getApprovedProducts, ProductFilters } from "../lib/products"; // Path fix
import { ExternalLink, LoaderCircle, Search, SlidersHorizontal, Heart, History, X, LayoutGrid, List, ShoppingCart } from 'lucide-react'; // Added layout icons
import { useToast } from "../hooks/use-toast"; // Path fix
import { Input } from "../components/ui/input"; // Path fix
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"; // Path fix
import { Slider } from "../components/ui/slider"; // Path fix
import { addToWishlist } from "../lib/user"; // Path fix
import { getCurrentUser } from "../lib/auth"; // Path fix
import debounce from 'lodash.debounce';
import { Label } from "../components/ui/label"; // Path fix
import { Skeleton } from "../components/ui/skeleton"; // Path fix
import { LoadingSpinner } from "../components/ui/LoadingSpinner"; // Path fix
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "../components/ui/sheet"; // Path fix
import Rating from "../components/ui/Rating"; // --- NEW: Import Rating Component ---

// Interface for ProductCard props
interface ProductCardProps {
    product: Product;
    onAddToWishlist: (e: React.MouseEvent, product: Product) => void;
    currentUser: any; // Simplified type for checking login status
    layout: 'grid' | 'list'; // Added layout prop
}

// Reusable ProductCard Component - Modified for grid/list and hover effects
function ProductCard({ product, onAddToWishlist, currentUser, layout }: ProductCardProps) {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/product/${product._id}`);
    };

    // Placeholder Add to Cart
    const handleAddToCart = (e: React.MouseEvent) => {
         e.preventDefault();
         e.stopPropagation();
         // Implement cart logic here
         alert(`Added ${product.name} to cart (placeholder)`);
    };

     // Placeholder Quick View
     const handleQuickView = (e: React.MouseEvent) => {
         e.preventDefault();
         e.stopPropagation();
         // Implement quick view modal logic here
         alert(`Quick view for ${product.name} (placeholder)`);
     };

     if (layout === 'list') {
         return (
            <Card className="overflow-hidden group cursor-pointer w-full flex flex-col sm:flex-row" onClick={handleCardClick}>
                <div className="relative aspect-square sm:w-48 shrink-0">
                     {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover"/>
                     ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-muted-foreground">No Image</div>
                     )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                    <CardTitle className="text-lg font-semibold leading-tight mb-1 group-hover:underline line-clamp-2">{product.name}</CardTitle>
                    {/* --- NEW: Added Rating --- */}
                    <Rating value={product.rating} text={`(${product.numReviews} reviews)`} className="mb-2" />
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-3 flex-grow">{product.description}</p>
                    <div className="flex justify-between items-center mt-auto pt-2">
                        <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="sm" onClick={handleAddToCart}>Add To Cart</Button>
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
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                 ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-muted-foreground">No Image</div>
                 )}
                 {/* Hover Actions */}
                 <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                     <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 hover:bg-background rounded-full shadow" onClick={handleQuickView}>
                        <Search className="h-4 w-4" />
                     </Button>
                     {currentUser && (
                        <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 hover:bg-background rounded-full shadow" onClick={(e) => onAddToWishlist(e, product)}>
                            <Heart className="h-4 w-4" />
                        </Button>
                     )}
                     <Button variant="outline" size="icon" className="h-8 w-8 bg-background/80 hover:bg-background rounded-full shadow" onClick={handleAddToCart}>
                        <ShoppingCart className="h-4 w-4" />
                     </Button>
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow flex flex-col items-center text-center">
                <CardTitle className="text-base font-medium leading-tight mb-1">{product.name}</CardTitle>
                <p className="text-sm font-semibold">${product.price.toFixed(2)}</p>
                {/* --- NEW: Added Rating --- */}
                <Rating value={product.rating} text={`(${product.numReviews})`} className="justify-center mt-1" />
            </CardContent>
        </Card>
    );
}

// Filter Sidebar Component
function FilterSidebar({ filters, onFilterChange, uniqueBrands, uniqueMaterials }: {
    filters: ProductFilters;
    onFilterChange: (key: keyof ProductFilters, value: string | number | undefined) => void;
    uniqueBrands: string[];
    uniqueMaterials: string[];
}) {
    const handlePriceChange = (value: number[]) => {
      onFilterChange('minPrice', value[0]);
      onFilterChange('maxPrice', value[1]);
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
                        onChange={e => onFilterChange('keyword', e.target.value || undefined)} // Pass undefined if empty
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
                    <span>${filters.minPrice ?? 0}</span>
                    <span>${filters.maxPrice ?? 50000}</span>
                </div>
                <Slider
                    defaultValue={[0, 50000]}
                    max={50000}
                    step={100}
                    className="mt-2"
                    value={[filters.minPrice ?? 0, filters.maxPrice ?? 50000]}
                    onValueChange={handlePriceChange} // Debounced update happens in parent
                />
            </div>
        </div>
    );
}


export default function BuyerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>(() => {
      // Initialize filters from URL search params
      const params = new URLSearchParams(window.location.search);
      return {
          keyword: params.get('keyword') || undefined,
          category: params.get('category') || undefined,
          brand: params.get('brand') || undefined,
          material: params.get('material') || undefined,
          minPrice: Number(params.get('minPrice')) || 0,
          maxPrice: Number(params.get('maxPrice')) || 50000,
      };
  });
  const [layout, setLayout] = useState<'grid' | 'list'>('grid'); // State for layout
  const [sortOption, setSortOption] = useState<string>('default'); // State for sorting
  const [searchParams, setSearchParams] = useSearchParams();

  const { toast } = useToast();
  const currentUser = getCurrentUser();

  // Memoize derived lists to prevent recalculations unless products change
  const uniqueBrands = useMemo(() => {
    const brands = products.map(p => p.brand).filter(Boolean); // Filter out potential undefined/null
    return [...new Set(brands)].sort(); // Sort alphabetically
  }, [products]);

  const uniqueMaterials = useMemo(() => {
    const materials = products.map(p => p.material).filter(Boolean);
    return [...new Set(materials)].sort();
  }, [products]);


  // Debounced fetch function
  const debouncedFetchProducts = useCallback(
    debounce(async (currentFilters: ProductFilters) => {
      setIsLoading(true);
      try {
        const approvedProducts = await getApprovedProducts(currentFilters);
        setProducts(approvedProducts);

        // Update URL search params
        const newParams = new URLSearchParams();
        Object.entries(currentFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== '' && !(key === 'minPrice' && value === 0) && !(key === 'maxPrice' && value === 50000)) {
            newParams.set(key, String(value));
          }
        });
        setSearchParams(newParams, { replace: true }); // Use replace to avoid history pollution

      } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Could not fetch jewelry." });
      } finally {
        setIsLoading(false);
      }
    }, 500), // Adjust debounce delay as needed (e.g., 500ms)
  [toast, setSearchParams]); // setSearchParams is stable

  // Effect to trigger fetch when filters change
  useEffect(() => {
    debouncedFetchProducts(filters);
    // Cancel the debounce on unmount
    return () => debouncedFetchProducts.cancel();
  }, [filters, debouncedFetchProducts]);


  const handleFilterChange = (key: keyof ProductFilters, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

   const handleAddToWishlist = async (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser) {
            toast({ variant: "destructive", title: "Login Required", description: "Please log in to add items to your wishlist." });
            // Consider navigating to /auth or showing a login modal from BuyerLayout
            return;
        }
        try {
            await addToWishlist(product._id);
            toast({ title: "Success", description: `${product.name} added to your wishlist!` });
            // Consider updating a local wishlist state in BuyerLayout context if needed
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Could not add to wishlist." });
        }
    };

    // Sorting logic based on sortOption
    const sortedProducts = useMemo(() => {
        let sorted = [...products];
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
            // Add more cases like 'trending', 'newest' if needed
            default: // 'default' or any other case
                // Keep original order or implement default sort (e.g., by relevance if available)
                break;
        }
        return sorted;
    }, [products, sortOption]);


  return (
    <div className="container mx-auto max-w-screen-2xl p-4 md:px-8 flex flex-col md:flex-row gap-8">
        {/* --- Sidebar --- */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0">
             <h2 className="text-xl font-semibold mb-4 hidden md:block">Filters</h2>
             {/* Desktop Sidebar */}
             <div className="hidden md:block">
                 <FilterSidebar filters={filters} onFilterChange={handleFilterChange} uniqueBrands={uniqueBrands} uniqueMaterials={uniqueMaterials} />
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
                           <FilterSidebar filters={filters} onFilterChange={handleFilterChange} uniqueBrands={uniqueBrands} uniqueMaterials={uniqueMaterials} />
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
                     <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger className="w-[180px] text-xs h-9">
                            <SelectValue placeholder="Default Sorting" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="default">Default Sorting</SelectItem>
                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                             <SelectItem value="name-asc">Name: A to Z</SelectItem>
                             <SelectItem value="name-desc">Name: Z to A</SelectItem>
                            {/* Add more options like popularity, newest */}
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
                // Use LoadingSpinner or Skeletons
                 layout === 'grid' ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-lg" />)}
                     </div>
                 ) : (
                      <div className="space-y-4">
                         {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}
                     </div>
                 )
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