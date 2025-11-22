// Frontend1/src/pages/ProductDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, Product, trackAffiliateClick, PopulatedSeller, createProductReview, deleteProductReview } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, LoaderCircle, ArrowLeft, Heart, View, Maximize, Share2, Star, Trash2 } from 'lucide-react';
import { addToWishlist, getWishlist, isProductInWishlist, removeFromWishlist } from '@/lib/user';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuthModal } from '@/context/AuthModalContext';
import { useUser } from '@/context/UserContext';
import Rating from '@/components/ui/Rating';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


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
    
    const { setAuthModalOpen, setPostLoginRedirect } = useAuthModal();
    const { toast } = useToast();
    const { user } = useUser();

    const [showImageModal, setShowImageModal] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);
    
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [isReviewLoading, setIsReviewLoading] = useState(false);

    const [activeImage, setActiveImage] = useState<string | null>(null);

     const fetchWishlist = useCallback(async () => {
        if (!user) {
            setWishlist([]);
            return;
        }
        try {
            const data = await getWishlist();
            setWishlist(data);
        } catch (error) {
             console.error("Failed to fetch wishlist for logged in user:", error);
             setWishlist([]);
        }
    }, [user]);

    const fetchProduct = useCallback(async (productId: string) => {
        setIsLoading(true);
        try {
            const { product: data, recommendations: recs } = await getProductById(productId);
            setProduct(data);
            setRecommendations(recs);
            addRecentlyViewed(productId);
            if (data.images && data.images.length > 0) {
                setActiveImage(data.images[0]);
            }
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
        } else {
             setIsLoading(false);
             setProduct(null);
        }
    }, [id, fetchProduct, fetchWishlist]);


    useEffect(() => {
        if (product && user) {
            setIsInWishlist(isProductInWishlist(product._id, wishlist));
        } else {
            setIsInWishlist(false);
        }
    }, [product, wishlist, user]);

    const handleAffiliateClick = () => {
         if (!user) {
            setPostLoginRedirect(window.location.pathname);
            setAuthModalOpen(true);
            return;
        }
        if (product) {
            trackAffiliateClick(product._id).catch(err => console.error("Failed to track click", err));
            window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
        }
    };

    const handleWishlistToggle = async (e?: React.MouseEvent) => {
        e?.stopPropagation(); 

        if (!product) return;

        if (!user) {
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

    const handleShare = async (e?: React.MouseEvent) => {
        e?.stopPropagation(); 

        if (!product) return;
        const shareUrl = `${window.location.origin}/product/${product._id}`;
        const shareData = {
            title: product.name,
            text: `Check out this amazing jewelry: ${product.name}`,
            url: shareUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            try {
                const textArea = document.createElement("textarea");
                textArea.value = shareUrl;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                toast({ title: "Link Copied!", description: "Product link copied to your clipboard." });
            } catch (err) {
                console.error('Clipboard copy failed:', err);
                toast({ variant: "destructive", title: "Error", description: "Could not copy link." });
            }
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product || !user) return;
        if (reviewRating === 0 || !reviewComment) {
            toast({ variant: "destructive", title: "Error", description: "Please select a rating and write a comment." });
            return;
        }

        setIsReviewLoading(true);
        try {
            await createProductReview(product._id, {
                rating: reviewRating,
                comment: reviewComment,
            });
            toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
            setReviewRating(0);
            setReviewComment("");
            fetchProduct(product._id);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Submission Failed", description: error.response?.data?.message || "Could not submit review." });
        } finally {
            setIsReviewLoading(false);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!product || !user || !id) return;

        try {
            await deleteProductReview(id, reviewId);
            toast({ title: "Review Deleted", description: "The review was successfully removed." });
            fetchProduct(id);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Deletion Failed", description: error.response?.data?.message || "Could not delete review." });
        }
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
    const userHasReviewed = product.reviews.find(r => r.user === user?._id);
    const isProductSeller = product.seller.toString() === user?._id;
    const isAdmin = user?.role === 'admin';

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


            <div className="container mx-auto max-w-screen-2xl p-4 md:p-6 lg:p-8">
<Button
  asChild
  className="
    mb-6 md:mb-8
    bg-[#0e1b33] 
    text-yellow-300 
    border border-yellow-400 
    rounded-full
    hover:bg-yellow-400 hover:text-black
    transition-all
  "
>
                    <Link to="/buyer"><ArrowLeft className="mr-2 h-4 w-4" /> Back to all products</Link>
                </Button>
                
                {/* MAIN LAYOUT 
                    Flex-col on Mobile/Tablet (Stacked)
                    Flex-row on Desktop (Side-by-Side)
                */}
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
                    
                    {/* --- LEFT: MAIN CONTENT (75% on Desktop) --- */}
                    <main className="flex-1 lg:w-3/4 min-w-0">
                        
                        {/* PRODUCT GRID 
                            grid-cols-1 on Mobile/Tablet -> This ensures "2 rows" layout (Image Row, Details Row)
                            grid-cols-2 on Desktop -> This puts image and details side-by-side inside the 75% area
                        */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                            
                            {/* --- IMAGE GALLERY --- */}
                            {/* Mobile/Tablet: flex-col-reverse (Thumbnails bottom, Main image top)
                                Desktop: flex-row (Thumbnails left, Main image right)
                            */}
                            <div className="flex flex-col-reverse lg:flex-row gap-4 w-full">
                                {/* Thumbnails Container */}
                                <div className="flex flex-row lg:flex-col gap-3 w-full lg:w-20 shrink-0 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 no-scrollbar">
                                    {product.images && product.images.length > 0 ? (
                                        product.images.map((image, index) => (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "relative aspect-square w-16 lg:w-full border rounded-lg overflow-hidden bg-muted cursor-pointer transition-all shrink-0",
                                                    activeImage === image ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border hover:border-muted-foreground"
                                                )}
                                                onMouseEnter={() => setActiveImage(image)}
                                                onClick={() => setActiveImage(image)}
                                            >
                                                <img src={image} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="aspect-square w-16 lg:w-full border rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
                                            <span className="text-[10px] text-muted-foreground p-1 text-center">No Image</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Main Image Container */}
                                <div className="flex-1 relative group w-full">
                                    {activeImage ? (
                                        <div className="aspect-square w-full border rounded-lg overflow-hidden bg-muted cursor-pointer relative" onClick={() => handleImageClick(activeImage)}>
                                            <img src={activeImage} alt="Main product view" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                                <Maximize className="h-8 w-8 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="aspect-square w-full border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                            <span className="text-muted-foreground">No Image</span>
                                        </div>
                                    )}
                                    
                                    {/* Overlay Buttons */}
                                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 z-10">
                                        <Button variant="outline" size="icon" className="h-9 w-9 bg-background/80 hover:bg-background rounded-full shadow backdrop-blur-sm" onClick={handleWishlistToggle}>
                                            <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-red-500 text-red-500' : ''}`} />
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-9 w-9 bg-background/80 hover:bg-background rounded-full shadow backdrop-blur-sm" onClick={handleShare}>
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            {/* --- END: Image Gallery --- */}

                            {/* Product Details */}
                            <div className="flex flex-col justify-start space-y-6">
                                <div className="space-y-4">
                                    <div className="flex gap-2 flex-wrap">
                                      <Badge 
  variant="secondary"
  className="capitalize text-sm px-3 py-1 
  bg-yellow-400/20 text-yellow-300 border border-yellow-400/30"
>
{product.category}</Badge>
                                       <Badge
  variant="outline"
  className="text-sm px-3 py-1 bg-white/10 text-white border-white/20"
>
{product.brand}</Badge>
                                    </div>
                                    
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight break-words text-yellow-300">
                                        {product.name}
                                    </h1>
                                    
                                    <div className="flex items-center gap-4">
                                        <Rating value={product.rating} text={`${product.numReviews} reviews`} className="scale-105 origin-left" />
                                    </div>

                                    <p className="text-muted-foreground text-base md:text-lg leading-relaxed break-words">
                                        {product.description}
                                    </p>
                                    
                                    {/* <p className="text-3xl font-bold">₹{product.price.toFixed(2)}</p> */}

                                    <div className="border-t border-border pt-6 mt-4 space-y-3">
                                        <h3 className="font-semibold text-lg">Product Specifications</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm md:text-base">
                                            <div className="space-y-1">
                                                <span className="text-muted-foreground block">Material</span>
                                                <span className="font-medium">{product.material}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-muted-foreground block">Seller</span>
                                                <span className="font-medium">
                                                    {sellerDetails ? (typeof sellerDetails.sellerProfile === 'object' ? sellerDetails.sellerProfile.businessName || sellerDetails.name : sellerDetails.name) : 'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
<div className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-start">
        <Button
    size="lg"
    className="w-full sm:flex-1 text-base h-11 sm:h-12 rounded-full bg-yellow-400 text-black hover:bg-yellow-200"
    onClick={handleAffiliateClick}
>

  <ExternalLink className="mr-2 h-5 w-5" /> 
  Visit Seller Site
</Button>

 <Button
    size="lg"
    variant="outline"
    className="w-full sm:flex-1 text-base h-11 sm:h-12 rounded-full bg-yellow-500 text-black hover:bg-yellow-200"
    onClick={handleArVrClick}
>

  <View className="mr-2 h-5 w-5" /> 
  AR/VR Try-On
</Button>

                                    </div>
                                    
                                    {!user && (
                                        <div className="bg-muted/50 p-3 rounded-lg text-center mt-4">
                                            <p className="text-sm text-muted-foreground">
                                                <span className="font-medium text-foreground cursor-pointer hover:underline" onClick={() => { setPostLoginRedirect(window.location.pathname); setAuthModalOpen(true); }}>Log in</span> to save this item to your wishlist.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* --- Reviews Section --- */}
                        <div className="mt-12 lg:mt-16">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6">Reviews</h2>
                            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                                {/* Review Form */}
                                <div>
<Card className="bg-[#071324] border border-white/10 text-white">
                                        <CardHeader>
                                            <CardTitle>Write a Customer Review</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {user ? (
                                                userHasReviewed ? (
                                                    <p className="text-muted-foreground">You have already reviewed this product. You can delete your existing review below.</p>
                                                ) : (
                                                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                                                        <div>
                                                            <Label htmlFor="rating" className="mb-2 block">Your Rating</Label>
                                                            <div className="flex items-center gap-1">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={cn(
                                                                            "h-6 w-6 cursor-pointer transition-colors",
                                                                            reviewRating >= star ? "fill-amber-400 text-amber-400" : "fill-muted text-muted-foreground/50"
                                                                        )}
                                                                        onClick={() => setReviewRating(star)}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Label htmlFor="comment">Your Review</Label>
                                                          <Textarea
    id="comment"
    placeholder="Tell us what you think..."
    value={reviewComment}
    onChange={(e) => setReviewComment(e.target.value)}
    disabled={isReviewLoading}
    className="
        mt-2 min-h-[100px]
        bg-[#0A1424] 
        border border-white/10 
        text-white 
        placeholder:text-white/40
        focus-visible:ring-yellow-400
    "
/>

                                                        </div>
                                                     <Button
    type="submit"
    disabled={isReviewLoading}
    className="
      bg-yellow-400 
      text-black 
      hover:bg-yellow-300 
      transition-all 
      font-semibold
    "
>

                                                            Submit Review
                                                        </Button>
                                                    </form>
                                                )
                                            ) : (
                                                <p className="text-muted-foreground">
                                                    Please{" "}
                                                    <Button variant="link" className="p-0 h-auto" onClick={() => { setPostLoginRedirect(window.location.pathname); setAuthModalOpen(true); }}>
                                                        log in
                                                    </Button>
                                                    {" "}to write a review.
                                                </p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Review List */}
                                <div className="space-y-6">
                                    {product.reviews.length === 0 ? (
                                        <p className="text-muted-foreground">No reviews yet.</p>
                                    ) : (
                                        product.reviews.map((review) => {
                                            const isCurrentUsersReview = review.user === user?._id;
                                            const canDelete = isCurrentUsersReview || isProductSeller || isAdmin;
                                            
                                            return (
                                                <div key={review._id} className="pb-4 border-b last:border-b-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div>
                                                            <h4 className="font-semibold">{review.name}</h4>
                                                            <span className="text-xs text-muted-foreground">
                                                                {format(new Date(review.createdAt), 'dd MMM yyyy')}
                                                            </span>
                                                        </div>
                                                        
                                                        {canDelete && (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-700">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This will permanently delete this review. This action cannot be undone.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction 
                                                                            onClick={() => handleDeleteReview(review._id)}
                                                                            className="bg-destructive hover:bg-destructive/90"
                                                                        >
                                                                            Confirm Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                    </div>
                                                    <Rating value={review.rating} />
                                                    <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* --- RIGHT: RECOMMENDATIONS SIDEBAR (25% on Desktop) --- */}
                    <aside className="w-full lg:w-1/4 space-y-6 mt-8 lg:mt-0 border-t lg:border-t-0 lg:border-l border-border pt-8 lg:pt-0 lg:pl-8">
                        <h2 className="text-2xl font-bold">You Might Also Like</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
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
        <Link to={`/product/${product._id}`} className="flex items-center gap-4 group p-2 rounded-lg hover:bg-muted/50 transition-colors border lg:border-none">
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
                {/* <p className="font-bold text-sm mt-1">₹{product.price.toFixed(2)}</p> */}
            </div>
        </Link>
    );
}