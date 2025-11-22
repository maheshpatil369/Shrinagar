import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
    ArrowUpRight, ArrowRight, Gem, Sparkles, Menu, X, User, 
    LogOut, LayoutDashboard, Settings, ShoppingBag 
} from 'lucide-react'; 

// Use robust relative paths
import { fetchMetalPrice, MetalPriceData } from '../lib/gold';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; 
import { useUser } from "../context/UserContext"; 
import { useAuthModal } from "../context/AuthModalContext";
import ThreeDBackground from "../components/ThreeDBackground";

// --- UI Components for Dropdown ---
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

// --- Asset Imports ---
// These paths are relative to src/pages/Landing.tsx (which is in src/pages)
// So ../../assets/ points to src/assets/
import goldImg from '../../assets/goldimg.png';
import silverImg from '../../assets/silver.png';
import platinumImg from '../../assets/platinum.png';
import arVrImg from '../../assets/ar-vr.png';
import cadImg from '../../assets/CAD.png';
import marketImg from '../../assets/market.png';
import manufacturerImg from '../../assets/manufactor.png';
import distributorImg from '../../assets/distributor.png';
import sellerImg from '../../assets/seller.png';

// --- Header Component ---
function Header() {
    const navigate = useNavigate();
    
    // Use global contexts for reactive state
    const { user, logoutUser } = useUser();
    const { setAuthModalOpen } = useAuthModal();

    const navLinks = [
        { name: "HOME", path: "/" },
        { name: "TRY-ON", path: "#" },
        { name: "D2CAD", path: "#" },
        { name: "MARKETPLACE", path: "/buyer" },
        { name: "CONTACT", path: "#contact" },
    ];

    const handleScrollToContact = (e: React.MouseEvent) => {
        e.preventDefault();
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleLogout = () => {
        logoutUser();
        navigate('/');
    };

    return (
        <header 
            className="fixed top-0 left-0 right-0 z-50 w-full bg-[#020817]/80 backdrop-blur-md border-b border-white/10 shadow-lg py-4"
        >
            <div className="container mx-auto flex items-center justify-between px-4 md:px-8 h-16 max-w-7xl">

                {/* 1. Logo (Left) */}
                <div
                    className="flex items-center gap-3 cursor-pointer group shrink-0" 
                    onClick={() => navigate('/')}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-brand-yellow/20 rounded-full blur-md transition-all duration-300"></div>
                        <div className="relative p-2.5 rounded-full border border-brand-yellow/30 bg-[#051024]/80">
                            <Gem className="h-6 w-6 text-brand-yellow" />
                        </div>
                    </div>
                    <span className="text-brand-yellow font-bold text-xl tracking-[0.15em] hidden sm:block transition-colors">
                        SHRINGAR
                    </span>
                </div>

                {/* 2. NAVIGATION — ALWAYS VISIBLE */}
                <nav className="
                    flex gap-10 items-center ml-auto mr-6 
                    overflow-x-auto whitespace-nowrap no-scrollbar
                ">
                    {navLinks.map((link) => (
                        <a 
                            key={link.name} 
                            href={link.path}
                            onClick={link.name === 'CONTACT' ? handleScrollToContact : undefined}
                            className="
                                relative text-sm font-medium tracking-[0.15em] 
                                text-white/90 hover:text-brand-yellow 
                                transition-colors duration-300 uppercase group py-2
                            "
                        >
                            {link.name}
                            <span className="
                                absolute bottom-0 left-1/2 w-0 h-[2px] 
                                bg-brand-yellow transition-all duration-300 ease-out 
                                group-hover:w-full group-hover:left-0
                            "></span>
                        </a>
                    ))}
                </nav>

                {/* 3. RIGHT ACTIONS: PROFILE DROPDOWN OR LOGIN BUTTON */}
                <div className="flex items-center gap-4 shrink-0">

                    {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full relative">
                                    <Avatar className="h-10 w-10 border-2 border-white/20 hover:border-brand-yellow/50 transition-all">
                                        <AvatarFallback className="bg-brand-yellow text-[#020817] font-bold text-sm">
                                            {user.name ? user.name[0].toUpperCase() : "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>

                          <DropdownMenuContent
  className="w-72 bg-[#0e1b33] text-white p-0 rounded-xl border border-white/10 shadow-2xl mt-2"
  align="end"
>
  {/* Header Section */}
  <div className="px-4 py-4 border-b border-white/10 bg-[#051024]/70 rounded-t-xl">
    <p className="text-sm text-gray-300">
      <span className="font-semibold text-brand-yellow">Name:</span> {user.name}
    </p>
    <p className="text-sm text-gray-300 mt-1">
      <span className="font-semibold text-brand-yellow">Gmail:</span> {user.email}
    </p>
    <p className="text-sm text-gray-300 mt-1">
      <span className="font-semibold text-brand-yellow">Role:</span> {user.role}
    </p>
  </div>

  {/* Menu Items */}
  <div className="p-2 space-y-1">
    <DropdownMenuItem
      className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 cursor-pointer"
      onClick={() => navigate('/profile')}
    >
      <User className="h-4 w-4 text-brand-yellow" /> Profile
    </DropdownMenuItem>

    <DropdownMenuItem
      className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 cursor-pointer"
      onClick={() => navigate('/buyer')}
    >
      <ShoppingBag className="h-4 w-4 text-brand-yellow" /> Browse Jewelry
    </DropdownMenuItem>

    {user.role === 'seller' && (
      <DropdownMenuItem
        className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 cursor-pointer"
        onClick={() => navigate('/seller')}
      >
        <LayoutDashboard className="h-4 w-4 text-brand-yellow" /> Seller Dashboard
      </DropdownMenuItem>
    )}

    {user.role === 'admin' && (
      <DropdownMenuItem
        className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium text-gray-200 hover:bg-white/10 cursor-pointer"
        onClick={() => navigate('/admin')}
      >
        <Settings className="h-4 w-4 text-brand-yellow" /> Admin Dashboard
      </DropdownMenuItem>
    )}
  </div>

  {/* Logout */}
  <div className="p-3 border-t border-white/10">
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-full bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white font-semibold h-10 rounded-lg border border-red-500/50">
          <LogOut className="h-4 w-4 mr-2" /> Log out
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-[#0e1b33] text-white border border-white/10">
        <AlertDialogHeader>
          <AlertDialogTitle>Log out?</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            You will be returned to the home page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-white/10 text-white hover:bg-white/20">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLogout}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Log out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</DropdownMenuContent>

                        </DropdownMenu>
                    ) : (
                        <Button 
                            onClick={() => setAuthModalOpen(true)}
                            className="
                                bg-brand-yellow text-[#020817] hover:bg-white 
                                font-bold tracking-wider text-xs sm:text-sm px-8 py-5 
                                rounded-full transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)] 
                                hover:shadow-[0_0_25px_rgba(255,215,0,0.6)]
                            "
                        >
                            LOGIN / SIGN UP
                        </Button>
                    )}

                </div>

            </div>
        </header>
    );
}


// --- Hero Section (Fixed positioning overlap) ---
function HeroSection() { 
    return (
        <section className="relative min-h-screen flex flex-col px-4 overflow-hidden pt-32 md:pt-40">
            {/* Transparent background to let fixed ThreeDBackground show through */}
            
            {/* CENTER CONTENT */}
            <div className="relative z-10 flex-grow flex flex-col items-center justify-center w-full max-w-7xl mx-auto">

                {/* Row: Logo + Text */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">

                    {/* Logo Circle */}
                    <div className="relative shrink-0 group cursor-pointer">
                        <div className="absolute inset-0 bg-brand-yellow/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse"></div>
                        <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-2 border-brand-yellow bg-[#051024]/80 backdrop-blur-sm flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.15)]">
                            <Gem className="h-12 w-12 md:h-16 md:w-16 text-brand-yellow mb-2" />
                            <span className="text-brand-yellow font-bold text-xs md:text-base tracking-[0.3em]">LOGO</span>
                        </div>
                    </div>

                    {/* SHRINGAR AI — ALWAYS ONE LINE */}
                    <h1
                        className="
                            text-center md:text-left
                            font-thin tracking-wider text-white drop-shadow-2xl
                            leading-none whitespace-nowrap
                            text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[10rem]
                        "
                    >
                        SHRINGAR <span className="font-normal text-brand-yellow">AI</span>
                    </h1>
                </div>
            </div>

            {/* BOTTOM CONTENT: Subtitle + Features */}
            <div className="relative z-10 pb-12 w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">

                {/* Subtitle */}
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white/90 font-serif italic tracking-wide mb-10 leading-relaxed max-w-4xl text-center">
                    Your one-stop platform for Jewellery.
                </p>

                {/* Feature Links */}
                <div className="flex flex-wrap justify-center items-center gap-6 md:gap-16 text-lg md:text-2xl font-medium tracking-[0.25em] text-brand-yellow uppercase">
                    <span className="hover:text-white transition-colors cursor-default hover:scale-105 duration-300">AR TRY-ON</span>
                    <span className="text-white/20 text-base md:text-xl">•</span>
                    <span className="hover:text-white transition-colors cursor-default hover:scale-105 duration-300">DESIGN TO CAD</span>
                    <span className="text-white/20 text-base md:text-xl">•</span>
                    <span className="hover:text-white transition-colors cursor-default hover:scale-105 duration-300">MARKETPLACE</span>
                </div>
            </div>

        </section>
    );
}


function GridSection() {
    const navigate = useNavigate();
    const [rates, setRates] = useState<{
        gold: MetalPriceData | null;
        silver: MetalPriceData | null;
        platinum: MetalPriceData | null;
    }>({ gold: null, silver: null, platinum: null });

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const [goldData, silverData, platinumData] = await Promise.all([
                    fetchMetalPrice('XAU'),
                    fetchMetalPrice('XAG'),
                    fetchMetalPrice('XPT')
                ]);
                setRates({ gold: goldData, silver: silverData, platinum: platinumData });
            } catch (error) {
                console.error("Error loading rates:", error);
            }
        };
        fetchRates();
    }, []);

    const formatPrice = (data: MetalPriceData | null, unit: string, divisor: number = 1) => {
        if (!data) return "Loading...";
        return `Rs. ${(data.price / divisor).toLocaleString('en-IN', { maximumFractionDigits: 0 })}/${unit}`;
    };

    const GridCard = ({ 
        image, 
        children,   
        onClick, 
        borderColorClass = "hover:border-brand-yellow/50" 
    }: { 
        image: string, 
        children: React.ReactNode, 
        onClick?: () => void, 
        borderColorClass?: string 
    }) => (
        <div 
            onClick={onClick}
            className={`group relative aspect-[4/3] bg-[#0b1e3b]/70 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] ${borderColorClass}`}
        >
            <img 
                src={image}
                alt="background"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-70 z-0"
            />
            
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 group-hover:via-black/40 transition-colors duration-300" />
        
            <div className="relative z-10 h-full p-8 flex flex-col justify-between">
                {children}
            </div>
        </div>
    );

    return (
        // REMOVED solid background color to let the global 3D background show through
        <section className="py-20 px-4 border-y border-white/10 relative z-10">
            <div className="container mx-auto max-w-7xl">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    <GridCard image={goldImg} borderColorClass="hover:border-yellow-400">
                        <div className="flex justify-between items-start">
                            <h3 className="text-2xl font-bold tracking-[0.2em] text-white group-hover:text-yellow-400 transition-colors duration-200">GOLD</h3>
                            <div className="p-2 rounded-full bg-yellow-500/20 border border-yellow-500/50">
                                <div className="h-4 w-4 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="h-px w-full bg-white/30 mb-4 group-hover:bg-yellow-400/50 transition-colors" />
                            <p className="text-3xl font-serif italic text-white font-semibold text-shadow-sm">
                                {formatPrice(rates.gold, 'g', 31.1)}
                            </p>
                        </div>
                    </GridCard>

                    {/* 2. SILVER */}
                    <GridCard image={silverImg} borderColorClass="hover:border-gray-300">
                        <div className="flex justify-between items-start">
                            <h3 className="text-2xl font-bold tracking-[0.2em] text-white group-hover:text-gray-300 transition-colors duration-200">SILVER</h3>
                            <div className="p-2 rounded-full bg-gray-400/20 border border-gray-400/50">
                                <div className="h-4 w-4 rounded-full bg-gray-300 shadow-[0_0_10px_rgba(209,213,219,0.8)]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="h-px w-full bg-white/30 mb-4 group-hover:bg-gray-300/50 transition-colors" />
                            <p className="text-3xl font-serif italic text-white font-semibold text-shadow-sm">
                                {formatPrice(rates.silver, 'kg', 0.0311)}
                            </p>
                        </div>
                    </GridCard>

                    {/* 3. PLATINUM */}
                    <GridCard image={platinumImg} borderColorClass="hover:border-purple-300">
                        <div className="flex justify-between items-start">
                            <h3 className="text-2xl font-bold tracking-[0.2em] text-white group-hover:text-purple-300 transition-colors duration-200">PLATINUM</h3>
                            <div className="p-2 rounded-full bg-purple-400/20 border border-purple-400/50">
                                <div className="h-4 w-4 rounded-full bg-purple-300 shadow-[0_0_10px_rgba(216,180,254,0.8)]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="h-px w-full bg-white/30 mb-4 group-hover:bg-purple-300/50 transition-colors" />
                            <p className="text-3xl font-serif italic text-white font-semibold text-shadow-sm">
                                {formatPrice(rates.platinum, 'g', 31.1)}
                            </p>
                        </div>
                    </GridCard>

                    {/* --- ROW 2: FEATURES --- */}

                    {/* 4. VIRTUAL TRY-ON */}
                    <GridCard 
                        image={arVrImg} 
                        onClick={() => console.log("Navigate to Try-On")}
                        borderColorClass="hover:border-[#00d2ff]"
                    >
                        <div className="flex-grow flex items-center justify-center">
                            <h2 className="text-3xl font-bold tracking-widest text-white text-center leading-tight group-hover:text-[#00d2ff] transition-colors duration-200 drop-shadow-lg">
                                VIRTUAL<br/>TRY - ON
                            </h2>
                        </div>
                        <div className="flex justify-end">
                             <div className="p-3 rounded-full border border-white/30 bg-black/20 group-hover:bg-[#00d2ff] group-hover:border-[#00d2ff] transition-all duration-300">
                                <ArrowUpRight className="h-6 w-6 text-white group-hover:text-black transition-colors duration-200" />
                             </div>
                        </div>
                    </GridCard>

                    {/* 5. DESIGN TO CAD */}
                    <GridCard 
                        image={cadImg} 
                        onClick={() => console.log("Navigate to Design to CAD")}
                        borderColorClass="hover:border-[#9D50BB]"
                    >
                        <div className="flex-grow flex items-center justify-center">
                            <h2 className="text-3xl font-bold tracking-widest text-white text-center leading-tight group-hover:text-[#9D50BB] transition-colors duration-200 drop-shadow-lg">
                                DESIGN TO<br/>CAD
                            </h2>
                        </div>
                        <div className="flex justify-end">
                             <div className="p-3 rounded-full border border-white/30 bg-black/20 group-hover:bg-[#9D50BB] group-hover:border-[#9D50BB] transition-all duration-300">
                                <ArrowUpRight className="h-6 w-6 text-white transition-colors duration-200" />
                             </div>
                        </div>
                    </GridCard>

                    {/* 6. MARKET PLACE */}
                    <GridCard 
                        image={marketImg} 
                        onClick={() => navigate('/buyer')}
                        borderColorClass="hover:border-brand-yellow"
                    >
                        <div className="flex-grow flex items-center justify-center">
                            <h2 className="text-3xl font-bold tracking-widest text-white text-center leading-tight group-hover:text-brand-yellow transition-colors duration-200 drop-shadow-lg">
                                MARKET PLACE
                            </h2>
                        </div>
                        <div className="flex justify-end">
                             <div className="p-3 rounded-full border border-white/30 bg-black/20 group-hover:bg-brand-yellow group-hover:border-brand-yellow transition-all duration-300">
                                <ArrowUpRight className="h-6 w-6 text-white group-hover:text-black transition-colors duration-200" />
                             </div>
                        </div>
                    </GridCard>

                </div>
            </div>
        </section>
    );
}

