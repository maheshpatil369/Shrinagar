# Welcome to your Lovable project

## Project info


function HeroSection() {
    return (
        <section className="relative h-[90vh] flex flex-col items-center text-center px-4 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#020817] via-[#0f2342] to-[#1e1b4b] animate-gradient-xy z-0"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-soft-light"></div>

            {/* 1. Main Center Content (Logo + Title ONLY) */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-grow w-full max-w-7xl mx-auto">
                
                {/* Logo + Title Row */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                    
                    {/* Logo Circle */}
                    <div className="relative shrink-0 group cursor-pointer">
                        <div className="absolute inset-0 bg-brand-yellow/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse"></div>
                        {/* Increased circle size slightly to accommodate larger icon/text */}
                        <div className="relative w-28 h-28 md:w-40 md:h-40 rounded-full border-2 border-brand-yellow bg-[#051024] flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.15)]">
                            <Gem className="h-10 w-10 md:h-14 md:w-14 text-brand-yellow mb-2" />
                            {/* Increased LOGO text size */}
                            <span className="text-brand-yellow font-bold text-xs md:text-sm tracking-[0.3em]">LOGO</span> 
                        </div>
                    </div>

                    {/* SHRINGAR AI Text - MASSIVE FONT INCREASE */}
                    <h1 className="text-7xl sm:text-6xl md:text-[11rem] lg:text-[10rem] font-thin tracking-wider text-white leading-none flex flex-col md:block text-center md:text-left drop-shadow-2xl">
                        SHRINGAR <span className="font-normal text-brand-yellow">AI</span>
                    </h1>
                </div>
            </div>

            {/* 2. Bottom Content (Subtitle + Feature Links) */}
            <div className="relative z-10 pb-16 w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                
                {/* Subtitle - Increased Font Size */}
                <p className="text-2xl md:text-4xl lg:text-4xl text-white/90 font-serif italic tracking-wide mb-10 leading-relaxed">
                    Your one-stop platform for Jewellery.
                </p>

                {/* Feature Links - Increased Font Size */}
                <div className="flex flex-wrap justify-center items-center gap-6 md:gap-14 text-base md:text-xl font-medium tracking-[0.25em] text-brand-yellow uppercase">
                    <span className="hover:text-white transition-colors cursor-default">AR TRY-ON</span>
                    <span className="text-white/20 text-sm">•</span>
                    <span className="hover:text-white transition-colors cursor-default">DESIGN TO CAD</span>
                    <span className="text-white/20 text-sm">•</span>
                    <span className="hover:text-white transition-colors cursor-default">MARKETPLACE</span>
                </div>
            </div>
        
        </section>
    );
}







**URL**: https://lovable.dev/projects/157b48c5-d4ed-4963-aba6-3edc606395c8

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/157b48c5-d4ed-4963-aba6-3edc606395c8) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone repo name

# Step 2: Navigate to the project directory.
cd frontend1

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/157b48c5-d4ed-4963-aba6-3edc606395c8) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)


















import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowRight, Gem, Sparkles, Coins, Disc } from 'lucide-react'; // Added icons for metals
import { fetchMetalPrice, MetalPriceData } from '@/lib/gold';

// --- Header Component ---
function Header() {
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

    return (
        <header className="sticky top-0 z-50 w-full bg-[#020817]/80 backdrop-blur-md border-b border-white/5 transition-all duration-300">
            <div className="container mx-auto flex h-20 items-center justify-center px-4 md:px-8">
                <nav className="flex gap-6 md:gap-12 items-center text-xs md:text-sm font-medium tracking-[0.2em]">
                    {navLinks.map((link) => (
                        <a 
                            key={link.name} 
                            href={link.path}
                            onClick={link.name === 'CONTACT' ? handleScrollToContact : undefined}
                            className="relative text-white/70 hover:text-brand-yellow transition-colors duration-300 uppercase group py-2"
                        >
                            {link.name}
                            <span className="absolute bottom-0 left-1/2 w-0 h-[1px] bg-brand-yellow transition-all duration-300 ease-out group-hover:w-full group-hover:left-0"></span>
                        </a>
                    ))}
                </nav>
            </div>
        </header>
    );
}

