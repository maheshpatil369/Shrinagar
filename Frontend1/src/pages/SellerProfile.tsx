// maheshpatil369/shrinagar/Shrinagar-c908f2c7ebd73d867e2e79166bd07d6874cca960/Frontend1/src/pages/SellerProfile.tsx
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Seller, enrollSeller, uploadVerificationDocument } from "@/lib/seller";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, LoaderCircle, Upload, CheckCircle, XCircle, ShieldAlert, ExternalLink } from "lucide-react";

// CORRECTED: Added document fields to the schema and made them required.
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
  gstCertificate: z.string().min(1, "GST Certificate is required."),
  panCard: z.string().min(1, "PAN Card is required."),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface SellerProfileProps {
  seller: Seller | null;
  onProfileUpdate: () => void;
}

export default function SellerProfile({ seller, onProfileUpdate }: SellerProfileProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState<'gst' | 'pan' | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: "",
      gstNumber: "",
      panNumber: "",
      address: { street: "", city: "", state: "", pincode: "" },
      gstCertificate: "",
      panCard: "",
    },
  });

  useEffect(() => {
    if (seller) {
      form.reset({
        businessName: seller.businessName || "",
        gstNumber: seller.gstNumber || "",
        panNumber: seller.panNumber || "",
        address: seller.address || { street: "", city: "", state: "", pincode: "" },
        gstCertificate: seller.verificationDocuments?.gstCertificate || '',
        panCard: seller.verificationDocuments?.panCard || '',
      });
    }
  }, [seller, form]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'gst' | 'pan') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setIsUploading(type);

    try {
        const data = await uploadVerificationDocument(formData);
        if (type === 'gst') {
            form.setValue('gstCertificate', data.image, { shouldValidate: true });
        } else {
            form.setValue('panCard', data.image, { shouldValidate: true });
        }
        toast({ title: "Success", description: `${type.toUpperCase()} document uploaded.` });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Upload Error", description: error?.response?.data?.message || "Failed to upload document." });
    } finally {
        setIsUploading(null);
        if(e.target) e.target.value = '';
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const payload: Omit<Seller, "status" | "_id" | "user" | "rating"> = {
        businessName: data.businessName,
        gstNumber: data.gstNumber,
        panNumber: data.panNumber,
        address: {
          street: data.address.street ?? "",
          city: data.address.city ?? "",
          state: data.address.state ?? "",
          pincode: data.address.pincode ?? "",
        },
        verificationDocuments: {
          gstCertificate: data.gstCertificate,
          panCard: data.panCard,
        },
      };
      await enrollSeller(payload);
      toast({ title: "Profile Submitted", description: "Your seller profile has been submitted for verification." });
      onProfileUpdate();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: error?.response?.data?.message || "Could not submit your profile." });
    }
  };
  
  const isApproved = seller && seller.status === 'approved';

  if (isApproved) {
     return (
        <Card>
            <CardHeader>
                <CardTitle>Your Professional Profile</CardTitle>
                <CardDescription>Status: <Badge className="capitalize bg-green-600 text-white">{seller.status}</Badge></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                 {/* ... (Display logic remains the same) ... */}
            </CardContent>
        </Card>
     )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{seller ? 'Update Your Seller Profile' : 'Complete Your Seller Profile'}</CardTitle>
        <CardDescription>Provide your business details for verification. Your profile is currently {seller ? `in '${seller.status}' state.` : 'not submitted.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* ... (Other form fields remain the same) ... */}
            <FormField control={form.control} name="businessName" render={({ field }) => (<FormItem><FormLabel>Business Name</FormLabel><FormControl><Input placeholder="e.g., Elegant Gems Inc." {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="gstNumber" render={({ field }) => (<FormItem><FormLabel>GST Number</FormLabel><FormControl><Input placeholder="15-digit GSTIN" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="panNumber" render={({ field }) => (<FormItem><FormLabel>PAN Number</FormLabel><FormControl><Input placeholder="10-digit PAN" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            <FormField control={form.control} name="address.street" render={({ field }) => (<FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="123 Diamond Lane" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="address.city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Jaipur" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="address.state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="Rajasthan" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="address.pincode" render={({ field }) => (<FormItem><FormLabel>Pincode</FormLabel><FormControl><Input placeholder="302001" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
            
            <CardDescription>Identity Verification Documents (Compulsory)</CardDescription>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="gstCertificate" render={({ field }) => (
                <FormItem>
                    <FormLabel>GST Certificate</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-2">
                             <Input type="file" id="gst-file-upload" accept="image/*" onChange={(e) => handleFileUpload(e, 'gst')} className="hidden"/>
                            <Button type="button" variant="outline" onClick={() => document.getElementById('gst-file-upload')?.click()} disabled={!!isUploading} className="w-full justify-start text-left font-normal">
                                {isUploading === 'gst' ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                {field.value ? 'Change file...' : 'Upload GST Certificate'}
                            </Button>
                        </div>
                    </FormControl>
                    {field.value && <div className="flex items-center text-sm text-green-400 pt-2"><CheckCircle className="h-4 w-4 mr-2"/> Document ready. <a href={field.value} target="_blank" rel="noopener noreferrer" className="ml-2 underline hover:text-green-300">View</a></div>}
                    <FormMessage />
                </FormItem>
                )} />

                <FormField control={form.control} name="panCard" render={({ field }) => (
                <FormItem>
                    <FormLabel>PAN Card</FormLabel>
                    <FormControl>
                        <div className="flex items-center gap-2">
                            <Input type="file" id="pan-file-upload" accept="image/*" onChange={(e) => handleFileUpload(e, 'pan')} className="hidden" />
                            <Button type="button" variant="outline" onClick={() => document.getElementById('pan-file-upload')?.click()} disabled={!!isUploading} className="w-full justify-start text-left font-normal">
                                {isUploading === 'pan' ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                {field.value ? 'Change file...' : 'Upload PAN Card'}
                            </Button>
                        </div>
                    </FormControl>
                    {field.value && <div className="flex items-center text-sm text-green-400 pt-2"><CheckCircle className="h-4 w-4 mr-2"/> Document ready. <a href={field.value} target="_blank" rel="noopener noreferrer" className="ml-2 underline hover:text-green-300">View</a></div>}
                    <FormMessage />
                </FormItem>
                )} />
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

