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

export default function PurchaseLedger() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedVendor, setSelectedVendor] = useState("");

  const { data: purchases, isLoading: purchasesLoading, error } = useQuery({
    queryKey: ["/api/purchases"],
    enabled: isAuthenticated,
  });

  const { data: vendors } = useQuery({
    queryKey: ["/api/vendors"],
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

  // Filter purchases by vendor if selected
  const filteredPurchases = selectedVendor 
    ? purchases?.filter((purchase: any) => purchase.vendorId === selectedVendor)
    : purchases;

  // Calculate summary statistics
  const totalPurchases = filteredPurchases?.reduce((sum: number, purchase: any) => 
    sum + Number(purchase.totalAmount || 0), 0) || 0;
  
  const totalExcise = filteredPurchases?.reduce((sum: number, purchase: any) => 
    sum + Number(purchase.exciseAmount || 0), 0) || 0;
  
  const totalCredit = filteredPurchases?.filter((purchase: any) => 
    purchase.paymentStatus === "pending").reduce((sum: number, purchase: any) => 
    sum + Number(purchase.totalAmount || 0), 0) || 0;
  
  const totalDiscounts = filteredPurchases?.reduce((sum: number, purchase: any) => 
    sum + Number(purchase.discountAmount || 0), 0) || 0;

  const handleExport = () => {
    toast({
      title: "Export",
      description: "Export functionality would be implemented here",
    });
  };

  const columns = [
    { key: "purchaseDate", label: "Date" },
    { key: "billNumber", label: "Bill No." },
    { key: "vendorName", label: "Vendor" },
    { key: "subtotal", label: "Gross Amount", align: "right" as const },
    { key: "discountAmount", label: "Discount", align: "right" as const },
    { key: "exciseAmount", label: "Excise", align: "right" as const },
    { key: "vatAmount", label: "VAT", align: "right" as const },
    { key: "totalAmount", label: "Net Amount", align: "right" as const },
    { key: "paymentStatus", label: "Status", align: "center" as const },
  ];

  return (
    <MainLayout
      title="Purchase Ledger"
      subtitle="Complete purchase transaction history"
    >
      <div className="space-y-6">
        {/* Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Purchase Ledger</span>
              <div className="flex space-x-2">
                <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                  <SelectTrigger className="w-48" data-testid="select-vendor-filter">
                    <SelectValue placeholder="All Vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Vendors</SelectItem>
                    {vendors?.map((vendor: any) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
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

        {/* Purchase Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-blue-800">Total Purchases</h4>
              <p className="text-xl font-bold text-blue-900" data-testid="text-total-purchases">
                Rs. {totalPurchases.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-amber-800">Total Excise</h4>
              <p className="text-xl font-bold text-amber-900" data-testid="text-total-excise">
                Rs. {totalExcise.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-green-800">Vendor Credit</h4>
              <p className="text-xl font-bold text-green-900" data-testid="text-vendor-credit">
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
        </div>

        {/* Purchase Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {purchasesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <TransactionTable
                columns={columns}
                data={filteredPurchases || []}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
