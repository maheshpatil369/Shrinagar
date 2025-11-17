// maheshpatil369/shrinagar/Shrinagar-c908f2c7ebd73d867e2e79166bd07d6874cca960/Frontend1/src/pages/SellerProfile.tsx

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Seller, enrollSeller, uploadVerificationDocument } from "@/lib/seller";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Upload, CheckCircle } from "lucide-react";

// Validation schema
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
  const [isUploading, setIsUploading] = useState<"gst" | "pan" | null>(null);

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

  // Prefill existing seller values
  useEffect(() => {
    if (seller) {
      form.reset({
        businessName: seller.businessName || "",
        gstNumber: seller.gstNumber || "",
        panNumber: seller.panNumber || "",
        address: seller.address || {
          street: "",
          city: "",
          state: "",
          pincode: "",
        },
        gstCertificate: seller.verificationDocuments?.gstCertificate || "",
        panCard: seller.verificationDocuments?.panCard || "",
      });
    }
  }, [seller, form]);

  // Upload handler
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "gst" | "pan"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    setIsUploading(type);

    try {
      const data = await uploadVerificationDocument(formData);
      if (type === "gst") {
        form.setValue("gstCertificate", data.image, { shouldValidate: true });
      } else {
        form.setValue("panCard", data.image, { shouldValidate: true });
      }
      toast({
        title: "Success",
        description: `${type.toUpperCase()} document uploaded.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Error",
        description:
          error?.response?.data?.message || "Failed to upload document.",
      });
    } finally {
      setIsUploading(null);
      if (e.target) e.target.value = "";
    }
  };

  // Submit form
  const onSubmit = async (data: ProfileFormData) => {
    try {
      const payload: Omit<Seller, "status" | "_id" | "user" | "rating"> = {
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
          gstCertificate: data.gstCertificate,
          panCard: data.panCard,
        },
      };

      await enrollSeller(payload);
      toast({
        title: "Profile Submitted",
        description:
          "Your seller profile has been submitted for verification.",
      });
      onProfileUpdate();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description:
          error?.response?.data?.message || "Could not submit your profile.",
      });
    }
  };

  const isApproved = seller && seller.status === "approved";

  // Approved UI
  if (isApproved) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Professional Profile</CardTitle>
          <CardDescription>
            Status:{" "}
            <Badge className="capitalize bg-green-600 text-white">
              {seller.status}
            </Badge>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <p><strong>Business Name:</strong> {seller.businessName}</p>
            <p><strong>GST Number:</strong> {seller.gstNumber}</p>
            <p><strong>PAN Number:</strong> {seller.panNumber}</p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">Address:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <p>{seller.address.street}</p>
              <p>{seller.address.city}, {seller.address.state} - {seller.address.pincode}</p>
            </div>
          </div>

          {/* Verified Documents */}
          <div className="space-y-2">
            <p className="font-semibold">Documents:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href={seller.verificationDocuments?.gstCertificate} className="underline text-blue-400" target="_blank">GST Certificate</a>
              <a href={seller.verificationDocuments?.panCard} className="underline text-blue-400" target="_blank">PAN Card</a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --------------------------
  //     FORM SECTION
  // --------------------------
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {seller ? "Update Your Seller Profile" : "Complete Your Seller Profile"}
        </CardTitle>
        <CardDescription>
          Provide your business details for verification. Your profile is currently{" "}
          {seller ? `'${seller.status}'` : "not submitted."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Business Name */}
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Elegant Gems Inc."
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* GST + PAN - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gstNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Number</FormLabel>
                    <FormControl>
                      <Input placeholder="15-digit GSTIN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="panNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN Number</FormLabel>
                    <FormControl>
                      <Input placeholder="10-digit PAN" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Street */}
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Diamond Lane" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City / State / Pincode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Jaipur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="Rajasthan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input placeholder="302001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Document Upload Section */}
            <CardDescription className="pt-2">
              Identity Verification Documents (Compulsory)
            </CardDescription>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* GST Upload */}
              <FormField
                control={form.control}
                name="gstCertificate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GST Certificate</FormLabel>
                    <FormControl>
                      <div className="flex flex-col">
                        <input
                          type="file"
                          id="gst-file-upload"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "gst")}
                          className="hidden"
                        />

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("gst-file-upload")?.click()
                          }
                          disabled={!!isUploading}
                          className="justify-start text-left font-normal"
                        >
                          {isUploading === "gst" ? (
                            <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          {field.value ? "Change file…" : "Upload GST Certificate"}
                        </Button>
                      </div>
                    </FormControl>

                    {field.value && (
                      <div className="flex items-center text-sm text-green-400 pt-2">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Document ready.
                        <a
                          href={field.value}
                          target="_blank"
                          className="ml-2 underline"
                        >
                          View
                        </a>
                      </div>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* PAN Upload */}
              <FormField
                control={form.control}
                name="panCard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PAN Card</FormLabel>
                    <FormControl>
                      <div className="flex flex-col">
                        <input
                          type="file"
                          id="pan-file-upload"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "pan")}
                          className="hidden"
                        />

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("pan-file-upload")?.click()
                          }
                          disabled={!!isUploading}
                          className="justify-start text-left font-normal"
                        >
                          {isUploading === "pan" ? (
                            <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          {field.value ? "Change file…" : "Upload PAN Card"}
                        </Button>
                      </div>
                    </FormControl>

                    {field.value && (
                      <div className="flex items-center text-sm text-green-400 pt-2">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Document ready.
                        <a
                          href={field.value}
                          target="_blank"
                          className="ml-2 underline"
                        >
                          View
                        </a>
                      </div>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full sm:w-auto"
            >
              {form.formState.isSubmitting ? (
                <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {seller ? "Update and Resubmit" : "Submit for Verification"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
