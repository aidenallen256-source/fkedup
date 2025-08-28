import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Upload, FileSpreadsheet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/layout/main-layout";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertItemSchema, type Item, type InsertItem } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const itemFormSchema = insertItemSchema.extend({
  costPrice: insertItemSchema.shape.costPrice.transform((val) => val.toString()),
  sellingPrice: insertItemSchema.shape.sellingPrice.transform((val) => val.toString()),
  wholesalePrice: insertItemSchema.shape.wholesalePrice.optional().transform((val) => val?.toString() || ""),
});

export default function Items() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["/api/items"],
  });

  const form = useForm<InsertItem>({
    resolver: zodResolver(insertItemSchema),
    defaultValues: {
      name: "",
      category: "",
      brand: "",
      costPrice: "0",
      sellingPrice: "0",
      wholesalePrice: "0",
      unit: "pcs",
      stockQuantity: 0,
      openingQuantity: 0,
      minStockLevel: 5,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertItem) => {
      const response = await apiRequest("POST", "/api/items", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Item created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertItem> }) => {
      const response = await apiRequest("PUT", `/api/items/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      form.reset();
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/items/import', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      toast({
        title: "Import Successful",
        description: `${result.imported} out of ${result.total} items imported successfully`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: InsertItem) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    form.reset({
      ...item,
      costPrice: item.costPrice.toString(),
      sellingPrice: item.sellingPrice.toString(),
      wholesalePrice: item.wholesalePrice?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
    }
  };

  const downloadTemplate = () => {
    const template = `SN,Product Name,Category,Brand,CP,SP,Wholesale,Unit,Opening Quantity
1,Sample Product,Electronics,Samsung,100,150,130,pcs,50
2,Another Product,Clothing,Nike,80,120,100,pcs,25`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'items_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredItems = Array.isArray(items) ? items.filter((item: Item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Items Management</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <CardTitle>Items Inventory</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  onClick={downloadTemplate}
                  data-testid="button-download-template"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importMutation.isPending}
                  data-testid="button-import-excel"
                >
                  {importMutation.isPending ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Import Excel
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingItem(null);
                      form.reset();
                    }} data-testid="button-add-item">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingItem ? "Edit Item" : "Add New Item"}
                      </DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Name *</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-product-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-category" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Brand</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-brand" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="unit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-unit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="costPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cost Price (CP) *</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    step="0.01"
                                    data-testid="input-cost-price" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="sellingPrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Selling Price (SP) *</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    step="0.01"
                                    data-testid="input-selling-price" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="wholesalePrice"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Wholesale Price</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    step="0.01"
                                    data-testid="input-wholesale-price" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="openingQuantity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Opening Quantity</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number"
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    data-testid="input-opening-quantity" 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
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
                            disabled={createMutation.isPending || updateMutation.isPending}
                            data-testid="button-save-item"
                          >
                            {editingItem ? "Update" : "Create"} Item
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items by name, category, or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                  data-testid="input-search"
                />
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SN</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>CP</TableHead>
                      <TableHead>SP</TableHead>
                      <TableHead>Wholesale</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Opening Qty</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center">
                          Loading items...
                        </TableCell>
                      </TableRow>
                    ) : filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center">
                          No items found. Add your first item or import from Excel.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item: Item, index: number) => (
                        <TableRow key={item.id} data-testid={`row-item-${index}`}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category || "-"}</TableCell>
                          <TableCell>{item.brand || "-"}</TableCell>
                          <TableCell>₹{item.costPrice}</TableCell>
                          <TableCell>₹{item.sellingPrice}</TableCell>
                          <TableCell>₹{item.wholesalePrice || "-"}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{item.openingQuantity || 0}</TableCell>
                          <TableCell>{item.stockQuantity}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(item)}
                                data-testid={`button-edit-${index}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteMutation.mutate(item.id)}
                                data-testid={`button-delete-${index}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}