// --- Hero Section (UNCHANGED) ---
function HeroSection() {
    return (
        <section className="relative h-[90vh] flex flex-col items-center text-center px-4 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#020817] via-[#0f2342] to-[#1e1b4b] animate-gradient-xy z-0"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-soft-light"></div>

            {/* 1. Main Center Content (Logo + Title ONLY) */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-grow w-full max-w-7xl mx-auto">
                
                {/* Logo + Title Row */}
                <div className="flex flex-col xl:flex-row items-center justify-center gap-8 md:gap-16">
                    
                    {/* Logo Circle - Increased Size */}
                    <div className="relative shrink-0 group cursor-pointer">
                        <div className="absolute inset-0 bg-brand-yellow/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 animate-pulse"></div>
                        {/* Increased circle size */}
                        <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-2 border-brand-yellow bg-[#051024] flex flex-col items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.15)]">
                            <Gem className="h-12 w-12 md:h-16 md:w-16 text-brand-yellow mb-2" />
                            {/* Increased LOGO text size */}
                            <span className="text-brand-yellow font-bold text-xs md:text-base tracking-[0.3em]">LOGO</span> 
                        </div>
                    </div>

                    {/* SHRINGAR AI Text - MASSIVE FONT INCREASE */}
                    <h1 className="text-7xl sm:text-8xl md:text-[9rem] lg:text-[11rem] xl:text-[13rem] font-thin tracking-wider text-white leading-[0.9] flex flex-col xl:block text-center xl:text-left drop-shadow-2xl">
                        SHRINGAR <span className="font-normal text-brand-yellow">AI</span>
                    </h1>
                </div>
            </div>

            {/* 2. Bottom Content (Subtitle + Feature Links) */}
            <div className="relative z-10 pb-12 w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                
                {/* Subtitle - Increased Font Size */}
                <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white/90 font-serif italic tracking-wide mb-10 leading-relaxed max-w-4xl">
                    Your one-stop platform for Jewellery.
                </p>

                {/* Feature Links - Increased Font Size */}
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

// --- 2nd Screen: 6 Boxes (Rates + Features) ---
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

    return (
        <section className="bg-[#051024] py-20 px-4 border-y border-white/10 relative">
            <div className="container mx-auto max-w-7xl">
                
                {/* The 6-Box Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* --- ROW 1: METAL RATES --- */}
                    
                    {/* 1. GOLD */}
                    <div className="group relative aspect-[4/3] bg-[#0b1e3b] border border-white/10 p-8 flex flex-col justify-between rounded-xl overflow-hidden hover:border-brand-yellow/50 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(255,215,0,0.3)] cursor-pointer">
                        {/* Header: Name + Icon */}
                        <div className="flex justify-between items-start relative z-10">
                            <h3 className="text-2xl font-light tracking-[0.2em] text-white group-hover:text-brand-yellow transition-colors duration-200">GOLD</h3>
                            <div className="p-3 rounded-full border border-white/10 bg-white/5 group-hover:bg-brand-yellow group-hover:border-brand-yellow transition-colors duration-200">
                                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600"></div> 
                            </div>
                        </div>
                        {/* Price Divider */}
                        <div className="h-px w-full bg-white/10 my-4 group-hover:bg-brand-yellow/50 transition-colors duration-200 relative z-10"></div>
                        {/* Price */}
                        <div className="relative z-10">
                            <p className="text-3xl font-serif italic text-white group-hover:text-brand-yellow transition-colors duration-200">
                                {formatPrice(rates.gold, 'g', 31.1)}
                            </p>
                        </div>
                        {/* Hover Glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>

                    {/* 2. SILVER */}
                    <div className="group relative aspect-[4/3] bg-[#0b1e3b] border border-white/10 p-8 flex flex-col justify-between rounded-xl overflow-hidden hover:border-gray-400 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(209,213,219,0.3)] cursor-pointer">
                        <div className="flex justify-between items-start relative z-10">
                            <h3 className="text-2xl font-light tracking-[0.2em] text-white group-hover:text-gray-300 transition-colors duration-200">SILVER</h3>
                            <div className="p-3 rounded-full border border-white/10 bg-white/5 group-hover:bg-gray-400 group-hover:border-gray-400 transition-colors duration-200">
                                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-gray-300 to-gray-500"></div>
                            </div>
                        </div>
                        <div className="h-px w-full bg-white/10 my-4 group-hover:bg-gray-400/50 transition-colors duration-200 relative z-10"></div>
                        <div className="relative z-10">
                            <p className="text-3xl font-serif italic text-white group-hover:text-gray-300 transition-colors duration-200">
                                {formatPrice(rates.silver, 'kg', 0.0311)}
                            </p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>

                    {/* 3. PLATINUM */}
                    <div className="group relative aspect-[4/3] bg-[#0b1e3b] border border-white/10 p-8 flex flex-col justify-between rounded-xl overflow-hidden hover:border-purple-300 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(216,180,254,0.3)] cursor-pointer">
                        <div className="flex justify-between items-start relative z-10">
                            <h3 className="text-2xl font-light tracking-[0.2em] text-white group-hover:text-purple-300 transition-colors duration-200">PLATINUM</h3>
                            <div className="p-3 rounded-full border border-white/10 bg-white/5 group-hover:bg-purple-300 group-hover:border-purple-300 transition-colors duration-200">
                                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-gray-200 to-purple-200"></div>
                            </div>
                        </div>
                        <div className="h-px w-full bg-white/10 my-4 group-hover:bg-purple-300/50 transition-colors duration-200 relative z-10"></div>
                        <div className="relative z-10">
                            <p className="text-3xl font-serif italic text-white group-hover:text-purple-300 transition-colors duration-200">
                                {formatPrice(rates.platinum, 'g', 31.1)}
                            </p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>

                    {/* --- ROW 2: FEATURES --- */}

                    {/* 4. VIRTUAL TRY-ON */}
                    <div 
                        onClick={() => console.log("Navigate to Try-On")}
                        className="group relative aspect-[4/3] bg-[#0b1e3b] border border-white/10 p-8 flex flex-col justify-between rounded-xl overflow-hidden hover:border-[#00d2ff] cursor-pointer transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(0,210,255,0.3)]"
                    >
                        <div className="relative z-10 flex-grow flex items-center justify-center">
                            <h2 className="text-3xl font-light tracking-widest text-white text-center leading-tight group-hover:text-[#00d2ff] transition-colors duration-200">
                                VIRTUAL<br/>TRY - ON
                            </h2>
                        </div>
                        <div className="relative z-10 flex justify-end">
                             <div className="p-3 rounded-full border border-white/20 group-hover:bg-[#00d2ff] group-hover:border-[#00d2ff] transition-all duration-200">
                                <ArrowUpRight className="h-6 w-6 text-white group-hover:text-black transition-colors duration-200" />
                             </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00d2ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>

                    {/* 5. DESIGN TO CAD */}
                    <div 
                        onClick={() => console.log("Navigate to Design to CAD")}
                        className="group relative aspect-[4/3] bg-[#0b1e3b] border border-white/10 p-8 flex flex-col justify-between rounded-xl overflow-hidden hover:border-[#9D50BB] cursor-pointer transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(157,80,187,0.3)]"
                    >
                        <div className="relative z-10 flex-grow flex items-center justify-center">
                            <h2 className="text-3xl font-light tracking-widest text-white text-center leading-tight group-hover:text-[#9D50BB] transition-colors duration-200">
                                DESIGN TO<br/>CAD
                            </h2>
                        </div>
                        <div className="relative z-10 flex justify-end">
                             <div className="p-3 rounded-full border border-white/20 group-hover:bg-[#9D50BB] group-hover:border-[#9D50BB] transition-all duration-200">
                                <ArrowUpRight className="h-6 w-6 text-white transition-colors duration-200" />
                             </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#9D50BB]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>

                    {/* 6. MARKET PLACE */}
                    <div 
                        onClick={() => navigate('/buyer')}
                        className="group relative aspect-[4/3] bg-[#0b1e3b] border border-white/10 p-8 flex flex-col justify-between rounded-xl overflow-hidden hover:border-brand-yellow cursor-pointer transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(255,215,0,0.3)]"
                    >
                        <div className="relative z-10 flex-grow flex items-center justify-center">
                            <h2 className="text-3xl font-light tracking-widest text-white text-center leading-tight group-hover:text-brand-yellow transition-colors duration-200">
                                MARKET PLACE
                            </h2>
                        </div>
                        <div className="relative z-10 flex justify-end">
                             <div className="p-3 rounded-full border border-white/20 group-hover:bg-brand-yellow group-hover:border-brand-yellow transition-all duration-200">
                                <ArrowUpRight className="h-6 w-6 text-white group-hover:text-black transition-colors duration-200" />
                             </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    </div>

                </div>
            </div>
        </section>
    );
}

// --- Contact Section ---
function ContactSection() {
    const cards = [
        { text: "ARE YOU A\nMANUFACTURER?", link: "/auth" },
        { text: "ARE YOU A\nDISTRIBUTOR?", link: "/auth" },
        { text: "ARE YOU A\nSELLER?", link: "/auth" }
    ];
    const navigate = useNavigate();

    return (
        <section id="contact" className="bg-[#020817] py-32 px-4 border-t border-white/5 relative">
            <div className="container mx-auto max-w-6xl text-center">
                <h2 className="text-5xl md:text-7xl font-thin tracking-[0.1em] text-white mb-24">
                    CONTACT <span className="text-brand-yellow font-normal">US</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {cards.map((item, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => navigate(item.link)}
                            className="group relative rounded-xl overflow-hidden cursor-pointer min-h-[280px]"
                        >
                            <div className="absolute inset-[-100%] bg-[conic-gradient(from_90deg_at_50%_50%,#020817_50%,#FFD700_100%)] animate-[spin_4s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="absolute inset-[1px] bg-[#051024] rounded-xl p-12 flex flex-col items-center justify-center gap-8 hover:bg-[#0a192f] transition-colors duration-300 border border-white/10 group-hover:border-transparent">
                                <p className="text-white font-light tracking-wide text-xl whitespace-pre-line leading-relaxed group-hover:text-brand-yellow transition-colors duration-300">
                                    {item.text}
                                </p>
                                
                                <div className="opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 flex items-center gap-2 text-brand-yellow font-bold tracking-widest text-sm">
                                    JOIN NOW <ArrowRight className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-12">
                    <Button 
                        variant="outline" 
                        className="
                            h-auto py-6 px-12 rounded-full bg-transparent text-white border-white/30 
                            hover:bg-brand-yellow hover:text-brand-navy hover:border-brand-yellow 
                            text-lg tracking-[0.2em] transition-all duration-300 hover:scale-105
                        "
                        onClick={() => window.location.href = 'mailto:contact@shringar.com'}
                    >
                        WRITE TO US
                    </Button>
                    <Button 
                        variant="outline" 
                        className="
                            h-auto py-6 px-12 rounded-full bg-transparent text-white border-white/30 
                            hover:bg-[#25D366] hover:text-white hover:border-[#25D366] 
                            text-lg tracking-[0.2em] transition-all duration-300 hover:scale-105
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
        <footer className="bg-[#020817] py-12 text-center border-t border-white/5">
            <div className="flex justify-center items-center gap-2 mb-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                 <Gem className="h-5 w-5 text-brand-yellow" />
                 <span className="text-brand-yellow font-bold tracking-widest">SHRINGAR AI</span>
            </div>
            <p className="text-white/30 text-xs tracking-widest uppercase">© {new Date().getFullYear()} Shringar AI. All Rights Reserved.</p>
        </footer>
    );
}

export default function Landing() {
    return (
        <div className="min-h-screen bg-brand-navy font-sans selection:bg-brand-yellow selection:text-brand-navy overflow-x-hidden">
            <Header />
            <main>
                <HeroSection />
                {/* Replaced previous separate sections with the unified GridSection */}
                <GridSection /> 
                <ContactSection />
            </main>
            <Footer />
        </div>
    );
}