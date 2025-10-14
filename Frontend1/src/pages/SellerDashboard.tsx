import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentUser, logout } from "@/lib/auth";
import { getJewelryItems, addJewelryItem, deleteJewelryItem, type JewelryItem } from "@/lib/mockData";
import { LogOut, Plus, Trash2, Eye, MousePointerClick } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<JewelryItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const user = getCurrentUser();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "ring" as JewelryItem['category'],
    brand: "",
    image: "",
    affiliateUrl: "",
  });

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/auth');
      return;
    }
    
    loadItems();
  }, [user, navigate]);

  const loadItems = () => {
    const allItems = getJewelryItems().filter(item => item.sellerId === user?.id || item.sellerId.startsWith('seller'));
    setItems(allItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addJewelryItem({
      ...formData,
      price: parseFloat(formData.price),
      sellerId: user?.id || 'seller1',
      approved: false,
    });

    toast({
      title: "Item added!",
      description: "Your item is pending admin approval",
    });

    setFormData({
      name: "",
      description: "",
      price: "",
      category: "ring",
      brand: "",
      image: "",
      affiliateUrl: "",
    });
    setShowAddForm(false);
    loadItems();
  };

  const handleDelete = (id: string) => {
    deleteJewelryItem(id);
    toast({ title: "Item deleted" });
    loadItems();
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
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
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
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-bold">My Listings</h2>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-accent hover:bg-accent/90">
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Jewelry Item</CardTitle>
              <CardDescription>Fill in the details for your jewelry piece</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ring">Ring</SelectItem>
                        <SelectItem value="necklace">Necklace</SelectItem>
                        <SelectItem value="bracelet">Bracelet</SelectItem>
                        <SelectItem value="earrings">Earrings</SelectItem>
                        <SelectItem value="watch">Watch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="affiliateUrl">Affiliate URL</Label>
                    <Input
                      id="affiliateUrl"
                      type="url"
                      value={formData.affiliateUrl}
                      onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button type="submit" className="bg-accent hover:bg-accent/90">Add Item</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div 
                className="h-48 bg-muted bg-cover bg-center"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>${item.price.toLocaleString()}</CardDescription>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${item.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {item.approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{item.views} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MousePointerClick className="w-4 h-4" />
                    <span>{item.clicks} clicks</span>
                  </div>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items yet. Add your first jewelry piece!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerDashboard;
