// maheshpatil369/shrinagar/Shrinagar-47183708fc2b865cb6e3d62f63fcad35ec0165db/Frontend1/src/pages/ProductDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, Product, trackAffiliateClick } from '../lib/products';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, LoaderCircle, ArrowLeft, Heart } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { addToWishlist } from '../lib/user';
import { getCurrentUser } from '../lib/auth';


export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const data = await getProductById(id);
          setProduct(data);
        } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch product details.' });
        } finally {
          setIsLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, toast]);

  const handleAffiliateClick = () => {
    if (product) {
      trackAffiliateClick(product._id);
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleAddToWishlist = async () => {
    if (!product) return;
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

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-semibold">Product Not Found</h2>
        <Button asChild>
            <Link to="/buyer">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
            </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-4 md:p-8">
      <Button asChild variant="outline" className="mb-8">
          <Link to="/buyer"><ArrowLeft className="mr-2 h-4 w-4" /> Back to all products</Link>
      </Button>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <Carousel className="w-full">
                    <CarouselContent>
                        {product.images.map((image, index) => (
                        <CarouselItem key={index}>
                            <div className="aspect-square">
                            <img src={image} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
                    <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
                </Carousel>
            </CardContent>
        </Card>

        <div className="flex flex-col justify-center">
          <div className="space-y-4">
            <div className="flex gap-2">
                <Badge variant="secondary" className="capitalize">{product.category}</Badge>
                <Badge variant="outline">{product.brand}</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground text-base">{product.description}</p>
            <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
             <div className="border-t pt-4">
                 <h3 className="font-semibold mb-2">Details</h3>
                 <div className="text-sm text-muted-foreground space-y-1">
                     <p><span className="font-medium text-foreground">Material:</span> {product.material}</p>
                     <p><span className="font-medium text-foreground">Seller:</span> {typeof product.seller === 'object' ? product.seller.name : 'Unknown'}</p>
                 </div>
             </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="w-full" onClick={handleAffiliateClick}>
                <ExternalLink className="mr-2 h-4 w-4" /> Go to Seller's Site
              </Button>
              <Button size="lg" variant="outline" className="w-full" onClick={handleAddToWishlist}>
                 <Heart className="mr-2 h-4 w-4" /> Add to Wishlist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

