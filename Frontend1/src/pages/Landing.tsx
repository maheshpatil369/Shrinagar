import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Gem, ShoppingBag, Shield, Star } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600)' }}
        />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-foreground">
            Exquisite Jewelry
            <span className="block text-accent mt-2">Curated for You</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Discover timeless pieces from verified sellers worldwide
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-accent hover:bg-accent/90 text-white px-8 py-6 text-lg"
            >
              Explore Collection
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              size="lg"
              variant="outline"
              className="border-2 px-8 py-6 text-lg"
            >
              Become a Seller
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Us</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gem className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Curated Selection</h3>
              <p className="text-muted-foreground">Handpicked jewelry from verified sellers</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Sellers</h3>
              <p className="text-muted-foreground">Every seller is approved by our team</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">Only the finest pieces make it to our platform</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Shopping</h3>
              <p className="text-muted-foreground">Browse, discover, and purchase with ease</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials */}
      <section className="py-16 bg-card border-t">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold mb-6">Demo Credentials</h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-lg mb-3">Buyer Account</h4>
              <p className="text-sm text-muted-foreground mb-1">Email: buyer@demo.com</p>
              <p className="text-sm text-muted-foreground">Password: demo123</p>
            </div>
            <div className="p-6 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-lg mb-3">Seller Account</h4>
              <p className="text-sm text-muted-foreground mb-1">Email: seller@demo.com</p>
              <p className="text-sm text-muted-foreground">Password: demo123</p>
            </div>
            <div className="p-6 bg-muted/30 rounded-lg">
              <h4 className="font-semibold text-lg mb-3">Admin Account</h4>
              <p className="text-sm text-muted-foreground mb-1">Email: admin@demo.com</p>
              <p className="text-sm text-muted-foreground">Password: demo123</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
