// src/pages/customers.tsx
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { apiRequest } from "../lib/api";
import TransactionTable from "../components/tables/transaction-table";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function CustomersPage() {
  const [isAuthenticated] = useState(true);
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    vatNumber: "",
    address: "",
    phone: "",
    email: "",
    creditLimit: "0",
  });

  const { data: customers, isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/customers"],
    queryFn: async () => apiRequest("GET", "/api/customers"),
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/customers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/customers/${editingCustomer.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE" as any, `/api/customers/${id}` as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/customers"] }),
  });

  const resetForm = () => {
    setFormData({ name: "", vatNumber: "", address: "", phone: "", email: "", creditLimit: "0" });
    setEditingCustomer(null);
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || "",
      vatNumber: customer.vatNumber || "",
      address: customer.address || "",
      phone: customer.phone || "",
      email: customer.email || "",
      creditLimit: String(customer.creditLimit ?? "0"),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (customer: any) => {
    if (confirm("Delete this customer?")) deleteMutation.mutate(customer.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, creditLimit: parseFloat(formData.creditLimit).toString() };
    if (editingCustomer) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading customers</p>;

  const columns = [
    { key: "name", label: "Name" },
    { key: "vatNumber", label: "VAT Number" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "creditLimit", label: "Credit Limit", align: "right" as const },
    { key: "actions", label: "Actions", align: "center" as const },
  ];

  const customersWithActions = customers?.map((customer: any) => ({
    ...customer,
    actions: (
      <div className="flex justify-center space-x-2">
        <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(customer)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  }));

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Customers</span>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vatNumber">VAT Number</Label>
                      <Input id="vatNumber" value={formData.vatNumber} onChange={(e) => setFormData({ ...formData, vatNumber: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="creditLimit">Credit Limit</Label>
                    <Input id="creditLimit" type="number" step="0.01" value={formData.creditLimit} onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })} />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>{editingCustomer ? "Update" : "Create"} Customer</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTable columns={columns} data={customersWithActions || []} />
        </CardContent>
      </Card>
    </div>
  );
}
