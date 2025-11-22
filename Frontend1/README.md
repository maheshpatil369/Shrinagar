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
















