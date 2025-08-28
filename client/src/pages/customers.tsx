// src/pages/customers.tsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { apiRequest } from "../lib/api";
import TransactionTable from "../components/tables/transaction-table";

export default function CustomersPage() {
  const [isAuthenticated] = useState(true);

  const { data: customers, isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/customers"],
    queryFn: async () => apiRequest("GET", "/api/customers"),
    enabled: isAuthenticated,
  });

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
        <Button>Edit</Button>
        <Button variant="destructive">Delete</Button>
      </div>
    ),
  }));

  return (
    <div className="p-4">
      <Card>
        <CardContent>
          <h1 className="text-xl font-bold mb-4">Customers</h1>
          <TransactionTable columns={columns} data={customersWithActions || []} />
        </CardContent>
      </Card>
    </div>
  );
}
