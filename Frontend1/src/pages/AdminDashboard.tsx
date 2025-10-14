import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser, logout } from "@/lib/auth";
import { getJewelryItems, updateJewelryItem, deleteJewelryItem, type JewelryItem } from "@/lib/mockData";
import { LogOut, Check, X, Trash2, Eye, MousePointerClick } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<JewelryItem[]>([]);
  const user = getCurrentUser();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/auth');
      return;
    }
    
    loadItems();
  }, [user, navigate]);

  const loadItems = () => {
    setItems(getJewelryItems());
  };

  const handleApprove = (id: string) => {
    updateJewelryItem(id, { approved: true });
    toast({ title: "Item approved" });
    loadItems();
  };

  const handleReject = (id: string) => {
    deleteJewelryItem(id);
    toast({ title: "Item rejected and deleted" });
    loadItems();
  };

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out successfully" });
    navigate('/auth');
  };

  const pendingItems = items.filter(item => !item.approved);
  const approvedItems = items.filter(item => item.approved);
  const totalViews = items.reduce((sum, item) => sum + item.views, 0);
  const totalClicks = items.reduce((sum, item) => sum + item.clicks, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
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
        {/* Analytics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{items.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">{pendingItems.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalViews}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalClicks}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Approval ({pendingItems.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div 
                    className="h-48 bg-muted bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <CardHeader>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>
                      {item.brand} • ${item.price.toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(item.id)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleReject(item.id)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {pendingItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No pending items</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <div 
                    className="h-48 bg-muted bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <CardHeader>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>
                      {item.brand} • ${item.price.toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{item.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MousePointerClick className="w-4 h-4" />
                        <span>{item.clicks}</span>
                      </div>
                    </div>
                    <Button 
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() => handleReject(item.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            {approvedItems.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No approved items</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
