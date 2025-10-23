import { useEffect, useState, useCallback } from 'react'; // Import useCallback from React
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchGoldPrice, GoldPriceData } from '@/lib/gold';
import { getTrendingProducts, Product } from '@/lib/products';
import { Skeleton } from '@/components/ui/skeleton';
import { Gem, Truck, RotateCw, Headset, Tag, ArrowRight, ShoppingCart, Heart, Search as SearchIcon, Instagram, Facebook, Twitter, Linkedin, Youtube, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useToast } from '@/hooks/use-toast';
import { addToWishlist } from '@/lib/user';
import { getCurrentUser } from '@/lib/auth';

// --- Header Component ---
function Header() {
    const navigate = useNavigate();
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center gap-2 mr-6">
                    <Gem className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl hidden sm:inline">Shrinagar</span>
                </Link>
                <nav className="hidden md:flex gap-6 items-center text-sm font-medium text-muted-foreground">
                    <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                    <Link to="/buyer" className="hover:text-foreground transition-colors">Shop</Link>
                    {/* Add other links like Blog, Contact etc. if needed */}
                </nav>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon"><SearchIcon className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}><Heart className="h-5 w-5" /></Button>
                    {/* <Button variant="ghost" size="icon"><ShoppingCart className="h-5 w-5" /></Button> */}
                    <Button onClick={() => navigate('/auth')} size="sm">Login</Button>
                </div>
            </div>
        </header>
    );
}

// --- Hero Section ---
function HeroSection() {
    const navigate = useNavigate();
    return (
        <section className="relative h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-amber-100 dark:from-gray-900 dark:via-slate-800 dark:to-zinc-900">
             {/* Using one of the provided model images */}
            <img
                src="https://images.unsplash.com/photo-1653227907864-560dce4c252d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGp3ZWxhcnl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=80&w=1974" // Updated Image
                alt="Elegant Jewelry Model"
                className="absolute inset-0 w-full h-full object-cover opacity-30 dark:opacity-20 pointer-events-none select-none"
                style={{ objectPosition: 'center 30%' }} // Adjust focus point if needed
            />
            <div className="relative z-10 text-center max-w-4xl mx-auto px-6 pt-16 sm:pt-0">
                <p className="text-lg text-rose-600 dark:text-rose-400 font-medium mb-2 tracking-wide">The Original</p>
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 text-foreground leading-tight">
                    Shine Bright
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
                    Discover our curated collection of exquisite jewelry. Timeless pieces for every occasion.
                </p>
                <Button
                    onClick={() => navigate('/buyer')}
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg rounded-full shadow-lg transition-transform hover:scale-105"
                >
                    Discover Now
                </Button>
            </div>
             <div className="absolute bottom-10 right-10 hidden md:flex flex-col items-center gap-2 text-xs text-muted-foreground opacity-70">
                 <span className="transform rotate-90">Watch Our History</span>
                 <div className="w-px h-16 bg-muted-foreground/50"></div>
            </div>
        </section>
    );
}

// --- Features Bar ---
function FeaturesBar() {
  const features = [
    { icon: Truck, title: "Free Delivery", description: "Orders from all items" },
    { icon: RotateCw, title: "Return & Refund", description: "Money back guarantee" },
    { icon: Tag, title: "Member Discount", description: "On every order over $140" },
    { icon: Headset, title: "Support 24/7", description: "Contact us 24 hours a day" },
  ];
  return (
    <section className="border-y bg-muted/30">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
            {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center md:flex-row gap-4">
                <feature.icon className="w-8 h-8 text-primary shrink-0" />
                <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
            </div>
            ))}
        </div>
    </section>
  );
}

