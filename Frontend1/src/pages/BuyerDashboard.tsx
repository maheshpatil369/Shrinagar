import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentUser, logout } from "@/lib/auth";
import { getJewelryItems, updateJewelryItem, type JewelryItem } from "@/lib/mockData";
import { ExternalLink, LogOut, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<JewelryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<JewelryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const user = getCurrentUser();

  useEffect(() => {
    if (!user || user.role !== 'buyer') {
      navigate('/auth');
      return;
    }
    
    const allItems = getJewelryItems().filter(item => item.approved);
    setItems(allItems);
    setFilteredItems(allItems);
  }, [user, navigate]);

  useEffect(() => {
    let filtered = items;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (priceFilter !== 'all') {
      filtered = filtered.filter(item => {
        if (priceFilter === 'under5k') return item.price < 5000;
        if (priceFilter === '5k-10k') return item.price >= 5000 && item.price < 10000;
        if (priceFilter === 'over10k') return item.price >= 10000;
        return true;
      });
    }

    setFilteredItems(filtered);
  }, [searchQuery, categoryFilter, priceFilter, items]);

  const handleViewItem = (item: JewelryItem) => {
    updateJewelryItem(item.id, { views: item.views + 1 });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, views: i.views + 1 } : i));
  };

  const handleClickAffiliate = (item: JewelryItem) => {
    updateJewelryItem(item.id, { clicks: item.clicks + 1 });
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, clicks: i.clicks + 1 } : i));
    window.open(item.affiliateUrl, '_blank');
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out successfully" });
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Jewelry Collection</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search jewelry or brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="ring">Rings</SelectItem>
                <SelectItem value="necklace">Necklaces</SelectItem>
                <SelectItem value="bracelet">Bracelets</SelectItem>
                <SelectItem value="earrings">Earrings</SelectItem>
                <SelectItem value="watch">Watches</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="under5k">Under $5,000</SelectItem>
                <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                <SelectItem value="over10k">Over $10,000</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div 
                className="h-64 bg-muted bg-cover bg-center cursor-pointer"
                style={{ backgroundImage: `url(${item.image})` }}
                onClick={() => handleViewItem(item)}
              />
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.brand}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                <p className="text-2xl font-bold text-accent">${item.price.toLocaleString()}</p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-accent hover:bg-accent/90"
                  onClick={() => handleClickAffiliate(item)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Seller Site
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found matching your criteria</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BuyerDashboard;
