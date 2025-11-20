import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowRight, Gem, Sparkles } from 'lucide-react';

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

// --- Hero Section (Increased Font Sizes) ---
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

// --- Rates Section ---
function RatesSection() {
    const rates = [
        { metal: "GOLD", price: "12,540", unit: "/g", trend: "up" },
        { metal: "SILVER", price: "10,000", unit: "/kg", trend: "down" }, 
        { metal: "PLATINUM", price: "5,000", unit: "/g", trend: "up" },
    ];

    return (
        <section className="bg-[#051024] py-0 border-y border-white/10 relative z-20">
            <div className="container mx-auto max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {rates.map((rate, index) => (
                        <div 
                            key={rate.metal} 
                            className={`
                                relative p-10 text-center group overflow-hidden cursor-pointer
                                border-b md:border-b-0 border-white/10 
                                ${index !== rates.length - 1 ? 'md:border-r' : ''}
                                transition-colors duration-300 hover:bg-white/5
                            `}
                        >
                             <div className="absolute inset-0 bg-brand-yellow/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>

                             <div className="relative z-10 flex justify-between items-center mb-6 opacity-70 group-hover:opacity-100 transition-opacity">
                                <h3 className="text-sm font-medium tracking-[0.3em] text-white group-hover:text-brand-yellow transition-colors">{rate.metal}</h3>
                                <div className={`w-2 h-2 rounded-full ${rate.trend === 'up' ? 'bg-green-500' : 'bg-red-500'} animate-pulse shadow-[0_0_8px_currentColor]`}></div>
                             </div>
                             
                             <div className="relative z-10">
                                 <p className="text-4xl font-bold text-white group-hover:scale-110 transition-transform duration-300 origin-center inline-block">
                                    <span className="text-xl align-top text-brand-yellow mr-1">Rs.</span>
                                    {rate.price}
                                    <span className="text-sm text-white/40 font-normal ml-2 tracking-normal">{rate.unit}</span>
                                 </p>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// --- Features Section (Big Cards) ---
function FeaturesSection() {
    const navigate = useNavigate();

    const features = [
        { 
            title: "VIRTUAL\nTRY - ON", 
            action: () => console.log("Navigate to Try-On"),
            gradient: "from-[#00d2ff] via-[#3a7bd5] to-[#00d2ff]" 
        },
        { 
            title: "DESIGN TO\nCAD", 
            action: () => console.log("Navigate to Design to CAD"),
            gradient: "from-[#9D50BB] via-[#6E48AA] to-[#9D50BB]"
        },
        { 
            title: "MARKET PLACE", 
            action: () => navigate('/buyer'),
            gradient: "from-[#FFD700] via-[#FDB931] to-[#FFD700]"
        },
    ];

    return (
        <section className="bg-[#051024] py-32 px-4 relative overflow-hidden">
             <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[128px] pointer-events-none"></div>
             <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-[128px] pointer-events-none"></div>

            <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl relative z-10">
                {features.map((feature, idx) => (
                    <div 
                        key={feature.title} 
                        onClick={feature.action}
                        className="group relative h-[400px] md:h-[500px] w-full rounded-xl overflow-hidden cursor-pointer"
                    >
                        {/* Animated Rotating Border */}
                        <div className={`absolute inset-[-50%] bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 animate-[spin_4s_linear_infinite] transition-opacity duration-500`}></div>
                        
                        {/* Card Content */}
                        <div className="absolute inset-[2px] bg-[#0a192f] rounded-xl flex flex-col justify-between p-10 z-10 border border-white/10 group-hover:border-transparent transition-colors">
                            
                            {/* Inner Glow */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-xl`}></div>
                            
                            {/* Title */}
                            <div className="relative z-20 flex-grow flex items-center justify-center">
                                <h2 className="text-3xl md:text-5xl font-extralight tracking-widest text-white text-center whitespace-pre-line leading-tight group-hover:text-brand-yellow transition-colors duration-500 drop-shadow-lg">
                                    {feature.title}
                                </h2>
                            </div>
                            
                            {/* Bottom Corner Arrow */}
                            <div className="relative z-20 flex justify-end pt-6">
                                <div className="p-3 rounded-full border border-white/20 group-hover:bg-white/10 group-hover:border-brand-yellow transition-all duration-300">
                                    <ArrowUpRight className="h-6 w-6 text-white group-hover:text-brand-yellow transition-colors duration-300" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
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
                <RatesSection />
                <FeaturesSection />
                <ContactSection />
            </main>
            <Footer />
        </div>
    );
}