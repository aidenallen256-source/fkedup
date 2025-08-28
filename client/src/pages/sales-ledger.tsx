import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import TransactionTable from "@/components/tables/transaction-table";
import { Download } from "lucide-react";

export default function SalesLedger() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedCustomer, setSelectedCustomer] = useState("");

  const { data: sales, isLoading: salesLoading, error } = useQuery({
    queryKey: ["/api/sales"],
    enabled: isAuthenticated,
  });

  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
    enabled: isAuthenticated,
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

  // Filter sales by customer if selected
  const filteredSales = selectedCustomer 
    ? sales?.filter((sale: any) => sale.customerId === selectedCustomer)
    : sales;

  // Calculate summary statistics
  const totalSales = filteredSales?.reduce((sum: number, sale: any) => 
    sum + Number(sale.totalAmount || 0), 0) || 0;
  
  const totalCredit = filteredSales?.filter((sale: any) => 
    sale.paymentStatus === "credit").reduce((sum: number, sale: any) => 
    sum + Number(sale.totalAmount || 0), 0) || 0;
  
  const totalDiscounts = filteredSales?.reduce((sum: number, sale: any) => 
    sum + Number(sale.discountAmount || 0), 0) || 0;

  // Calculate average margin (simplified - would need cost data for accurate calculation)
  const averageMargin = 42.5; // Placeholder - would calculate from actual cost vs selling price

  const handleExport = () => {
    toast({
      title: "Export",
      description: "Export functionality would be implemented here",
    });
  };

  const columns = [
    { key: "saleDate", label: "Date" },
    { key: "invoiceNumber", label: "Invoice No." },
    { key: "customerName", label: "Customer" },
    { key: "subtotal", label: "Gross Amount", align: "right" as const },
    { key: "discountPercent", label: "Disc %", align: "right" as const },
    { key: "discountAmount", label: "Disc Amount", align: "right" as const },
    { key: "vatAmount", label: "VAT", align: "right" as const },
    { key: "totalAmount", label: "Net Amount", align: "right" as const },
    { key: "paymentStatus", label: "Status", align: "center" as const },
  ];

  return (
    <MainLayout
      title="Sales Ledger"
      subtitle="Sales history with discount tracking"
    >
      <div className="space-y-6">
        {/* Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sales Ledger</span>
              <div className="flex space-x-2">
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger className="w-48" data-testid="select-customer-filter">
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Customers</SelectItem>
                    {customers?.map((customer: any) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleExport} data-testid="button-export">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Sales Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-green-800">Total Sales</h4>
              <p className="text-xl font-bold text-green-900" data-testid="text-total-sales">
                Rs. {totalSales.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-blue-800">Customer Credit</h4>
              <p className="text-xl font-bold text-blue-900" data-testid="text-customer-credit">
                Rs. {totalCredit.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-purple-800">Total Discounts</h4>
              <p className="text-xl font-bold text-purple-900" data-testid="text-total-discounts">
                Rs. {totalDiscounts.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-amber-800">Average Margin</h4>
              <p className="text-xl font-bold text-amber-900" data-testid="text-average-margin">
                {averageMargin}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sales Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <TransactionTable
                columns={columns}
                data={filteredSales || []}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
