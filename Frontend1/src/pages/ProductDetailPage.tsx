// maheshpatil369/shrinagar/Shrinagar-5f116f4d15321fb5db89b637c78651e13d353027/Frontend1/src/pages/ProductDetailPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, Product, trackAffiliateClick, PopulatedSeller } from '../lib/products';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, LoaderCircle, ArrowLeft, Heart, Mail, Lock, View } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { addToWishlist, getWishlist, isProductInWishlist, removeFromWishlist } from '../lib/user';
import { getCurrentUser, login } from '../lib/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

function addRecentlyViewed(productId: string) {
    let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    viewed = [productId, ...viewed.filter((id: string) => id !== productId)];
    if (viewed.length > 8) viewed.pop();
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

    const fetchWishlist = useCallback(async () => {
        try {
            const data = await getWishlist();
            setWishlist(data);
        } catch (error) {
            console.error("Failed to fetch wishlist.");
        }
    }, []);

    const fetchProduct = useCallback(async (productId: string) => {
        try {
            const { product: data, recommendations: recs } = await getProductById(productId);
            setProduct(data);
            setRecommendations(recs);
            addRecentlyViewed(productId);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch product details.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);
    
    useEffect(() => {
        if (id) {
            setIsLoading(true);
            window.scrollTo(0, 0); // Scroll to top on new product view
            fetchProduct(id);
            fetchWishlist();
        }
    }, [id, fetchProduct, fetchWishlist]);

    useEffect(() => {
        if (product) {
            setIsInWishlist(isProductInWishlist(product._id, wishlist));
        }
    }, [product, wishlist]);

    const handleAffiliateClick = () => {
        if (!currentUser) {
            setShowLoginModal(true);
            return;
        }
        if (product) {
            trackAffiliateClick(product._id);
            window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const handleWishlistToggle = async () => {
        if (!product) return;
        
        const action = isInWishlist ? removeFromWishlist : addToWishlist;
        const successMessage = isInWishlist 
            ? `${product.name} removed from wishlist.` 
            : `${product.name} added to wishlist.`;

        try {
            await action(product._id);
            toast({ title: "Success", description: successMessage });
            // Manually update local state for instant UI feedback for guests
            if (!currentUser) {
                const currentLocalWishlist = wishlist.filter(p => p._id !== product._id);
                if (!isInWishlist) {
                    setWishlist([product, ...currentLocalWishlist]);
                } else {
                    setWishlist(currentLocalWishlist);
                }
            } else {
                fetchWishlist();
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Could not update wishlist." });
        }
    };

    const onLoginSuccess = () => {
        setShowLoginModal(false);
        setCurrentUser(getCurrentUser());
        fetchWishlist();
        toast({ title: "Logged in successfully!", description: "You can now proceed." });
    };

    if (isLoading) return <div className="flex h-[80vh] items-center justify-center"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /></div>;
    if (!product) return <div className="flex h-[80vh] flex-col items-center justify-center gap-4"><h2 className="text-2xl font-semibold">Product Not Found</h2><Button asChild><Link to="/buyer"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop</Link></Button></div>;

    return (
        <>
            <AuthModal open={showLoginModal} onOpenChange={setShowLoginModal} onLoginSuccess={onLoginSuccess} />
            <div className="container mx-auto max-w-screen-2xl p-4 md:p-8">
                <Button asChild variant="outline" className="mb-8"><Link to="/buyer"><ArrowLeft className="mr-2 h-4 w-4" /> Back to all products</Link></Button>
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Main Content */}
                    <main className="lg:flex-[2] xl:flex-[3]">
                        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                            {/* Image Carousel */}
                            <Carousel className="w-full">
                                <CarouselContent>
                                    {product.images.map((image, index) => (
                                        <CarouselItem key={index}>
                                            <div className="aspect-square border rounded-lg overflow-hidden bg-muted">
                                                <img src={image} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
                                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
                            </Carousel>
                            
                            {/* Product Details */}
                            <div className="flex flex-col justify-center">
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Badge variant="secondary" className="capitalize text-sm">{product.category}</Badge>
                                        <Badge variant="outline" className="text-sm">{product.brand}</Badge>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold leading-tight">{product.name}</h1>
                                    <p className="text-muted-foreground text-base">{product.description}</p>
                                    <p className="text-3xl font-bold">${product.price.toFixed(2)}</p>
                                    <div className="border-t pt-4">
                                        <h3 className="font-semibold mb-2">Details</h3>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p><span className="font-medium text-foreground">Material:</span> {product.material}</p>
                                            <p><span className="font-medium text-foreground">Seller:</span> {typeof product.seller === 'object' ? (product.seller as PopulatedSeller).sellerProfile?.businessName || (product.seller as PopulatedSeller).name : 'Unknown'}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                                        <Button size="lg" className="flex-1 text-base" onClick={handleAffiliateClick}><ExternalLink className="mr-2 h-5 w-5" /> Go to Seller's Site</Button>
                                        <Button size="lg" variant="outline" className="flex-1 text-base"><View className="mr-2 h-5 w-5" /> View in AR/VR</Button>
                                        <Button size="icon" variant="outline" className="h-14 w-14" onClick={handleWishlistToggle}>
                                            <Heart className={`h-6 w-6 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                                            <span className="sr-only">Add to wishlist</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* Recommendations Sidebar */}
                    <aside className="lg:flex-[1] space-y-4">
                        <h2 className="text-2xl font-bold">You Might Also Like</h2>
                        <div className="space-y-4">
                            {recommendations.map(rec => <RecommendationCard key={rec._id} product={rec} />)}
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
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-md" />
            </div>
            <div className="flex-1">
                <p className="font-semibold text-sm leading-tight group-hover:underline">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.brand}</p>
                <p className="font-bold text-sm mt-1">${product.price.toFixed(2)}</p>
            </div>
        </Link>
    );
}

function ProductCard({ product }: { product: Product }) {
    return (
        <Card className="overflow-hidden flex flex-col group">
            <CardHeader className="p-0 relative">
                <Link to={`/product/${product._id}`}>
                    <img src={product.images[0]} alt={product.name} className="w-full h-48 object-cover transition-transform group-hover:scale-105" />
                </Link>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <Link to={`/product/${product._id}`} className="space-y-1">
                    <CardTitle className="text-lg font-semibold leading-tight mb-1 group-hover:underline">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.brand}</p>
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

