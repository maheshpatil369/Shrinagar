import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Product, getApprovedProducts, ProductFilters } from "../lib/products";
import {
  ExternalLink,
  LoaderCircle,
  Search,
  SlidersHorizontal,
  Heart,
  X,
  LayoutGrid,
  List,
  ShoppingCart,
  AlertCircle,
  Menu,
  Gem,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { addToWishlist } from "../lib/user";
import { getCurrentUser } from "../lib/auth";
import { Skeleton } from "../components/ui/skeleton";
import Rating from "../components/ui/Rating";
import { useAuthModal } from "../context/AuthModalContext";
import debounce from "lodash.debounce";
import { Label } from "../components/ui/label";
import { cn } from "../lib/utils";
import { getImageUrl } from "../lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "../components/ui/sheet";

// ---------------- ProductCard ----------------
interface ProductCardProps {
  product: Product;
  onAddToWishlist: (e: React.MouseEvent, product: Product) => void;
  currentUser: any;
  layout: "grid" | "list";
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
    window.open(product.affiliateUrl, "_blank", "noopener,noreferrer");
  };

  // --- Image Error Handler ---
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = getImageUrl("");
  };

  // ---------- LIST VIEW (responsive, compact on mobile) ----------
  if (layout === "list") {
    return (
      <Card
        className="
          overflow-hidden group cursor-pointer w-full 
          flex flex-row 
          bg-[#071324] border border-white/10 rounded-xl
          hover:border-yellow-400/40 hover:shadow-[0_0_15px_rgba(255,215,0,0.25)]
          transition-all duration-300
        "
        onClick={handleCardClick}
      >
        {/* IMAGE SECTION */}
        <div className="relative w-24 h-24 sm:w-48 sm:h-auto aspect-square shrink-0 rounded-lg overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={getImageUrl(product.images[0])}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-[#0e1b33] flex items-center justify-center text-sm text-white/40">
              No Image
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-3 sm:p-4 flex flex-col flex-grow text-white">
          <CardTitle className="text-base sm:text-lg font-semibold leading-tight mb-1 group-hover:text-yellow-300 transition-colors line-clamp-2">
            {product.name}
          </CardTitle>

          <Rating value={product.rating} text={`(${product.numReviews} reviews)`} className="mb-2" />

    <p
  className="
    text-xs sm:text-sm text-white/60 mb-2 
    overflow-hidden text-ellipsis 
    line-clamp-2 sm:line-clamp-3 
    break-words
    max-w-full
  "
>
  {product.description}
</p>


          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mt-auto pt-2">
<div
  className="
    flex flex-wrap items-center justify-between 
    border-b border-white/10

    /* NEW SPACING FOR ALL SCREENS */
    mb-4 pb-3 mt-1
  "
>

              <Button
                size="sm"
                className="
                  flex-1
                  bg-yellow-400 text-black font-semibold
                  hover:bg-white hover:text-black
                  rounded-full shadow-md
                  transition-all duration-300
                  border border-yellow-400
                "
                onClick={handleAffiliateClick}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Seller
              </Button>

              {/* AR-VR BUTTON */}
              <Button
                size="sm"
                className="
                  bg-[#0e1b33] text-yellow-300 border border-yellow-400
                  hover:bg-yellow-400 hover:text-black
                  rounded-full transition-all duration-300 shadow-md
                "
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Go to AR-VR Try On");
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                AR-VR
              </Button>

              {/* WISHLIST */}
              {currentUser && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/50 hover:text-red-500 transition-all"
                  onClick={(e) => onAddToWishlist(e, product)}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // ---------- GRID VIEW CARD (desktop UI unchanged) ----------
  return (
    <Card
      className="
        group cursor-pointer h-full flex flex-col 
        bg-[#071324] border border-white/10 rounded-xl 
        hover:border-yellow-400/40 hover:shadow-[0_0_20px_rgba(255,215,0,0.25)]
        transition-all duration-300 overflow-hidden
      "
      onClick={handleCardClick}
    >
      {/* IMAGE SECTION */}
      <CardHeader className="p-0 relative aspect-square overflow-hidden">
        {/* BEST SELLER BADGE */}
        <Badge
          className="
            absolute top-3 left-3 z-10 
            bg-green-600 text-white px-3 py-1 rounded-full text-[10px] font-semibold
            shadow-md
        "
        >
          Best Seller
        </Badge>

        {/* IMAGE */}
        {product.images && product.images.length > 0 ? (
          <img
            src={getImageUrl(product.images[0])}
            alt={product.name}
            onError={handleImageError}
            className="
              w-full h-full object-cover 
              transition-transform duration-500 
              group-hover:scale-110
            "
          />
        ) : (
          <div
            className="
              w-full h-full bg-[#0e1b33] 
              flex items-center justify-center 
              text-sm text-white/40
            "
          >
            No Image
          </div>
        )}

        {/* WISHLIST BUTTON */}
        <div
          className="
            absolute top-3 right-3 opacity-0 group-hover:opacity-100 
            transition-all duration-300 z-20
          "
        >
          {currentUser && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => onAddToWishlist(e, product)}
              className="
                h-8 w-8 rounded-full 
                bg-black/40 backdrop-blur-sm border border-white/20 
                hover:bg-yellow-400 hover:text-black
                transition-all duration-300
              "
            >
              <Heart className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="p-4 flex flex-col flex-grow text-white">
        <CardTitle
          className="
          text-base font-medium leading-tight mb-1 line-clamp-2 
          group-hover:text-yellow-300 transition-colors
        "
        >
          {product.name}
        </CardTitle>

        <Rating value={product.rating} text={`(${product.numReviews})`} className="mt-1" />

        {/* PRICE DISPLAY REMOVED */}
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="p-4 pt-0 flex gap-3">
        {/* VISIT SELLER */}
        <Button
          size="sm"
          className="
            flex-1 bg-yellow-400 text-black font-semibold
            hover:bg-white hover:text-black
            rounded-full transition-all duration-300 shadow-md
          "
          onClick={handleAffiliateClick}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Visit Seller
        </Button>

        {/* AR-VR */}
        <Button
          size="sm"
          className="
            flex-1 bg-[#0e1b33] border border-yellow-400 text-yellow-300
            hover:bg-yellow-400 hover:text-black
            rounded-full transition-all duration-300 shadow-md
          "
          onClick={(e) => {
            e.stopPropagation();
            console.log("Go to AR-VR Try On");
          }}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          AR-VR
        </Button>
      </CardFooter>
    </Card>
  );
}

// --- FilterSidebar Component (Includes Category, Seller ID, Material) ---
function FilterSidebar({
  filters,
  onFilterChange,
  uniqueMaterials,
}: {
  filters: ProductFilters;
  onFilterChange: (key: keyof (ProductFilters & { sellerId?: string }), value: string | undefined) => void;
  uniqueMaterials: string[];
}) {
  const [localKeyword, setLocalKeyword] = useState<string>(filters.keyword || "");
  const [localSeller, setLocalSeller] = useState<string>((filters as any).sellerId || "");

  useEffect(() => {
    setLocalKeyword(filters.keyword || "");
    setLocalSeller((filters as any).sellerId || "");
  }, [filters.keyword, (filters as any).sellerId]);

  const handleClearFilters = () => {
    setLocalKeyword("");
    setLocalSeller("");

    onFilterChange("keyword", undefined);
    onFilterChange("category", undefined);
    onFilterChange("sellerId", undefined);
    onFilterChange("material", undefined);
  };

  return (
    <div className="space-y-6">
<div
  className="
    flex items-center gap-2 sm:gap-3 
    flex-wrap sm:flex-nowrap

    /* mobile: make buttons smaller */
    [&_button]:h-9 
    [&_button]:text-sm 
  "
>
        <h3 className="text-xl font-bold flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" /> Filters
        </h3>
        {/* Clear All Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="text-sm text-red-400 hover:text-red-500 hover:bg-red-500/10"
        >
          Clear All
        </Button>
      </div>

      {/* Search (Keyword) */}
      <div>
        <Label className="text-sm font-medium">Search Keyword</Label>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jewelry..."
            className="pl-9"
            value={localKeyword}
            onChange={(e) => {
              setLocalKeyword(e.target.value);
              onFilterChange("keyword", e.target.value || undefined);
            }}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <Label className="text-sm font-medium">Category</Label>
        <Select
          value={filters.category || "all"}
          onValueChange={(value) => onFilterChange("category", value === "all" ? undefined : value)}
        >
          <SelectTrigger className="bg-[#0F172A] border border-gray-700 text-gray-200 rounded-md">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>

          <SelectContent className="bg-[#0F172A] border border-gray-700 text-gray-200">
            <SelectItem value="all">All Categories</SelectItem>
            {["ring", "necklace", "bracelet", "earrings", "watch", "other"].map((cat) => (
              <SelectItem key={cat} value={cat} className="capitalize">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Seller Filter */}
      <div>
        <Label className="text-sm font-medium">Seller ID or Name</Label>
        <div className="relative mt-1">
          <ShoppingCart className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Enter Seller ID/Name..."
            className="pl-9"
            value={localSeller}
            onChange={(e) => {
              setLocalSeller(e.target.value);
              onFilterChange("sellerId", e.target.value || undefined);
            }}
          />
        </div>
      </div>

      {/* Material Filter */}
      <div>
        <Label className="text-sm font-medium">Material</Label>
        <Select
          value={filters.material || "all"}
          onValueChange={(value) => onFilterChange("material", value === "all" ? undefined : value)}
          disabled={uniqueMaterials.length === 0}
        >
          <SelectTrigger className="bg-[#0F172A] border border-gray-700 text-gray-200 rounded-md">
            <SelectValue placeholder="All Materials" />
          </SelectTrigger>

          <SelectContent className="bg-[#0F172A] border border-gray-700 text-gray-200">
            <SelectItem value="all">All Materials</SelectItem>
            {uniqueMaterials.map((mat) => (
              <SelectItem key={mat} value={mat} className="capitalize">
                {mat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// --- Main Dashboard Component ---
export default function BuyerDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allMaterials, setAllMaterials] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  const { setAuthModalOpen, setPostLoginRedirect } = useAuthModal();
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const filters = useMemo(
    (): ProductFilters & { sellerId?: string } => ({
      keyword: searchParams.get("keyword") || undefined,
      category: searchParams.get("category") || undefined,
      sellerId: searchParams.get("sellerId") || undefined,
      material: searchParams.get("material") || undefined,
    }),
    [searchParams]
  );

  const sortOption = searchParams.get("sort") || "default";

  const debouncedUpdateUrlParams = useCallback(
    debounce((newFilters: ProductFilters & { sellerId?: string }) => {
      const newParams = new URLSearchParams(searchParams);
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== 0) {
          newParams.set(key, String(value));
        } else {
          newParams.delete(key);
        }
      });
      setSearchParams(newParams, { replace: true });
    }, 500),
    [setSearchParams, searchParams]
  );

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const allItems = await getApprovedProducts({});
        const materials = [...new Set(allItems.map((p) => p.material).filter(Boolean))].sort();
        setAllMaterials(materials);
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    };
    loadFilterOptions();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    getApprovedProducts(filters)
      .then((approvedProducts) => {
        setProducts(approvedProducts);
        setError(null);
      })
      .catch((error) => {
        console.error("Failed to fetch products:", error);
        setError("Could not fetch jewelry. Please try refreshing.");
        toast({ variant: "destructive", title: "Error", description: "Could not fetch jewelry." });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [filters, toast]);

  const handleFilterChange = (key: keyof (ProductFilters & { sellerId?: string }), value: string | undefined) => {
    const newFilters = { ...filters, [key]: value };
    debouncedUpdateUrlParams(newFilters);
  };

  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "default") newParams.delete("sort");
    else newParams.set("sort", value);
    setSearchParams(newParams, { replace: true });
  };

  const sortedProducts = useMemo(() => {
    let sorted = [...products];
    switch (sortOption) {
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
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
      toast({
        variant: "destructive",
        title: "Login Required",
        description: "Please log in to add items to your wishlist.",
      });
      setPostLoginRedirect(window.location.pathname);
      setAuthModalOpen(true);
      return;
    }
    try {
      await addToWishlist(product._id);
      toast({ title: "Success", description: `${product.name} added to your wishlist!` });
    } catch (error) {
      const errorMessage =
        (error as any).response?.data?.message ||
        (error instanceof Error ? error.message : "Could not add to wishlist.");
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    }
  };

  const filterProps = useMemo(
    () => ({
      filters,
      onFilterChange: handleFilterChange,
      uniqueMaterials: allMaterials,
    }),
    [filters, handleFilterChange, allMaterials]
  );

  return (
    <div className="min-h-screen w-full bg-[#020817] text-white px-4 md:px-10 py-6">
      {/* HEADER ROW */}
<div
  className="
    flex flex-wrap items-center justify-between 
    mb-6 sm:mb-10 
    pb-4 sm:pb-6 
    border-b border-white/10

    /* MOBILE FIX: reduce spacing above heading */
    mt-2 sm:mt-0
  "
>
        <h1 className="text-3xl md:text-4xl font-light tracking-[0.15em] text-white flex items-center gap-3">
          <Gem className="h-6 w-6 text-brand-yellow" />
          MARKET PLACE
        </h1>

        <div className="flex items-center gap-3">
          {/* FILTER BUTTON */}
          <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <SheetTrigger asChild>
           <Button
  variant="outline"
  size="sm"
  className="
    h-9 px-3 bg-white/5 text-white border-white/20 hover:bg-white/10
    text-sm
  "
>

                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[300px] sm:max-w-xs bg-[#051024] text-white border-r border-white/10"
            >
              <SheetHeader>
                <SheetTitle className="text-2xl font-semibold text-brand-yellow">Product Filters</SheetTitle>
              </SheetHeader>

              <FilterSidebar {...filterProps} />

              <SheetClose asChild>
                <Button className="w-full mt-4 bg-brand-yellow text-black hover:bg-yellow-400">
                  Apply & Close
                </Button>
              </SheetClose>
            </SheetContent>
          </Sheet>

          {/* SORTING */}
          <Select value={sortOption} onValueChange={handleSortChange}>
<SelectTrigger
  className="
    w-[130px] sm:w-[160px] 
    h-9 sm:h-10 
    bg-white/5 border-white/20 text-white text-sm
  "
>
              <SelectValue placeholder="Default Sorting" />
            </SelectTrigger>
            <SelectContent className="bg-[#051024] text-white border-white/10">
              <SelectItem value="default">Default Sorting</SelectItem>
              <SelectItem value="name-asc">Name: A → Z</SelectItem>
              <SelectItem value="name-desc">Name: Z → A</SelectItem>
            </SelectContent>
          </Select>

          {/* LAYOUT SWITCH */}
          <Button
            variant={layout === "grid" ? "secondary" : "ghost"}
            size="icon"
            className={`h-10 w-10 sm:h-10 sm:w-10 rounded-lg ${
              layout === "grid" ? "bg-brand-yellow text-black" : "text-white hover:bg:white/10"
            }`}
            onClick={() => setLayout("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>

          <Button
            variant={layout === "list" ? "secondary" : "ghost"}
            size="icon"
            className={`h-10 w-10 rounded-lg ${
              layout === "list" ? "bg-brand-yellow text-black" : "text-white hover:bg-white/10"
            }`}
            onClick={() => setLayout("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* SIDEBAR HIDDEN - MOBILE ONLY */}
        <aside className="hidden">
          <FilterSidebar {...filterProps} />
        </aside>

        {/* PRODUCTS SECTION */}
        <div className="lg:col-span-12">
          {isLoading ? (
            <div
              className={`grid gap-10 ${
                layout === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"
              }`}
            >
              {[...Array(layout === "grid" ? 8 : 6)].map((_, i) => (
                <Skeleton
                  key={i}
                  className={`rounded-xl bg:white/10 ${layout === "grid" ? "h-80" : "h-28"}`}
                />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20 border border-white/10 rounded-xl bg-[#071324]">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <h2 className="text-xl font-semibold">Error Loading Products</h2>
              <p className="text-white/60 mt-2">{error}</p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-20 border border-white/10 rounded-xl bg-[#071324]">
              <h2 className="text-xl font-semibold">No Jewelry Found</h2>
              <p className="text-white/60 mt-2">Try adjusting your filters.</p>
            </div>
          ) : layout === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-10">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToWishlist={handleAddToWishlist}
                  currentUser={currentUser}
                  layout="grid"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToWishlist={handleAddToWishlist}
                  currentUser={currentUser}
                  layout="list"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
