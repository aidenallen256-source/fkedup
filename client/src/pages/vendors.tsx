import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { isUnauthorizedError } from "../lib/authUtils";
import { apiRequest } from "../lib/queryClient";
import MainLayout from "../components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Skeleton } from "../components/ui/skeleton";
import TransactionTable from "../components/tables/transaction-table";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function Vendors() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    vatNumber: "",
    address: "",
    phone: "",
    email: "",
    paymentTerms: "",
  });

  const { data: vendors, isLoading, error } = useQuery({
    queryKey: ["/api/vendors"],
    enabled: isAuthenticated,
  });

  const createVendorMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/vendors", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Vendor created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create vendor",
        variant: "destructive",
      });
    },
  });

  const updateVendorMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", `/api/vendors/${editingVendor.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Vendor updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update vendor",
        variant: "destructive",
      });
    },
  });

  const deleteVendorMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/vendors/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Vendor deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to delete vendor",
        variant: "destructive",
      });
    },
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [error, toast]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const resetForm = () => {
    setFormData({
      name: "",
      vatNumber: "",
      address: "",
      phone: "",
      email: "",
      paymentTerms: "",
    });
    setEditingVendor(null);
  };

  const handleEdit = (vendor: any) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name || "",
      vatNumber: vendor.vatNumber || "",
      address: vendor.address || "",
      phone: vendor.phone || "",
      email: vendor.email || "",
      paymentTerms: vendor.paymentTerms || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (vendor: any) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      deleteVendorMutation.mutate(vendor.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVendor) {
      updateVendorMutation.mutate(formData);
    } else {
      createVendorMutation.mutate(formData);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "vatNumber", label: "VAT Number" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "paymentTerms", label: "Payment Terms" },
    { key: "actions", label: "Actions", align: "center" as const },
  ];

  // Add actions to vendor data
  const vendorsWithActions = vendors?.map((vendor: any) => ({
    ...vendor,
    actions: (
      <div className="flex justify-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(vendor)}
          data-testid={`button-edit-vendor-${vendor.id}`}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDelete(vendor)}
          data-testid={`button-delete-vendor-${vendor.id}`}
          className="text-destructive hover:text-destructive/80"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  }));

  return (
    <MainLayout
      title="Vendor Management"
      subtitle="Manage supplier information and VAT details"
    >
      <div className="space-y-6">
        {/* Header with Add Button */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Vendors</span>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} data-testid="button-add-vendor">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vendor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingVendor ? "Edit Vendor" : "Add Vendor"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        data-testid="input-vendor-name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="vatNumber">VAT Number</Label>
                      <Input
                        id="vatNumber"
                        value={formData.vatNumber}
                        onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })}
                        data-testid="input-vendor-vat"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        data-testid="input-vendor-address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        data-testid="input-vendor-phone"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        data-testid="input-vendor-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentTerms">Payment Terms</Label>
                      <Input
                        id="paymentTerms"
                        value={formData.paymentTerms}
                        onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                        data-testid="input-vendor-payment-terms"
                        placeholder="e.g., Net 30 days"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createVendorMutation.isPending || updateVendorMutation.isPending}
                        data-testid="button-save-vendor"
                      >
                        {editingVendor ? "Update" : "Create"} Vendor
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Vendors Table */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <TransactionTable
                columns={columns}
                data={vendorsWithActions || []}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
