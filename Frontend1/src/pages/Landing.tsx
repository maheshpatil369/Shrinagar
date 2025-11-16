// Frontend1/src/pages/Landing.tsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// Using alias for library/utility imports
import { getTrendingProducts, Product } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import { addToWishlist } from '@/lib/user';
import { getCurrentUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
// Using relative paths for component imports (as the alias seems to fail here)
import { Button } from '../components/ui/button';
import { CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { ThemeToggle } from '../components/ThemeToggle';
import Rating from '../components/ui/Rating';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';

// FIXED: Added necessary Lucide icons
import { Gem, ArrowRight, ShoppingCart, Heart, Search as SearchIcon, User, Facebook, Twitter } from 'lucide-react';

// --- Theme Colors ---
// Mint Green: #ADC9A8
// Dark Grey/Black: #1A1A1A or black

// --- Header Component (Restored to original dark theme) ---
// --- Header Component (Updated as per requirement) ---
function Header() {
    const navigate = useNavigate();
    const currentUser = getCurrentUser();  

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#2A292B] text-white">
            <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 mr-6">
                    <Gem className="h-6 w-6 text-white" />
                    <span className="font-bold text-xl tracking-widest">SHRINGAR</span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex gap-6 items-center text-sm font-medium text-white/70">
                    <Link to="/" className="hover:text-white transition-colors">Home</Link>
                    <Link to="/buyer" className="hover:text-white transition-colors">Shop</Link>
                    <Link to="/seller" className="hover:text-white transition-colors">Sell</Link>
                    <Link to="/profile" className="hover:text-white transition-colors">Account</Link>
                </nav>

                {/* Right side icons */}
                <div className="flex items-center gap-3">

                    {/* Wishlist */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/10"
                        onClick={() => navigate('/profile')}
                    >
                        <Heart className="h-5 w-5" />
                    </Button>

                    {/* Login or Profile */}
                    {currentUser ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10"
                            onClick={() => navigate('/profile')}
                        >
                            <User className="h-5 w-5" />
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/10"
                            onClick={() => navigate('/auth')}
                        >
                            <User className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}



// --- Hero Section (Restored to original dark theme) ---
function HeroSection() {
    const navigate = useNavigate();
    return (
        // Original dark theme classes
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black text-white">
            {/* Main Image: Full screen, object-bottom to show hands/jewelry */}
            <img
                src="/assets/profile1stimg.png"
                alt="Elegant Jewelry Model"
                // Using opacity 0.7 to achieve the slightly lighter black background as seen in the image
                className="absolute inset-0 w-full h-full object-cover object-bottom opacity-70"
            />
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 text-center">
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-light mb-2 tracking-widest">SHRINGAR</h1>
                <p className="text-xl font-light text-[#fdfdfd] mb-8">JEWELRY SHOP</p>
                <Button
                    onClick={() => navigate('/buyer')}
                    size="lg"
                    // Original button style
                    className="bg-white text-black hover:bg-white/80 px-8 py-3 text-lg rounded-full transition-transform hover:scale-105 font-bold"
                >
                    SHOP NOW
                </Button>
            </div>
        </section>
    );
}

// --- New Collections Section (Original Mint Green/Light background) ---
function NewCollectionsSection() {
    const products = [
        { id: '1', name: 'Delicate New Set', price: 1500, image: '/assets/1-4new.jpg', rating: 4.5, reviews: 25 },
        { id: '2', name: 'Classic Bracelet', price: 9800, image: '/assets/2-4new.webp', rating: 5.0, reviews: 12 },
        { id: '3', name: 'Elegant Gold Set', price: 450, image: '/assets/3-4new.webp', rating: 4.0, reviews: 50 },
        { id: '4', name: 'Luxury Diamond Ring', price: 250, image: '/assets/4-4new.webp', rating: 3.5, reviews: 8 },
    ];

    return (
        <section className="bg-[#ffffff] py-12">
            {/* NEW: soft shadow + rounded edges + bigger left-right padding */}
            <div className="max-w-screen-2xl mx-auto px-8 md:px-14 lg:px-20 py-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)]">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl md:text-2xl font-semibold tracking-wider text-black">
                        NEW COLLECTIONS
                    </h2>
                    <Button 
                        variant="link" 
                        className="text-black hover:text-black/70 hover:no-underline font-normal"
                    >
                        View More <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="text-center cursor-pointer group">

                            <div className="aspect-square overflow-hidden mb-3 
                                border border-black/10 bg-white shadow-md rounded-lg 
                                transition-all duration-300 group-hover:shadow-xl">
                                <img 
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>

                            <p className="text-sm font-medium text-black">{product.name}</p>

                            <div className="flex items-center justify-center text-xs mt-1">
                                <Rating value={product.rating} text={product.reviews.toString()} />
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}


// --- Categories & Side Image Section (Updated Text Sizes) ---
function CategoriesSection() {
    const categories = [
        { name: 'Rings', subtitle: 'Our Latest Rings Collection', image: '/assets/category1.webp', link: '/buyer?category=rings' },
        { name: 'Bracelets', subtitle: 'Elegant Wrist Wear', image: '/assets/category4.gif', link: '/buyer?category=bracelets' },
        { name: 'Earrings', subtitle: 'Studs and Drop Earrings', image: '/assets/category2.jpg', link: '/buyer?category=earrings' },
        { name: 'Necklaces & Pendants', subtitle: 'Chains and Drops', image: '/assets/category2.gif', link: '/buyer?category=necklaces' },
        { name: 'Watches', subtitle: 'Luxury Timepieces', image: '/assets/img222.gif', link: '/buyer?category=watches' },
        { name: `Men's Jewelry`, subtitle: 'Rings, Bracelets, and more', image: '/assets/5of6.png', link: '/buyer?category=mens-jewelry' },
    ];

    const [activeIndex, setActiveIndex] = useState(0);

    // Auto-slide every 2 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % categories.length);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const activeImage = categories[activeIndex].image;
    const activeSubtitle = categories[activeIndex].subtitle;

    return (
        <section className="bg-[#ffffff] py-16">
            <div className="max-w-screen-2xl mx-auto px-8 md:px-14 lg:px-20 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* LEFT TEXT BLOCK */}
                <div className="space-y-6 pt-4">
                    <h2 className="text-[28px] font-bold text-black tracking-wide">
                        Categories
                    </h2>

                    <p className="text-[16px] text-black/70 leading-relaxed">
                        Discover Our Collection of Jewellery by Categories
                    </p>

                    <div className="flex flex-col gap-[14px]">
                        {categories.map((cat, i) => (
                            <Link
                                key={cat.name}
                                to={cat.link}
                                onMouseEnter={() => setActiveIndex(i)}
                                className="text-[22px] text-black/80 hover:text-black transition-colors font-medium tracking-wide"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>

                    {/* NEW — VIEW ALL COLLECTIONS BUTTON */}
                    <div className="pt-4">
                        <Link
                            to="/buyer"
                            className="inline-block bg-black text-white px-6 py-3 rounded-full text-lg font-semibold shadow-md hover:bg-[#DAA268] hover:text-black transition-all"
                        >
                            VIEW ALL COLLECTIONS →
                        </Link>
                    </div>
                </div>

                {/* RIGHT — IMAGE + FRAME */}
              {/* RIGHT — IMAGE + BACKGROUND FRAME */}
<div className="relative lg:col-span-2 flex justify-center lg:justify-end pr-6 translate-x-0 -translate-y-0">

    {/* ⭐ FILLED BACKGROUND FRAME — Top Right */}
    <div
        className="
            absolute 
            -top-10    /* move upward */
            right-2    /* align to right side */
            w-[420px]  /* width */
            h-[520px]  /* height */
            bg-[#F3D4A2]   /* fill color */
            rounded-sm
            z-0
        "
    />

    {/* IMAGE CARD */}
    <div className="relative w-[380px] h-[420px] lg:w-[420px] lg:h-[500px]
        rounded-sm overflow-hidden shadow-xl bg-white z-10 transition-all duration-500">

        <img
            src={activeImage}
            alt={activeSubtitle}
            className="w-full h-full object-cover transition-all duration-700"
        />

        {/* Subtitle top-left */}
        <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded">
            <span className="text-white text-[12px] tracking-wide font-semibold">
                {activeSubtitle.toUpperCase()}
            </span>
        </div>

        {/* Counter top-right */}
        <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded">
            <span className="text-white text-[12px] tracking-wide font-semibold">
                {activeIndex + 1} of {categories.length}
            </span>
        </div>

    </div>
</div>


            </div>
        </section>
    );
}

// --- Trending Products Section (Original Mint Green/Light background) ---
function TrendingSection() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const currentUser = getCurrentUser();

    useEffect(() => {
        const fetchTrending = async () => {
            setIsLoading(true);
            try {
                // Mock data for display purposes
                const mockProducts = [
                    { _id: 't1', name: 'Diamond Solitaire Ring', price: 5999.00, images: ['/assets/2-4new.webp'], rating: 4.8 },
                    { _id: 't2', name: 'Antique Gold Necklace', price: 12500.00, images: ['/assets/4-4new.webp'], rating: 4.5 },
                    { _id: 't3', name: 'Pearl Drop Earrings', price: 850.00, images: ['/assets/1-4new.jpg'], rating: 4.9 },
                    { _id: 't4', name: 'Modern Silver Bracelet', price: 299.00, images: ['/assets/3-4new.webp'], rating: 4.2 },
                ] as unknown as Product[];
                setProducts(mockProducts); 
                // In a real app, use: const data = await getTrendingProducts(); setProducts(data.slice(0, 4)); 
            } catch (error) {
                console.error("Failed to fetch trending products:", error);
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
            // Placeholder: await addToWishlist(product._id);
            toast({ title: "Success", description: `${product.name} added to your wishlist!` });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.response?.data?.message || "Could not add to wishlist." });
        }
    };


    interface ProductCardProps {
      product: Product;
      onAddToWishlist: (e: React.MouseEvent, product: Product) => void;
      currentUser: any;
    }

    const TrendingProductCard = ({ product, onAddToWishlist, currentUser }: ProductCardProps) => {
        const navigate = useNavigate();

        const handleCardClick = () => {
            // Placeholder navigate(`/product/${product._id}`);
            console.log(`Navigating to product ${product._id}`);
        };

        const handleAddToCart = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            toast({ title: "Cart Added", description: `Added ${product.name} to cart (placeholder).` });
        };

        return (
            // Card style on light background
            <div className="p-3 text-center cursor-pointer group bg-white shadow-lg rounded-lg transition-all hover:shadow-xl" onClick={handleCardClick}>
                 <div className="relative aspect-square overflow-hidden mb-2">
                     {product.images && product.images.length > 0 ? (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                     ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-sm text-muted-foreground">No Image</div>
                     )}
                 </div>
                 <div className="flex flex-col items-center">
                    <p className="text-base font-semibold line-clamp-2 text-black">{product.name}</p>
                    <p className="text-sm font-medium text-black/70 mb-1">${product.price.toFixed(2)}</p>
                    <Button variant="default" size="sm" className="bg-black hover:bg-black/80 text-white rounded-full mt-1" onClick={handleAddToCart}>
                         <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
                     </Button>
                 </div>
            </div>
        );
    }


    return (
        // Original Mint Green/Light background
        <section className="bg-[#ffffff] py-8">
            <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                 <h2 className="text-xl md:text-2xl font-semibold tracking-wider mb-4 text-black">BEST SELLERS</h2>
                {isLoading ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                         {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-lg bg-white" />)}
                     </div>
                ) : products.length === 0 ? (
                    <p className="text-center text-black/70">No trending products found.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {products.map((product) => (
                           <TrendingProductCard key={product._id} product={product} onAddToWishlist={handleAddToWishlist} currentUser={currentUser} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function ShringarStrikeSection() {
    const images = [
        { src: "/assets/1stof6.jpg", title: "Classic Bangles" },
        { src: "/assets/2ndof6.jpg", title: "Ruby Necklace" },
        { src: "/assets/3rdof6.jpg", title: "Gold Studs" },
        { src: "/assets/4of6.jpg", title: "Heavy Kada" },
        { src: "/assets/5of6.png", title: "Pearl Strand" },
        { src: "/assets/6of6.jpg", title: "Diamond Bracelet" },
    ];

    return (
        <section className="bg-[#ffffff] py-16">
            
            {/* TITLE + SUBTITLE */}
            <div className="text-center mb-10">
                <h2 className="text-4xl md:text-5xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-800">
                    SHRINGAR STRIKE
                </h2>
                <p className="text-black/70 text-lg mt-2">
                    Exclusive pieces for the discerning collector.
                </p>
            </div>

            {/* FULL-WIDTH GRID LIKE SCREENSHOT */}
            <div className="w-full px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className="overflow-hidden rounded-lg shadow-lg group"
                        >
                            <img
                                src={img.src}
                                alt={img.title}
                                className="w-full h-[350px] object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// --- SHRINGAR Info Section (Original Mint Green/Light background) ---
function ShringarInfoSection() {
    return (
        <section className="bg-[#ffffff] py-20">

            <div className="w-full max-w-screen-2xl mx-auto px-8 md:px-14 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* LEFT — IMAGE WITH BACKGROUND BORDER FRAME */}
                <div className="relative flex justify-center">

                    {/* ⭐ GOLD BACKGROUND FRAME (behind image) */}
                    <div
                        className="absolute -top-8 -left-8 w-[90%] h-[90%] border-[6px] border-[#C49A6C] rounded-sm z-0"
                    />

                    {/* MAIN IMAGE (no border) */}
                    <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-lg shadow-xl">
                        <img
                            src="/assets/gemgarden.png"
                            alt="Jewelry presentation"
                            className="w-full h-[450px] object-cover"
                        />
                    </div>
                </div>

                {/* RIGHT — TEXT BLOCK */}
                <div className="space-y-6 pr-4">
                    <h2 className="text-4xl font-bold tracking-wide text-black">
                        GEM GARDEN
                    </h2>

                    <p className="text-lg text-black/70 leading-relaxed">
                        Multi-brand premium boutique with a wide range
                        of branded jewellery and accessories.
                    </p>

                    <p className="text-black/80 leading-relaxed">
                        Gem Garden presents leading global brands of jewelry known 
                        for their unique style and high quality craftsmanship.
                    </p>

                    <Button 
                        variant="default" 
                        className="bg-black hover:bg-black/80 text-white rounded-full px-6 py-3 text-lg"
                    >
                        SHOP COLLECTIONS
                    </Button>
                </div>

            </div>

        </section>
    );
}


function AboutSection() {
    const navigate = useNavigate();

    return (
        <section className="bg-[#ffffff] py-20">
            <div className="w-full max-w-screen-2xl mx-auto px-8 md:px-14 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                {/* LEFT — TEXT */}
                <div className="space-y-6 text-black">
                    <h2 className="text-4xl font-bold tracking-wide">
                        ABOUT
                    </h2>

                    <p className="text-lg text-black/70 leading-relaxed">
                        We are committed to preserving the heritage of traditional Indian
                        jewelry while ensuring contemporary relevance. Our pieces are
                        sourced directly from master artisans, guaranteeing authenticity,
                        quality, and ethical craftsmanship.
                    </p>

                    <p className="text-black/80 leading-relaxed">
                        We blend classic design elements with modern craftsmanship to
                        create heirloom pieces for the next generation.
                    </p>

                    <Button
                        variant="default"
                        className="bg-black hover:bg-black/80 text-white rounded-full px-6 py-3 text-lg"
                        onClick={() => navigate('/about')}
                    >
                        Read Our Story
                    </Button>
                </div>

                {/* RIGHT — IMAGE with GOLD BACKGROUND FRAME */}
                <div className="relative flex justify-center">

                    {/* ⭐ GOLD BORDER (Behind image, background only) */}
                    <div
                        className="absolute -top-8 -left-8 w-[90%] h-[90%] border-[6px] border-[#C49A6C] rounded-sm z-0"
                    />

                    {/* MAIN IMAGE (No border) */}
                    <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-lg shadow-xl">
                        <img
                            src="/assets/about.png"
                            alt="Jewelry collage"
                            className="w-full h-[450px] object-cover object-top"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}





// --- Gifts Section (Restored to original dark theme) ---
function GiftsSection() {
    const navigate = useNavigate();

    return (
        <section className="relative bg-[#ffffff] py-0">

            {/* FULL WIDTH GIFT IMAGE WITH MATCHING BORDER */}
            <div className="w-full h-[600px] overflow-hidden border-[28px] border-[#ffffff]">
                <img
                    src="/assets/giftimg.jpg"
                    alt="Gift box"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* RIGHT SIDE TEXT OVERLAY (same as screenshot) */}
            <div className="absolute inset-0 flex items-center justify-end pr-16">
                <div className="text-right max-w-md text-white space-y-4">
{/* 
                    <h2 className="text-4xl font-bold tracking-wide">
                        Gifts
                    </h2> */}

                    {/* <p className="text-white/80 text-lg leading-relaxed">
                        Looking for the perfect gift?  
                        Discover our premium collection of jewelry gifts  
                        crafted for unforgettable moments.
                    </p> */}

                    {/* <Button
                        size="lg"
                        className="bg-[#ADC9A8] text-black hover:bg-[#ADC9A8]/80 px-8 py-3 text-lg rounded-full font-bold"
                        onClick={() => navigate('/buyer?tag=gifts')}
                    >
                        Shop Gifts
                    </Button> */}

                </div>
            </div>

        </section>
    );
}



// --- Footer Component (Restored to original dark theme) ---
function Footer() {
    const navigate = useNavigate();

    return (
        <footer className="bg-black text-white pt-8 pb-4">
            <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-8">

                    {/* Brand / Contact */}
                    <div className="lg:col-span-2 space-y-3 cursor-pointer"
                         onClick={() => navigate('/buyer')}>
                        <div className="flex items-center gap-2 mb-2">
                            <Gem className="h-7 w-7 text-white" />
                            <span className="font-bold text-2xl tracking-widest">SHRINGAR</span>
                        </div>
                        <p className="text-sm text-white/70">Email: support@shringar.com</p>
                        <p className="text-sm text-white/70">Phone: +91 123 456 7890</p>
                    </div>

                    {/* My Account */}
                    <div>
                        <h4 className="font-semibold mb-3">My Account</h4>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li onClick={() => navigate('/buyer')} className="hover:text-white cursor-pointer">My Orders</li>
                            <li onClick={() => navigate('/buyer')} className="hover:text-white cursor-pointer">Wishlist</li>
                            <li onClick={() => navigate('/buyer')} className="hover:text-white cursor-pointer">My Profile</li>
                        </ul>
                    </div>

                    {/* Information */}
                    <div>
                        <h4 className="font-semibold mb-3">Information</h4>
                        <ul className="space-y-2 text-sm text-white/70">
                            <li onClick={() => navigate('/buyer')} className="hover:text-white cursor-pointer">About Us</li>
                            <li onClick={() => navigate('/buyer')} className="hover:text-white cursor-pointer">Contact</li>
                            <li onClick={() => navigate('/buyer')} className="hover:text-white cursor-pointer">FAQ</li>
                        </ul>
                    </div>

                    {/* Social & Policies */}
                    <div>
                        <h4 className="font-semibold mb-3">Connect</h4>
                        <div className="flex gap-3">
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10"
                                onClick={() => navigate('/buyer')}>
                                <Facebook className="h-4 w-4" />
                            </Button>

                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10"
                                onClick={() => navigate('/buyer')}>
                                <Twitter className="h-4 w-4" />
                            </Button>

                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10"
                                onClick={() => navigate('/buyer')}>
                                <User className="h-4 w-4" />
                            </Button>
                        </div>

                        <p onClick={() => navigate('/buyer')} className="text-xs text-white/70 mt-4 cursor-pointer hover:text-white">
                            Terms & Conditions
                        </p>

                        <p onClick={() => navigate('/buyer')} className="text-xs text-white/70 cursor-pointer hover:text-white">
                            Privacy Policy
                        </p>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-4 text-center text-sm text-white/70 cursor-pointer"
                     onClick={() => navigate('/buyer')}>
                    © {new Date().getFullYear()} Shringar. All Rights Reserved.
                </div>

            </div>
        </footer>
    );
}



// --- Main Landing Component (Ensuring white background) ---
const Landing = () => {
  return (
    // Sets the entire page background to white
<div className="min-h-screen bg-[#ffffff]">
        <Header />
        <main>
            <HeroSection />
            <NewCollectionsSection />
            <CategoriesSection />
            <TrendingSection />
            <ShringarStrikeSection />
            <ShringarInfoSection />
            <AboutSection />
            <GiftsSection />
        </main>
        <Footer />
    </div>
  );
};

export default Landing;
