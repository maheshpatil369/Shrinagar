// maheshpatil369/shrinagar/Shrinagar-47183708fc2b865cb6e3d62f63fcad35ec0165db/Frontend1/src/pages/SellerProfile.tsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Seller, enrollSeller, uploadVerificationDocument } from "../lib/seller";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, LoaderCircle, Upload, CheckCircle, XCircle, ShieldAlert } from "lucide-react";

const profileSchema = z.object({
  businessName: z.string().min(3, "Business name is required"),
  gstNumber: z.string().length(15, "GST Number must be 15 characters"),
  panNumber: z.string().length(10, "PAN Number must be 10 characters"),
  address: z.object({
    street: z.string().min(5, "Street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    pincode: z.string().length(6, "Pincode must be 6 digits"),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface SellerProfileProps {
  seller: Seller | null;
  onProfileUpdate: () => void;
}

export default function SellerProfile({ seller, onProfileUpdate }: SellerProfileProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState<'gst' | 'pan' | null>(null);
  const [gstFileUrl, setGstFileUrl] = useState('');
  const [panFileUrl, setPanFileUrl] = useState('');

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: "",
      gstNumber: "",
      panNumber: "",
      address: { street: "", city: "", state: "", pincode: "" },
    },
  });

  useEffect(() => {
    if (seller) {
      form.reset({
        businessName: seller.businessName || "",
        gstNumber: seller.gstNumber || "",
        panNumber: seller.panNumber || "",
        address: {
          street: seller.address?.street || "",
          city: seller.address?.city || "",
          state: seller.address?.state || "",
          pincode: seller.address?.pincode || "",
        },
      });
      setGstFileUrl(seller.verificationDocuments?.gstCertificate || '');
      setPanFileUrl(seller.verificationDocuments?.panCard || '');
    }
  }, [seller, form.reset]);


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'gst' | 'pan') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setIsUploading(type);

    try {
        const data = await uploadVerificationDocument(formData);
        if (type === 'gst') {
            setGstFileUrl(data.image);
        } else {
            setPanFileUrl(data.image);
        }
        toast({
            title: "Success",
            description: `${type.toUpperCase()} document uploaded.`,
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Upload Error",
            description: error?.response?.data?.message || "Failed to upload document.",
        });
    } finally {
        setIsUploading(null);
        if(e.target) e.target.value = '';
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const payload = {
          businessName: data.businessName,
          gstNumber: data.gstNumber,
          panNumber: data.panNumber,
          address: {
              street: data.address.street,
              city: data.address.city,
              state: data.address.state,
              pincode: data.address.pincode,
          },
          verificationDocuments: {
              gstCertificate: gstFileUrl,
              panCard: panFileUrl,
          }
      };
      await enrollSeller(payload);
      toast({
        title: "Profile Submitted",
        description: "Your seller profile has been submitted for verification.",
      });
      onProfileUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error?.response?.data?.message || "Could not submit your profile.",
      });
    }
  };
  
  const isApproved = seller && seller.status === 'approved';

  if (isApproved) {
     return (
        <Card>
            <CardHeader>
                <CardTitle>Your Professional Profile</CardTitle>
                <CardDescription>
                  Status: <Badge className="capitalize bg-green-500 hover:bg-green-600">{seller.status}</Badge>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                 <div>
                    <h4 className="font-semibold text-base">Business Name</h4>
                    <p className="text-muted-foreground">{seller.businessName}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-base">GST Number</h4>
                    <p className="text-muted-foreground">{seller.gstNumber}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-base">PAN Number</h4>
                    <p className="text-muted-foreground">{seller.panNumber}</p>
                </div>
                 <div>
                    <h4 className="font-semibold text-base">Address</h4>
                    <p className="text-muted-foreground">{`${seller.address.street}, ${seller.address.city}, ${seller.address.state} - ${seller.address.pincode}`}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-base">Verification Documents</h4>
                  <div className="flex space-x-4 mt-2">
                    {seller.verificationDocuments?.gstCertificate ? <Button variant="link" asChild><a href={seller.verificationDocuments.gstCertificate} target="_blank" rel="noopener noreferrer">View GST Certificate</a></Button> : <p className="text-muted-foreground">GST not uploaded.</p>}
                    {seller.verificationDocuments?.panCard ? <Button variant="link" asChild><a href={seller.verificationDocuments.panCard} target="_blank" rel="noopener noreferrer">View PAN Card</a></Button> : <p className="text-muted-foreground">PAN not uploaded.</p>}
                  </div>
                </div>
            </CardContent>
        </Card>
     )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{seller ? 'Update Your Seller Profile' : 'Complete Your Seller Profile'}</CardTitle>
        <CardDescription>
          Provide your business details for verification. Your profile is currently {seller ? `in '${seller.status}' state.` : 'not submitted.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="businessName" render={({ field }) => (
            <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl><Input placeholder="e.g., Elegant Gems Inc." {...field} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="gstNumber" render={({ field }) => (
                <FormItem>
                    <FormLabel>GST Number</FormLabel>
                    <FormControl><Input placeholder="15-digit GSTIN" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
                 <FormField control={form.control} name="panNumber" render={({ field }) => (
                <FormItem>
                    <FormLabel>PAN Number</FormLabel>
                    <FormControl><Input placeholder="10-digit PAN" {...field} /></FormControl>
                    <FormMessage />
                </FormItem>
                )} />
            </div>

             <FormField control={form.control} name="address.street" render={({ field }) => (
            <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl><Input placeholder="123 Diamond Lane" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
            )} />

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="address.city" render={({ field }) => (
                    <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl><Input placeholder="Jaipur" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="address.state" render={({ field }) => (
                    <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl><Input placeholder="Rajasthan" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="address.pincode" render={({ field }) => (
                    <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl><Input placeholder="302001" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )} />
            </div>
            
            <CardDescription>Identity Verification Documents</CardDescription>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem>
                    <FormLabel>GST Certificate</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-2">
                             <Input
                                type="file"
                                id="gst-file-upload"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileUpload(e, 'gst')}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('gst-file-upload')?.click()}
                                disabled={!!isUploading}
                                className="w-full justify-start text-left font-normal"
                            >
                                {isUploading === 'gst' ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                {gstFileUrl ? 'Change file...' : 'Upload GST Certificate'}
                            </Button>
                        </div>
                    </FormControl>
                    {gstFileUrl && <div className="flex items-center text-sm text-green-600 pt-2"><CheckCircle className="h-4 w-4 mr-2"/> Document Uploaded. <a href={gstFileUrl} target="_blank" rel="noopener noreferrer" className="ml-2 underline">View</a></div>}
                    <FormMessage />
                </FormItem>
                <FormItem>
                    <FormLabel>PAN Card</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                id="pan-file-upload"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileUpload(e, 'pan')}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('pan-file-upload')?.click()}
                                disabled={!!isUploading}
                                className="w-full justify-start text-left font-normal"
                            >
                                {isUploading === 'pan' ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                {panFileUrl ? 'Change file...' : 'Upload PAN Card'}
                            </Button>
                        </div>
                    </FormControl>
                    {panFileUrl && <div className="flex items-center text-sm text-green-600 pt-2"><CheckCircle className="h-4 w-4 mr-2"/> Document Uploaded. <a href={panFileUrl} target="_blank" rel="noopener noreferrer" className="ml-2 underline">View</a></div>}
                    <FormMessage />
                </FormItem>
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? <LoaderCircle className="animate-spin mr-2"/> : null}
                {seller ? 'Update and Resubmit' : 'Submit for Verification'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

