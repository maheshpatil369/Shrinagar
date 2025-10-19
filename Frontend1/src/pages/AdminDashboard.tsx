// maheshpatil369/shrinagar/Shrinagar-c908f2c7ebd73d867e2e79166bd07d6874cca960/Frontend1/src/pages/AdminDashboard.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from 'date-fns';

import { getCurrentUser, logout, User } from "@/lib/auth";
import { Product } from "@/lib/products";
import { Seller } from "@/lib/seller";
import { 
    getAdminDashboardStats,
    getPendingApprovals,
    getSellerDetailsForAdmin,
    updateSellerStatus,
    SellerHistory,
    getSellerHistory
} from "@/lib/admin";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, LoaderCircle, Users, Package, BarChart2, Clock, Eye, CheckCircle, XCircle, ExternalLink, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define a type for the detailed seller view
// Define a type for the detailed seller view
type ViewingSellerDetails = {
    seller: Seller;
    products: Product[];
    history: SellerHistory[];
};

type AdminStats = {
    totalUsers: number;
    totalSellers: number;
    totalProducts: number;
    pendingApprovals: number;
};
export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pending, setPending] = useState<{ sellers: Seller[], products: Product[] }>({ sellers: [], products: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [viewingSellerDetails, setViewingSellerDetails] = useState<ViewingSellerDetails | null>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsData, pendingData] = await Promise.all([
        getAdminDashboardStats(),
        getPendingApprovals(),
      ]);
      setStats(statsData);
      setPending(pendingData);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch admin data." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
      setUser(currentUser);
      fetchData();
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const handleViewSeller = async (sellerId: string) => {
    try {
        const [{ seller, products }, history] = await Promise.all([
            getSellerDetailsForAdmin(sellerId),
            getSellerHistory(sellerId)
        ]);
        setViewingSellerDetails({ seller, products, history });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to fetch seller details." });
    }
  };

  const handleSellerStatusUpdate = async (sellerId: string, status: 'approved' | 'rejected' | 'suspended') => {
    try {
      await updateSellerStatus(sellerId, status);
      toast({ title: "Success", description: `Seller status updated to ${status}.` });
      fetchData(); // Refresh data
      if (viewingSellerDetails?.seller._id === sellerId) setViewingSellerDetails(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update seller status." });
    }
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected':
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading || !user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading Admin Panel...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {user.name}!</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white"><ShieldCheck className="mr-2 h-4 w-4" />Admin Access</Badge>
          <Button onClick={() => logout()} variant="outline">Logout</Button>
        </div>
      </header>
      
      <Tabs defaultValue="approvals">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="mt-6">
            <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader><CardTitle>Pending Seller Applications ({pending.sellers.length})</CardTitle></CardHeader>
                    <CardContent>
                        {pending.sellers.length > 0 ? (
                            <Table>
                                <TableHeader><TableRow><TableHead>Business Name</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {pending.sellers.map(seller => (
                                        <TableRow key={seller._id}>
                                            <TableCell>{seller.businessName}</TableCell>
                                            <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => handleViewSeller(seller._id)}><Eye className="mr-2 h-4 w-4"/>Review</Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : <p className="text-muted-foreground text-sm">No pending seller applications.</p>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Pending Product Listings ({pending.products.length})</CardTitle></CardHeader>
                    <CardContent>
                         {pending.products.length > 0 ? (
                            <Table>
                                <TableHeader><TableRow><TableHead>Product Name</TableHead><TableHead>Seller</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {pending.products.map(product => (
                                        <TableRow key={product._id}>
                                            <TableCell>{product.name}</TableCell>
                                            <TableCell>{(product.seller as any)?.businessName || 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                               {/* Future: Add product review modal */}
                                                <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4"/>Review</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : <p className="text-muted-foreground text-sm">No pending product listings.</p>}
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalUsers}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Sellers</CardTitle><Package className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalSellers}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Products</CardTitle><BarChart2 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalProducts}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Pending Approvals</CardTitle><Clock className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.pendingApprovals}</div></CardContent></Card>
            </div>
        </TabsContent>
      </Tabs>

      {/* Seller Details Dialog */}
       <Dialog open={!!viewingSellerDetails} onOpenChange={() => setViewingSellerDetails(null)}>
        <DialogContent className="sm:max-w-4xl h-[90vh]">
            <DialogHeader>
                <DialogTitle>{viewingSellerDetails?.seller.businessName}</DialogTitle>
                <DialogDescription>
                    Review seller's profile, products, and history. Status: <Badge variant={getStatusBadgeVariant(viewingSellerDetails?.seller.status || '')}>{viewingSellerDetails?.seller.status}</Badge>
                </DialogDescription>
            </DialogHeader>
            {viewingSellerDetails && (
                <Tabs defaultValue="profile" className="h-full flex flex-col">
                    <TabsList>
                        <TabsTrigger value="profile">Profile Details</TabsTrigger>
                        <TabsTrigger value="products">Products ({viewingSellerDetails.products.length})</TabsTrigger>
                        <TabsTrigger value="history">Account History</TabsTrigger>
                    </TabsList>
                    <ScrollArea className="flex-grow mt-4 pr-6">
                        <TabsContent value="profile">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                <div><h4 className="font-semibold">Owner</h4><p className="text-muted-foreground">{viewingSellerDetails.seller.user.name} ({viewingSellerDetails.seller.user.email})</p></div>
                                <div><h4 className="font-semibold">GST Number</h4><p className="text-muted-foreground">{viewingSellerDetails.seller.gstNumber}</p></div>
                                <div><h4 className="font-semibold">PAN Number</h4><p className="text-muted-foreground">{viewingSellerDetails.seller.panNumber}</p></div>
                                <div><h4 className="font-semibold">Address</h4><p className="text-muted-foreground">{`${viewingSellerDetails.seller.address.street}, ${viewingSellerDetails.seller.address.city}, ${viewingSellerDetails.seller.address.state} - ${viewingSellerDetails.seller.address.pincode}`}</p></div>
                                <div className="col-span-full"><h4 className="font-semibold mb-2">Verification Documents</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card>
                                            <CardHeader><CardTitle className="text-base">GST Certificate</CardTitle></CardHeader>
                                            <CardContent>{viewingSellerDetails.seller.verificationDocuments?.gstCertificate ? <img src={viewingSellerDetails.seller.verificationDocuments.gstCertificate} alt="GST Certificate" className="rounded-md border"/> : <p className="text-muted-foreground">Not Provided</p>}</CardContent>
                                        </Card>
                                        <Card>
                                            <CardHeader><CardTitle className="text-base">PAN Card</CardTitle></CardHeader>
                                            <CardContent>{viewingSellerDetails.seller.verificationDocuments?.panCard ? <img src={viewingSellerDetails.seller.verificationDocuments.panCard} alt="PAN Card" className="rounded-md border"/> : <p className="text-muted-foreground">Not Provided</p>}</CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent value="products">
                           <Table>
                                <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {viewingSellerDetails.products.map(p => (
                                        <TableRow key={p._id}>
                                            <TableCell><div className="flex items-center gap-4"><img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-md border"/><span>{p.name}</span></div></TableCell>
                                            <TableCell>${p.price.toFixed(2)}</TableCell>
                                            <TableCell><Badge variant={getStatusBadgeVariant(p.status)}>{p.status}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>
                        <TabsContent value="history">
                            <div className="space-y-4">
                                {viewingSellerDetails.history.map(entry => (
                                    <Card key={entry._id}>
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center justify-between">
                                                <span>{entry.notes || 'Profile Update'}</span>
                                                <span className="text-xs font-normal text-muted-foreground flex items-center gap-2"><History className="h-3 w-3"/>{format(new Date(entry.createdAt), "PPpp")}</span>
                                            </CardTitle>
                                            <CardDescription>Changed by: {entry.changedBy.name} ({entry.changedBy.role})</CardDescription>
                                        </CardHeader>
                                        {entry.changes.length > 0 && (
                                        <CardContent>
                                            <Table>
                                                <TableHeader><TableRow><TableHead>Field</TableHead><TableHead>Old Value</TableHead><TableHead>New Value</TableHead></TableRow></TableHeader>
                                                <TableBody>
                                                    {entry.changes.map((change, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell className="font-medium">{change.field}</TableCell>
                                                            <TableCell className="text-red-400">{change.oldValue}</TableCell>
                                                            <TableCell className="text-green-400">{change.newValue}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </ScrollArea>
                    <div className="flex justify-end gap-2 pt-4 border-t mt-auto">
                        <Button variant="destructive" onClick={() => handleSellerStatusUpdate(viewingSellerDetails.seller._id, 'rejected')}><XCircle className="mr-2 h-4 w-4"/>Reject</Button>
                        <Button variant="secondary" onClick={() => handleSellerStatusUpdate(viewingSellerDetails.seller._id, 'suspended')}><ShieldAlert className="mr-2 h-4 w-4"/>Suspend</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleSellerStatusUpdate(viewingSellerDetails.seller._id, 'approved')}><CheckCircle className="mr-2 h-4 w-4"/>Approve</Button>
                    </div>
                </Tabs>
            )}
        </DialogContent>
       </Dialog>
    </div>
  );
}

