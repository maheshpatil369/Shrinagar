// Frontend1/src/pages/ProductDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
// --- All imports are now relative from 'pages' directory ---
import { getProductById, Product, trackAffiliateClick, PopulatedSeller } from '../lib/products';
import { useToast } from '../hooks/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ExternalLink, LoaderCircle, ArrowLeft, Heart, View, Maximize } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../components/ui/carousel";
import { addToWishlist, getWishlist, isProductInWishlist, removeFromWishlist } from '../lib/user';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { useAuthModal } from '../context/AuthModalContext';
import { useUser } from '../context/UserContext'; // --- Only useUser for auth state ---

function addRecentlyViewed(productId: string) {
    let viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    viewed = [productId, ...viewed.filter((id: string) => id !== productId)];
    if (viewed.length > 8) viewed = viewed.slice(0, 8);
    localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
}

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    // --- Use global modal state ---
    const { setAuthModalOpen, setPostLoginRedirect } = useAuthModal();
    
    const { toast } = useToast();
    // --- Get user state ONLY from global context ---
    const { user } = useUser();

    const [showImageModal, setShowImageModal] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

     const fetchWishlist = useCallback(async () => {
        // Only fetch wishlist if user is logged in
        if (!user) {
            setWishlist([]); // Clear wishlist if logged out
            return;
        }
        try {
            const data = await getWishlist();
            setWishlist(data);
        } catch (error) {
             console.error("Failed to fetch wishlist for logged in user:", error);
             setWishlist([]); // Clear on error
        }
    }, [user]); // --- Re-run when user logs in ---

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

    // --- REMOVED all old user state logic (getCurrentUser, setCurrentUser) ---
    // The rogue useEffect that caused the bug is GONE.

    useEffect(() => {
        if (id) {
            window.scrollTo(0, 0);
            fetchProduct(id);
            // Fetch wishlist will now correctly run (or not run) based on user state
            fetchWishlist(); 
        } else {
             setIsLoading(false);
             setProduct(null);
        }
    }, [id, fetchProduct, fetchWishlist]); // fetchWishlist is now stable


    useEffect(() => {
        if (product && user) { // Only check wishlist if user is logged in
            setIsInWishlist(isProductInWishlist(product._id, wishlist));
        } else {
            setIsInWishlist(false); // Not in wishlist if logged out
        }
    }, [product, wishlist, user]); // --- Added user dependency ---

    // --- Click handlers now use the global 'user' object ---
    const handleAffiliateClick = () => {
         if (!user) { // Check global user
            setPostLoginRedirect(window.location.pathname);
            setAuthModalOpen(true);
            return;
        }
        if (product) {
            trackAffiliateClick(product._id).catch(err => console.error("Failed to track click", err));
            window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const handleWishlistToggle = async () => {
        if (!product) return;

        if (!user) { // Check global user
            setPostLoginRedirect(window.location.pathname);
            setAuthModalOpen(true);
            return;
        }

        const action = isInWishlist ? removeFromWishlist : addToWishlist;
        const successMessage = isInWishlist
            ? `${product.name} removed from wishlist.`
            : `${product.name} added to wishlist.`;

        const previousWishlist = wishlist;
        setIsInWishlist(!isInWishlist);
        setWishlist(prevState =>
            isInWishlist
                ? prevState.filter(p => p._id !== product._id)
                : [...prevState, product]
        );

        try {
            await action(product._id);
            toast({ title: "Success", description: successMessage });
             fetchWishlist();
        } catch (error: any) {
            setIsInWishlist(isInWishlist);
            setWishlist(previousWishlist);
            toast({ variant: "destructive", title: "Wishlist Error", description: error.response?.data?.message || "Could not update wishlist." });
        }
    };
    
    const handleImageClick = (imageUrl: string) => {
        setModalImageUrl(imageUrl);
        setShowImageModal(true);
    };

    const handleArVrClick = () => {
        toast({
            title: "Coming Soon!",
            description: "AR/VR view feature is under development.",
        });
    };

    if (isLoading) return <div className="flex h-[80vh] items-center justify-center"><LoaderCircle className="h-12 w-12 animate-spin text-primary" /></div>;
    if (!product) return <div className="flex h-[80vh] flex-col items-center justify-center gap-4"><h2 className="text-2xl font-semibold">Product Not Found</h2><Button asChild><Link to="/buyer"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop</Link></Button></div>;

    const sellerDetails = typeof product.seller === 'object' ? product.seller as PopulatedSeller : null;

    return (
        <>
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
                                            <p><span className="font-medium text-foreground">Seller:</span> {sellerDetails ? (typeof sellerDetails.sellerProfile === 'object' ? sellerDetails.sellerProfile.businessName || sellerDetails.name : sellerDetails.name) : 'Unknown'}</p>
                                        </div>
                                        </div>
                                    <div className="flex flex-col sm:flex-row gap-2 pt-4">
                                        <Button size="lg" className="flex-1 text-base" onClick={handleAffiliateClick}><ExternalLink className="mr-2 h-5 w-5" /> Go to Seller's Site</Button>
                                        <Button size="lg" variant="outline" className="flex-1 text-base" onClick={handleArVrClick}>
                                            <View className="mr-2 h-5 w-5" /> View in AR/VR
                                        </Button>
                                        <Button size="icon" variant="outline" className="h-14 w-14 shrink-0" onClick={handleWishlistToggle}>
                                            <Heart className={`h-6 w-6 transition-colors ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                                            <span className="sr-only">Add to wishlist</span>
                                        </Button>
                                    </div>
                                    {!user && <p className="text-xs text-muted-foreground text-center sm:text-left pt-1">Login to add to wishlist or visit seller</p>}
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