// --- Contact Section with FIXED ANIMATION & VISIBILITY ---
function ContactSection() {
    const cards = [
        { text: "ARE YOU A\nMANUFACTURER?", link: "/auth", image: manufacturerImg },
        { text: "ARE YOU A\nDISTRIBUTOR?", link: "/auth", image: distributorImg },
        { text: "ARE YOU A\nSELLER?", link: "/auth", image: sellerImg }
    ];
    const navigate = useNavigate();

    return (
        // REMOVED solid background to allow full scroll 3D animation
        <section id="contact" className="py-16 px-4 border-t border-white/5 relative z-10">
            <div className="container mx-auto max-w-6xl text-center">
                <h2 className="text-4xl md:text-6xl font-thin tracking-[0.1em] text-white mb-12 drop-shadow-2xl">
                    CONTACT <span className="text-brand-yellow font-normal">US</span>
                </h2>
                
                {/* Updated aspect ratio for shorter, rectangular cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    {cards.map((item, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => navigate(item.link)}
                            // Changed from aspect-[4/5] to aspect-[4/3] to make it shorter (rectangle)
                            className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-2"
                        >
                            {/* 1. Rotating Gradient Border Layer - ALWAYS VISIBLE & ANIMATING */}
                            <div className="absolute -inset-[150%] bg-gradient-to-r from-transparent via-brand-yellow/80 to-transparent animate-[spin_3s_linear_infinite] z-0 opacity-100"></div>
                            
                            {/* 2. Inner Content Container */}
                            <div className="absolute inset-[3px] bg-[#051024] rounded-2xl overflow-hidden z-10">
                                
                                {/* Background Image - Always Visible */}
                                <img 
                                    src={item.image}
                                    alt={item.text}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100 z-0"
                                />
                                
                                {/* Dark Overlay */}
                                <div className="absolute inset-0 z-10 bg-black/60 group-hover:bg-black/40 transition-colors duration-300" />

                                {/* Content */}
                                <div className="relative z-20 h-full p-6 flex flex-col items-center justify-center gap-4 text-center">
                                    <p className="text-white font-bold tracking-widest text-2xl md:text-3xl whitespace-pre-line leading-tight group-hover:text-brand-yellow transition-colors duration-300 drop-shadow-lg">
                                        {item.text}
                                    </p>
                                    
                                    <div className="transition-all duration-500 ease-out flex items-center gap-3 text-black bg-brand-yellow font-bold tracking-widest text-sm px-6 py-2 rounded-full shadow-[0_0_25px_rgba(255,215,0,0.6)] group-hover:scale-110">
                                        JOIN NOW <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-12">
                    <Button 
                        variant="outline" 
                        className="
                            h-auto py-4 px-12 rounded-full bg-transparent text-white border-white/30 
                            hover:bg-brand-yellow hover:text-brand-navy hover:border-brand-yellow 
                            text-lg tracking-[0.2em] transition-all duration-300 hover:scale-105
                            shadow-[0_0_15px_rgba(255,255,255,0.1)]
                        "
                        onClick={() => window.location.href = 'mailto:contact@shringar.com'}
                    >
                        WRITE TO US
                    </Button>
                    <Button 
                        variant="outline" 
                        className="
                            h-auto py-4 px-12 rounded-full bg-transparent text-white border-white/30 
                            hover:bg-[#25D366] hover:text-white hover:border-[#25D366] 
                            text-lg tracking-[0.2em] transition-all duration-300 hover:scale-105
                            shadow-[0_0_15px_rgba(255,255,255,0.1)]
                        "
                        onClick={() => window.open('https://wa.me/', '_blank')}
                    >
                        WHATSAPP
                    </Button>
                </div>
            </div>
        </section>
    );
}

// --- Footer ---
function Footer() {
    return (
        <footer className="bg-[#020817]/90 backdrop-blur-md py-8 text-center border-t border-white/5 relative z-10">
            <div className="flex flex-row justify-center items-center gap-4">
                 <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300">
                    <Gem className="h-4 w-4 text-brand-yellow" />
                    <span className="text-brand-yellow font-bold tracking-widest text-sm">SHRINGAR AI</span>
                 </div>
                 <span className="text-white/20 text-sm hidden sm:inline">|</span>
                 <p className="text-white/30 text-[10px] sm:text-xs tracking-widest uppercase mt-0">
                    © {new Date().getFullYear()} Shringar AI. All Rights Reserved.
                 </p>
            </div>
        </footer>
    );
}

export default function Landing() {
    return (
        <div className="min-h-screen bg-[#020817] font-sans selection:bg-brand-yellow selection:text-brand-navy overflow-x-hidden relative">
            {/* Global Fixed 3D Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <ThreeDBackground />
            </div>

            <div className="relative z-10">
                <Header />
                <main>
                    <HeroSection />
                    <GridSection /> 
                    <ContactSection />
                </main>
                <Footer />
            </div>
        </div>
    );
} 