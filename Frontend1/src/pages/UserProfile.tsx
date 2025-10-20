// maheshpatil369/shrinagar/Shrinagar-47183708fc2b865cb6e3d62f63fcad35ec0165db/Frontend1/src/pages/UserProfile.tsx
import { useEffect, useState } from 'react';
import { User, getCurrentUser } from '@/lib/auth';
import { Product } from '@/lib/products';
import { getWishlist, removeFromWishlist } from '@/lib/user';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Heart, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchWishlist = async () => {
        try {
            const data = await getWishlist();
            setWishlist(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch wishlist.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
            fetchWishlist();
        } else {
            setIsLoading(false);
        }
    }, [toast]);

    const handleRemoveFromWishlist = async (productId: string) => {
        try {
            await removeFromWishlist(productId);
            setWishlist(wishlist.filter(p => p._id !== productId));
            toast({ title: 'Success', description: 'Product removed from your wishlist.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not remove product from wishlist.' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
         return (
            <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
                <h2 className="text-2xl font-semibold">Please Log In</h2>
                <p className="text-muted-foreground">You need to be logged in to view your profile and wishlist.</p>
                <Button asChild><Link to="/auth">Login</Link></Button>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto max-w-5xl p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground mb-8">Manage your account and wishlist.</p>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><span className="font-semibold">Name:</span> {user.name}</p>
                            <p><span className="font-semibold">Email:</span> {user.email}</p>
                            <p><span className="font-semibold">Role:</span> <span className="capitalize">{user.role}</span></p>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-6 w-6 text-red-500"/> My Wishlist
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {wishlist.length === 0 ? (
                                <p className="text-muted-foreground">Your wishlist is empty. Start adding some favorites!</p>
                            ) : (
                                <div className="space-y-4">
                                    {wishlist.map(product => (
                                        <div key={product._id} className="flex items-center gap-4 rounded-md border p-4">
                                            {/* CORRECTED: Image now renders directly from Base64 data */}
                                            <img 
                                                src={product.images[0]} 
                                                alt={product.name} 
                                                className="h-16 w-16 rounded-md object-cover"
                                            />
                                            <div className="flex-grow">
                                                <Link to={`/product/${product._id}`} className="font-semibold hover:underline">{product.name}</Link>
                                                <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleRemoveFromWishlist(product._id)}>
                                                    <X className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