// --- Live Gold Price Section ---
function GoldPriceTicker() {
  const [goldPrice, setGoldPrice] = useState<GoldPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGoldPrice();
      setGoldPrice(data);
    } catch (err) {
      setError("Could not fetch gold price.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const intervalId = setInterval(fetchPrice, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [fetchPrice]);

  return (
    <section className="py-6 border-b">
        <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
            <span className="font-semibold">Live Gold Price (XAU/USD):</span>
            {loading && !error && <Skeleton className="h-5 w-24" />}
            {error && <span className="text-destructive">{error}</span>}
            {goldPrice && !loading && (
                <>
                    <span className="font-bold text-lg">${goldPrice.price.toFixed(2)}</span>
                    {typeof goldPrice.changePercent === 'number' ? (
                        <span className={`font-medium ${goldPrice.changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {goldPrice.changePercent >= 0 ? '+' : ''}{goldPrice.changePercent.toFixed(2)}%
                        </span>
                    ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                    )}
                    <span className="text-muted-foreground text-xs hidden sm:inline">
                         (as of {format(new Date(goldPrice.timestamp * 1000), 'p')})
                    </span>
                </>
            )}
             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={fetchPrice} disabled={loading}>
                 <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
        </div>
    </section>
  );
}

// --- Trending Products Section ---
function TrendingProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
     const currentUser = getCurrentUser();

    useEffect(() => {
        const fetchTrending = async () => {
            setIsLoading(true);
            try {
                // Fetch more products initially if needed for carousel
                const data = await getTrendingProducts(); // Assuming this gets enough items
                setProducts(data.slice(0, 8)); // Limit to 8 for example
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Could not fetch trending products." });
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrending();
    }, [toast]);

     const handleAddToWishlist = async (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser) {
            toast({ variant: "destructive", title: "Login Required", description: "Please log in to add items to your wishlist." });
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
        <section className="py-16 sm:py-24">
            <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Popular on the Store</h2>
                {isLoading ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                         {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-lg" />)}
                     </div>
                ) : products.length === 0 ? (
                    <p className="text-center text-muted-foreground">No trending products found.</p>
                ) : (
                    <Carousel
                        opts={{ align: "start", loop: products.length > 4 }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4">
                            {products.map((product) => (
                                <CarouselItem key={product._id} className="pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                                     <ProductCard product={product} onAddToWishlist={handleAddToWishlist} currentUser={currentUser} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="absolute left-[-1rem] top-1/2 -translate-y-1/2 hidden sm:flex" />
                        <CarouselNext className="absolute right-[-1rem] top-1/2 -translate-y-1/2 hidden sm:flex" />
                    </Carousel>
                )}
            </div>
        </section>
    );
}

// --- Reusable Product Card Component ---
interface ProductCardProps {
  product: Product;
  onAddToWishlist: (e: React.MouseEvent, product: Product) => void;
  currentUser: any; // Simplified type for checking login status
}

function ProductCard({ product, onAddToWishlist, currentUser }: ProductCardProps) {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/product/${product._id}`);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
         e.preventDefault();
         e.stopPropagation();
         alert(`Added ${product.name} to cart (placeholder)`);
    };

     const handleQuickView = (e: React.MouseEvent) => {
         e.preventDefault();
         e.stopPropagation();
         alert(`Quick view for ${product.name} (placeholder)`);
     };

    return (
        <Card className="overflow-hidden group cursor-pointer h-full flex flex-col border-none shadow-none bg-transparent" onClick={handleCardClick}>
            <CardHeader className="p-0 relative aspect-square overflow-hidden rounded-lg">
                 {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                 ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-muted-foreground rounded-lg">No Image</div>
                 )}
                 {/* Hover Actions */}
                 <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                     <Button variant="outline" size="icon" className="h-9 w-9 bg-background/80 hover:bg-background rounded-full shadow" onClick={handleQuickView}>
                        <SearchIcon className="h-4 w-4" />
                     </Button>
                     {currentUser && (
                        <Button variant="outline" size="icon" className="h-9 w-9 bg-background/80 hover:bg-background rounded-full shadow" onClick={(e) => onAddToWishlist(e, product)}>
                            <Heart className="h-4 w-4" />
                        </Button>
                     )}
                     <Button variant="outline" size="icon" className="h-9 w-9 bg-background/80 hover:bg-background rounded-full shadow" onClick={handleAddToCart}>
                        <ShoppingCart className="h-4 w-4" />
                     </Button>
                </div>
            </CardHeader>
            <CardContent className="p-3 flex-grow flex flex-col items-center text-center">
                <CardTitle className="text-sm font-medium leading-tight mb-1 mt-2 line-clamp-2">{product.name}</CardTitle>
                <p className="text-sm font-semibold">${product.price.toFixed(2)}</p>
            </CardContent>
        </Card>
    );
}

// --- Category Showcase Section ---
function CategoryShowcase() {
     const navigate = useNavigate();
     // Using provided image URLs specific to categories
    const categories = [
        { name: "Rings", image: "https://plus.unsplash.com/premium_photo-1678834778658-9862d9987dd3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8andlbGFyeSUyMHJpbmdzfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=80" }, // Specific ring image
        { name: "Necklaces", image: "https://images.unsplash.com/photo-1721807550875-f76de8503a30?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGp3ZWxhcnklMjBuZWNrbGFzZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=80" }, // Specific necklace image
        { name: "Earrings", image: "https://images.unsplash.com/photo-1704637397679-f37e5e0dc429?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8andlbGFyeSUyMGVhcnJpbmdzfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=80" }, // Specific earring image
        { name: "Bracelets", image: "https://images.unsplash.com/photo-1671513511742-7ac6b6f16918?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8andlbGFyeSUyMGJyYWNlbGV0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=80" }, // Specific bracelet image
    ];
    return (
        <section className="py-16 sm:py-24 bg-muted/30">
            <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">Shop by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {categories.map(cat => (
                        <div key={cat.name} className="relative aspect-[4/5] sm:aspect-square group overflow-hidden rounded-lg cursor-pointer" onClick={() => navigate(`/buyer?category=${cat.name.toLowerCase()}`)}>
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center p-4">
                                <h3 className="text-white text-lg sm:text-xl font-semibold">{cat.name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


// --- Collaboration/Info Section ---
function CollaborationSection() {
     const navigate = useNavigate();
    return (
        <section className="py-16 sm:py-24 bg-emerald-100 dark:bg-emerald-900/30">
            <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
                <div className="relative aspect-[4/5] max-w-md mx-auto md:mx-0">
                    {/* Using one of the provided model images */}
                    <img
                        src="https://images.unsplash.com/photo-1630534591724-dba93846b629?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1169" // Updated Image
                        alt="Collaboration Model"
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                    />
                    {/* Using another provided image */}
                    <img
                        src="https://images.unsplash.com/photo-1716461534906-d31a17008801?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=955" // Updated Image
                        alt="Jewelry Detail"
                        className="absolute -bottom-8 -right-16 w-1/2 aspect-square object-cover rounded-lg shadow-xl border-4 border-emerald-100 dark:border-background hidden md:block"
                     />
                </div>
                <div className="text-center md:text-left">
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">Unity Collection</p>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Shop our limited Edition Collaborations</h2>
                    <p className="text-muted-foreground mb-8">
                        Discover unique pieces born from creativity and craftsmanship. Explore exclusive designs you won't find anywhere else.
                    </p>
                    <Button
                        size="lg"
                        className="bg-foreground text-background hover:bg-foreground/80 rounded-full"
                         onClick={() => navigate('/buyer')}
                    >
                       Shop Collection <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </section>
    );
}

// --- Footer Component ---
function Footer() {
    return (
        <footer className="bg-muted/50 border-t pt-16 pb-8">
            <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                    {/* Brand/Contact Info */}
                    <div className="lg:col-span-2 space-y-4">
                         <Link to="/" className="flex items-center gap-2 mb-4">
                            <Gem className="h-7 w-7 text-primary" />
                            <span className="font-bold text-2xl">Shrinagar</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">Got Questions? Call us</p>
                        <p className="text-lg font-semibold">+91 123 456 7890</p>
                        <p className="text-sm text-muted-foreground">
                            123 Jewelry Lane, Jaipur, <br/>Rajasthan, India 302001
                        </p>
                    </div>

                    {/* Links - My Account */}
                    <div>
                        <h4 className="font-semibold mb-4">My Account</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="/profile" className="hover:text-foreground">Track Orders</Link></li>
                            <li><Link to="/profile" className="hover:text-foreground">Shipping</Link></li>
                            <li><Link to="/profile" className="hover:text-foreground">Wishlist</Link></li>
                            <li><Link to="/profile" className="hover:text-foreground">My Account</Link></li>
                            <li><Link to="/profile" className="hover:text-foreground">Order History</Link></li>
                            <li><Link to="/profile" className="hover:text-foreground">Returns</Link></li>
                        </ul>
                    </div>

                     {/* Links - Information */}
                     <div>
                        <h4 className="font-semibold mb-4">Information</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link to="#" className="hover:text-foreground">Our Story</Link></li>
                            <li><Link to="#" className="hover:text-foreground">Careers</Link></li>
                            <li><Link to="#" className="hover:text-foreground">Privacy Policy</Link></li>
                            <li><Link to="#" className="hover:text-foreground">Terms & Conditions</Link></li>
                            <li><Link to="#" className="hover:text-foreground">Latest News</Link></li>
                            <li><Link to="#" className="hover:text-foreground">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="font-semibold mb-4">Subscribe</h4>
                        <p className="text-sm text-muted-foreground mb-4">Enter your email to get notified about new arrivals and discounts.</p>
                         <div className="flex gap-2">
                             <input type="email" placeholder="Enter your email" className="flex-grow px-3 py-2 text-sm border rounded-md bg-background" />
                             <Button size="sm">Subscribe</Button>
                         </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" size="icon" className="rounded-full"><Facebook className="h-4 w-4"/></Button>
                            <Button variant="outline" size="icon" className="rounded-full"><Twitter className="h-4 w-4"/></Button>
                            <Button variant="outline" size="icon" className="rounded-full"><Linkedin className="h-4 w-4"/></Button>
                            <Button variant="outline" size="icon" className="rounded-full"><Instagram className="h-4 w-4"/></Button>
                            <Button variant="outline" size="icon" className="rounded-full"><Youtube className="h-4 w-4"/></Button>
                        </div>
                    </div>
                </div>
                <div className="border-t pt-8 text-center text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Shrinagar. All Rights Reserved.
                </div>
            </div>
        </footer>
    );
}


// --- Main Landing Component ---
const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
            <HeroSection />
            <FeaturesBar />
            <GoldPriceTicker />
            <CategoryShowcase />
            <TrendingProducts />
            <CollaborationSection />
        </main>
        <Footer />
    </div>
  );
};

export default Landing;

