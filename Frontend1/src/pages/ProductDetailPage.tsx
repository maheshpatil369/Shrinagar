// Frontend1/src/pages/ProductDetailPage.tsx
import React from 'react'; // Added explicit React import for clarity
import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, Product, trackAffiliateClick, PopulatedSeller } from '../lib/products';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, LoaderCircle, ArrowLeft, Heart, Mail, Lock, View, Maximize } from 'lucide-react'; // Ensure View is imported
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { addToWishlist, getWishlist, isProductInWishlist, removeFromWishlist } from '../lib/user';
import { getCurrentUser, login } from '../lib/auth';
// Added Dialog imports for image zoom
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // Removed DialogTrigger as it's not used here
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';


function addRecentlyViewed(productId: string) {
    let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    // Add to front, remove duplicates
    viewed = [productId, ...viewed.filter((id: string) => id !== productId)];
    // Limit to 8 items
    if (viewed.length > 8) viewed = viewed.slice(0, 8);
    localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
}

function AuthModal({ open, onOpenChange, onLoginSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, onLoginSuccess: () => void }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const user = await login({ email, password });
            localStorage.setItem('userInfo', JSON.stringify(user));
            onLoginSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader><DialogTitle className="text-2xl font-bold text-center">Login Required</DialogTitle></DialogHeader>
                <form onSubmit={handleLogin} className="flex flex-col justify-center items-center px-4 md:px-8 text-center">
                    <p className="text-muted-foreground mb-6">Please log in to continue.</p>
                    {error && (<Alert variant="destructive" className="mb-4 text-left"><Terminal className="h-4 w-4" /><AlertTitle>Login Failed</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>)}
                    <div className="w-full space-y-4">
                        <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="login-email" type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="pl-9 bg-muted border-0" /></div>
                        <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="login-password" type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="pl-9 bg-muted border-0" /></div>
                    </div>
                    <Button type="submit" className="mt-6 w-full max-w-xs" disabled={isLoading}>{isLoading ? <LoaderCircle className="animate-spin" /> : 'Sign In'}</Button>
                    <p className="text-sm mt-4 text-muted-foreground">Don't have an account? <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/auth')}>Sign Up</Button></p>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useState(getCurrentUser());

    // State for image zoom modal
    const [showImageModal, setShowImageModal] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

     const fetchWishlist = useCallback(async () => {
        try {
            const data = await getWishlist(); // Handles local/API automatically
            setWishlist(data);
        } catch (error) {
            // Avoid showing error for guests, but try loading local anyway
            if (!getCurrentUser()) {
                try {
                     const localIds = JSON.parse(localStorage.getItem('shrinagar_wishlist') || '[]');
                     // Note: We need a way to get product details from IDs for guests,
                     // currently getWishlist does this if it can fetch /products?ids=...
                     // If that fails too, the wishlist remains empty.
                     setWishlist([]); // Default to empty if local fetch fails or no IDs
                } catch (e) {
                     console.error("Failed to parse or load local wishlist", e);
                     setWishlist([]);
                }
            } else {
                 console.error("Failed to fetch wishlist for logged in user:", error);
                 // Optionally show a toast for logged-in users
                 // toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch wishlist.' });
            }
        }
    }, []); // Empty dependency array is fine here as getWishlist internally checks currentUser

    const fetchProduct = useCallback(async (productId: string) => {
        setIsLoading(true);
        try {
            const { product: data, recommendations: recs } = await getProductById(productId);
            setProduct(data);
            setRecommendations(recs);
            addRecentlyViewed(productId);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error fetching product', description: error.response?.data?.message || 'Could not fetch product details.' });
            setProduct(null);
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (id) {
            window.scrollTo(0, 0);
            fetchProduct(id);
            fetchWishlist();
            setCurrentUser(getCurrentUser());
        } else {
             setIsLoading(false);
             setProduct(null);
        }
    }, [id, fetchProduct, fetchWishlist]);


    useEffect(() => {
        if (product) {
            setIsInWishlist(isProductInWishlist(product._id, wishlist));
        } else {
            setIsInWishlist(false);
        }
    }, [product, wishlist]);


    const handleAffiliateClick = () => {
         if (!currentUser) {
            setShowLoginModal(true);
            return;
        }
        if (product) {
            trackAffiliateClick(product._id).catch(err => console.error("Failed to track click", err));
            window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const handleWishlistToggle = async () => {
        if (!product) return;

        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }

        const action = isInWishlist ? removeFromWishlist : addToWishlist;
        const successMessage = isInWishlist
            ? `${product.name} removed from wishlist.`
            : `${product.name} added to wishlist.`;

        const previousWishlist = wishlist;
        // Optimistic UI Update
        setIsInWishlist(!isInWishlist);
        setWishlist(prevState =>
            isInWishlist
                ? prevState.filter(p => p._id !== product._id)
                : [...prevState, product] // Add the current product optimistically
        );

        try {
            await action(product._id);
            toast({ title: "Success", description: successMessage });
             // Re-fetch wishlist from API to ensure sync after successful action
             fetchWishlist();
        } catch (error: any) {
            // Revert optimistic update on error
            setIsInWishlist(isInWishlist);
            setWishlist(previousWishlist);
            toast({ variant: "destructive", title: "Wishlist Error", description: error.response?.data?.message || "Could not update wishlist." });
        }
    };


    const onLoginSuccess = () => {
        setShowLoginModal(false);
        setCurrentUser(getCurrentUser());
        fetchWishlist(); // Re-fetch wishlist after login
        toast({ title: "Logged in successfully!", description: "You can now proceed." });
    };

    // Function to open the image modal
    const handleImageClick = (imageUrl: string) => {
        setModalImageUrl(imageUrl);
        setShowImageModal(true);
    };

    // Placeholder handler for AR/VR button
    const handleArVrClick = () => {
        toast({
            title: "Coming Soon!",
            description: "AR/VR view feature is under development.",
        });
    };

    if (isLoading) return <div className="flex h-[80vh] items-center justify-center"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /></div>;
    if (!product) return <div className="flex h-[80vh] flex-col items-center justify-center gap-4"><h2 className="text-2xl font-semibold">Product Not Found</h2><Button asChild><Link to="/buyer"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop</Link></Button></div>;

    // *** FIX: Assign typed seller to a variable to help TypeScript ***
    const sellerDetails = typeof product.seller === 'object' ? product.seller as PopulatedSeller : null;

    return (
        <>
            <AuthModal open={showLoginModal} onOpenChange={setShowLoginModal} onLoginSuccess={onLoginSuccess} />

            {/* Image Zoom Modal */}
            <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
                <DialogContent className="max-w-3xl p-2 sm:p-4 bg-background/90 backdrop-blur-sm border-border">
                    {modalImageUrl && (
                        <img src={modalImageUrl} alt={`${product.name} enlarged view`} className="w-full h-auto object-contain rounded-lg max-h-[85vh]" />
                    )}
                </DialogContent>
            </Dialog>


            <div className="container mx-auto max-w-screen-2xl p-4 md:p-8">
                <Button asChild variant="outline" className="mb-8"><Link to="/buyer"><ArrowLeft className="mr-2 h-4 w-4" /> Back to all products</Link></Button>
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Main Content */}
                    <main className="lg:flex-[2] xl:flex-[3] min-w-0">
                        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                            {/* Image Carousel */}
                            <Carousel className="w-full">
                                <CarouselContent>
                                    {product.images && product.images.length > 0 ? (
                                      product.images.map((image, index) => (
                                        <CarouselItem key={index} className="group relative">
                                            <div className="aspect-square border rounded-lg overflow-hidden bg-muted cursor-pointer" onClick={() => handleImageClick(image)}>
                                                <img src={image} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                    <Maximize className="h-8 w-8 text-white" />
                                                </div>
                                            </div>
                                        </CarouselItem>
                                      ))
                                    ) : (
                                        <CarouselItem className="group relative">
                                            <div className="aspect-square border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                                <span className="text-muted-foreground">No Image</span>
                                            </div>
                                        </CarouselItem>
                                    )}
                                </CarouselContent>
                                {/* Only show arrows if multiple images */}
                                {product.images && product.images.length > 1 && (
                                  <>
                                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10" />
                                  </>
                                )}
                            </Carousel>

                            {/* Product Details */}
                            <div className="flex flex-col justify-center">
                                <div className="space-y-4">
                                    <div className="flex gap-2 flex-wrap">
                                        <Badge variant="secondary" className="capitalize text-sm">{product.category}</Badge>
                                        <Badge variant="outline" className="text-sm">{product.brand}</Badge>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold leading-tight break-words">{product.name}</h1>
                                    <p className="text-muted-foreground text-base break-words">{product.description}</p>
                                    <p className="text-3xl font-bold">${product.price.toFixed(2)}</p>
                                    <div className="border-t pt-4">
                                        <h3 className="font-semibold mb-2">Details</h3>
                                        <div className="text-sm text-muted-foreground space-y-1 break-words">
                                            <p><span className="font-medium text-foreground">Material:</span> {product.material}</p>
                                            {/* *** FIX: Use the sellerDetails variable *** */}
                                            <p><span className="font-medium text-foreground">Seller:</span> {sellerDetails ? (typeof sellerDetails.sellerProfile === 'object' ? sellerDetails.sellerProfile.businessName || sellerDetails.name : sellerDetails.name) : 'Unknown'}</p>
                                        </div>
                                        </div>
                                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                                        <Button size="lg" className="flex-1 text-base" onClick={handleAffiliateClick}><ExternalLink className="mr-2 h-5 w-5" /> Go to Seller's Site</Button>
                                        {/* --- AR/VR Button with Placeholder --- */}
                                        <Button size="lg" variant="outline" className="flex-1 text-base" onClick={handleArVrClick}>
                                            <View className="mr-2 h-5 w-5" /> View in AR/VR
                                        </Button>
                                        <Button size="icon" variant="outline" className="h-14 w-14 shrink-0" onClick={handleWishlistToggle} disabled={!currentUser}>
                                            <Heart className={`h-6 w-6 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                                            <span className="sr-only">Add to wishlist</span>
                                        </Button>
                                    </div>
                                    {!currentUser && <p className="text-xs text-muted-foreground text-center sm:text-left pt-1">Login to add to wishlist</p>}
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Recommendations Sidebar */}
                    <aside className="lg:flex-[1] space-y-4 min-w-0">
                        <h2 className="text-2xl font-bold">You Might Also Like</h2>
                        <div className="space-y-4">
                            {recommendations.length > 0
                                ? recommendations.map(rec => <RecommendationCard key={rec._id} product={rec} />)
                                : <p className="text-sm text-muted-foreground">No recommendations found in this category.</p>
                            }
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}


function RecommendationCard({ product }: { product: Product }) {
    return (
        <Link to={`/product/${product._id}`} className="flex items-center gap-4 group p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="w-20 h-20 shrink-0">
                {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-md border" />
                ) : (
                    <div className="w-full h-full bg-muted rounded-md border flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight group-hover:underline truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
                <p className="font-bold text-sm mt-1">${product.price.toFixed(2)}</p>
            </div>
        </Link>
    );
}

// NOTE: This ProductCard component seems redundant here as it's primarily used in BuyerDashboard.
// Consider moving it to a shared components folder if needed elsewhere or removing if only used in BuyerDashboard.
function ProductCard({ product }: { product: Product }) {
    return (
        <Card className="overflow-hidden flex flex-col group">
            <CardHeader className="p-0 relative aspect-square"> {/* Enforce square aspect ratio */}
                <Link to={`/product/${product._id}`}>
                    {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                         <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-muted-foreground">No Image</div>
                    )}
                </Link>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <Link to={`/product/${product._id}`} className="space-y-1">
                    <CardTitle className="text-lg font-semibold leading-tight mb-1 group-hover:underline line-clamp-2">{product.name}</CardTitle> {/* Allow two lines */}
                    <p className="text-sm text-muted-foreground truncate">{product.brand}</p>
                </Link>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center">
                <p className="text-lg font-bold">${product.price.toFixed(2)}</p>
                <Button asChild size="sm" variant="outline">
                    <Link to={`/product/${product._id}`}>View</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

