import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/api";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import TransactionTable from "@/components/tables/transaction-table";
import { Plus, Edit, AlertTriangle } from "lucide-react";

export default function Items() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    costPrice: "",
    sellingPrice: "",
    wholesalePrice: "",
    stockQuantity: "",
    minStockLevel: "",
    unit: "pcs",
  });

  const { data: items, isLoading, error } = useQuery({
    queryKey: ["/api/items"],
    enabled: isAuthenticated,
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/items", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
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
        description: "Failed to create item",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("PUT", `/api/items/${editingItem.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
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
        description: "Failed to update item",
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
      category: "",
      costPrice: "",
      sellingPrice: "",
      wholesalePrice: "",
      stockQuantity: "",
      minStockLevel: "",
      unit: "pcs",
    });
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || "",
      category: item.category || "",
      costPrice: item.costPrice || "",
      sellingPrice: item.sellingPrice || "",
      wholesalePrice: item.wholesalePrice || "",
      stockQuantity: item.stockQuantity?.toString() || "",
      minStockLevel: item.minStockLevel?.toString() || "",
      unit: item.unit || "pcs",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      costPrice: parseFloat(formData.costPrice).toString(),
      sellingPrice: parseFloat(formData.sellingPrice).toString(),
      wholesalePrice: formData.wholesalePrice ? parseFloat(formData.wholesalePrice).toString() : null,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      minStockLevel: parseInt(formData.minStockLevel) || 0,
    };
    
    if (editingItem) {
      updateItemMutation.mutate(submitData);
    } else {
      createItemMutation.mutate(submitData);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "costPrice", label: "Cost Price", align: "right" as const },
    { key: "sellingPrice", label: "Selling Price", align: "right" as const },
    { key: "stockQuantity", label: "Stock", align: "right" as const },
    { key: "unit", label: "Unit" },
    { key: "status", label: "Status", align: "center" as const },
    { key: "actions", label: "Actions", align: "center" as const },
  ];

  // Add status and actions to item data
  const itemsWithActions = items?.map((item: any) => ({
    ...item,
    status: item.stockQuantity <= item.minStockLevel ? (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="w-3 h-3 mr-1" />
        Low Stock
      </Badge>
    ) : (
      <Badge variant="default" className="text-xs">
        In Stock
      </Badge>
    ),
    actions: (
      <div className="flex justify-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleEdit(item)}
          data-testid={`button-edit-item-${item.id}`}
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
    ),
  }));

  return (
    <MainLayout
      title="Item Management"
      subtitle="Product catalog with pricing tiers"
    >
      <div className="space-y-6">
        {/* Header with Add Button */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Items</span>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} data-testid="button-add-item">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? "Edit Item" : "Add Item"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          data-testid="input-item-name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          data-testid="input-item-category"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="costPrice">Cost Price (Rs.) *</Label>
                        <Input
                          id="costPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.costPrice}
                          onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                          data-testid="input-item-cost-price"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="sellingPrice">Selling Price (Rs.) *</Label>
                        <Input
                          id="sellingPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.sellingPrice}
                          onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                          data-testid="input-item-selling-price"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="wholesalePrice">Wholesale Price (Rs.)</Label>
                        <Input
                          id="wholesalePrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.wholesalePrice}
                          onChange={(e) => setFormData({ ...formData, wholesalePrice: e.target.value })}
                          data-testid="input-item-wholesale-price"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="stockQuantity">Stock Quantity</Label>
                        <Input
                          id="stockQuantity"
                          type="number"
                          min="0"
                          value={formData.stockQuantity}
                          onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                          data-testid="input-item-stock-quantity"
                        />
                      </div>
                      <div>
                        <Label htmlFor="minStockLevel">Min Stock Level</Label>
                        <Input
                          id="minStockLevel"
                          type="number"
                          min="0"
                          value={formData.minStockLevel}
                          onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                          data-testid="input-item-min-stock"
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit">Unit</Label>
                        <Input
                          id="unit"
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          data-testid="input-item-unit"
                          placeholder="pcs, kg, ltr, etc."
                        />
                      </div>
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
                        disabled={createItemMutation.isPending || updateItemMutation.isPending}
                        data-testid="button-save-item"
                      >
                        {editingItem ? "Update" : "Create"} Item
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Item List</CardTitle>
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
                data={itemsWithActions || []}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
