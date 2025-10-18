// maheshpatil369/shrinagar/Shrinagar-ec6ca96d478d060fcb4be15266db4b0ee9642b37/Frontend1/src/pages/BuyerDashboard.tsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product, getApprovedProducts, ProductFilters } from "../lib/products";
import { ExternalLink, LoaderCircle, Search, SlidersHorizontal, Heart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { addToWishlist } from "../lib/user";
import { getCurrentUser } from "../lib/auth";
import debounce from 'lodash.debounce';
import { Label } from "@/components/ui/label";

export default function BuyerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>({ minPrice: 0, maxPrice: 50000 });
  
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  const uniqueBrands = useMemo(() => {
    if (!products || products.length === 0) return [];
    return [...new Set(products.map(p => p.brand))];
  }, [products]);
  const uniqueMaterials = useMemo(() => {
    if (!products || products.length === 0) return [];
    return [...new Set(products.map(p => p.material))];
  }, [products]);

  const fetchProducts = useCallback(
    debounce(async (currentFilters: ProductFilters) => {
      setIsLoading(true);
      try {
        const approvedProducts = await getApprovedProducts(currentFilters);
        setProducts(approvedProducts);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch jewelry.",
        });
      } finally {
        setIsLoading(false);
      }
    }, 300), 
  [toast]);

  useEffect(() => {
    fetchProducts(filters);
  }, [fetchProducts, filters]);

  const handleFilterChange = (key: keyof ProductFilters, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handlePriceChange = (value: number[]) => {
      handleFilterChange('minPrice', value[0]);
      handleFilterChange('maxPrice', value[1]);
  };

  const handleAddToWishlist = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to add items to your wishlist.",
        });
        return;
    }
    try {
        await addToWishlist(product._id);
        toast({
            title: "Success",
            description: `${product.name} added to your wishlist!`,
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.response?.data?.message || "Could not add to wishlist.",
        });
    }
  };

  return (
    <div className="flex">
        {/* Filters Sidebar */}
        <aside className="w-64 p-6 border-r sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto hidden md:block">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><SlidersHorizontal className="h-5 w-5"/> Filters</h2>
            <div className="space-y-6">
                <div>
                    <Label className="text-sm font-medium">Search</Label>
                    <div className="relative mt-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search jewelry..." className="pl-9" onChange={e => handleFilterChange('keyword', e.target.value)}/>
                    </div>
                </div>
                <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Select onValueChange={value => handleFilterChange('category', value === "all" ? undefined : value)}>
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
                    <Select onValueChange={value => handleFilterChange('brand', value === "all" ? undefined : value)} disabled={uniqueBrands.length === 0}>
                        <SelectTrigger><SelectValue placeholder="All Brands" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Brands</SelectItem>
                            {uniqueBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <div>
                    <Label className="text-sm font-medium">Material</Label>
                    <Select onValueChange={value => handleFilterChange('material', value === "all" ? undefined : value)} disabled={uniqueMaterials.length === 0}>
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
                        <span>${filters.minPrice}</span>
                        <span>${filters.maxPrice}</span>
                    </div>
                    <Slider 
                        defaultValue={[0, 50000]} 
                        max={50000} 
                        step={100} 
                        className="mt-2"
                        value={[filters.minPrice || 0, filters.maxPrice || 50000]}
                        onValueChange={handlePriceChange}
                    />
                </div>
            </div>
        </aside>

        <main className="flex-1 p-4 md:p-8">
            <section>
                <h2 className="text-2xl font-bold mb-4">All Jewelry</h2>
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {[...Array(12)].map((_, i) => <Card key={i} className="h-80 animate-pulse bg-muted"></Card>)}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 border rounded-lg">
                        <h2 className="text-2xl font-semibold">No Jewelry Found</h2>
                        <p className="text-muted-foreground mt-2">Try adjusting your filters or check back later!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                           <ProductCard key={product._id} product={product} onAddToWishlist={handleAddToWishlist} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    </div>
  );
}

// Product Card Component
interface ProductCardProps {
    product: Product;
    onAddToWishlist: (e: React.MouseEvent, product: Product) => void;
}

function ProductCard({ product, onAddToWishlist }: ProductCardProps) {
    const currentUser = getCurrentUser();
    return (
        <Card className="overflow-hidden flex flex-col group">
            <CardHeader className="p-0 relative">
                <Link to={`/product/${product._id}`}>
                    <img 
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                    />
                </Link>
                {currentUser && (
                  <Button 
                      size="icon" 
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/70 text-red-500 hover:bg-background"
                      variant="ghost"
                      onClick={(e) => onAddToWishlist(e, product)}
                  >
                      <Heart className="h-4 w-4" />
                  </Button>
                )}
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                 <Link to={`/product/${product._id}`} className="space-y-1">
                    <Badge variant="secondary" className="mb-2 capitalize">{product.category}</Badge>
                    <CardTitle className="text-lg font-semibold leading-tight mb-1 group-hover:underline">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
                 </Link>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                <Button asChild size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                  <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer">
                    View <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
            </CardFooter>
        </Card>
    );
}