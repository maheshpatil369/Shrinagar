import { useEffect, useState, useCallback } from 'react';
import { User, getCurrentUser } from '@/lib/auth';
import { Product } from '@/lib/products';
import { getWishlist, removeFromWishlist } from '@/lib/user';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderCircle, Heart, X, ExternalLink, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function UserProfile() {
    const [user, setUser] = useState<User | null>(null);
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const defaultAvatar =
        "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";

    const fetchWishlist = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getWishlist();
            setWishlist(data);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch wishlist.' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        fetchWishlist();
    }, [fetchWishlist]);

    const handleRemoveFromWishlist = async (productId: string) => {
        try {
            await removeFromWishlist(productId);
            setWishlist(wishlist.filter(p => p._id !== productId));
            toast({ title: 'Success', description: 'Product removed from your wishlist.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not remove product.' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground mb-8">Manage your account, wishlist & history.</p>

            <div className="grid md:grid-cols-3 gap-8">

                {/* LEFT SIDE PROFILE CARD */}
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="text-center">
                          <img
                          src={user?.profileImg || defaultAvatar}
                           alt="profile"
                               className="h-28 w-28 rounded-full mx-auto mb-3 object-cover border-2 border-primary ring-2 ring-gray-200"
                               />

                            <CardTitle className="text-xl">{user?.name || "Guest User"}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p><span className="font-semibold">Email:</span> {user?.email}</p>
                            <p><span className="font-semibold">Role:</span> <span className="capitalize">{user?.role}</span></p>
                        </CardContent>
                    </Card>

                    {/* ORDER HISTORY (Empty Placeholder) */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <UserRound className="h-5 w-5" />
                                Order History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground text-sm">
                                You have no orders yet.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT – WISHLIST */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Heart className="h-6 w-6 text-red-500" /> My Wishlist
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!user && wishlist.length > 0 && (
                                <Alert className="mb-4">
                                    <AlertTitle>Your wishlist is saved locally!</AlertTitle>
                                    <AlertDescription>
                                        <Link to="/auth" className="underline font-semibold">Log in or sign up</Link>{" "}
                                        to sync your wishlist across devices.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {wishlist.length === 0 ? (
                                <p className="text-muted-foreground">Your wishlist is empty.</p>
                            ) : (
                                <div className="space-y-4">
                                    {wishlist.map(product => (
                                        <div key={product._id} className="flex items-center gap-4 rounded-md border p-4">
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="h-16 w-16 rounded-md object-cover"
                                            />
                                            <div className="flex-grow">
                                                <Link
                                                    to={`/product/${product._id}`}
                                                    className="font-semibold hover:underline"
                                                >
                                                    {product.name}
                                                </Link>
                                                <p className="text-sm text-muted-foreground">₹{product.price.toFixed(2)}</p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button asChild variant="outline" size="sm">
                                                    <a href={product.affiliateUrl} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() => handleRemoveFromWishlist(product._id)}
                                                >
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
