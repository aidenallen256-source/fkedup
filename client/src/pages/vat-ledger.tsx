import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/use-toast";
import { isUnauthorizedError } from "../lib/authUtils";
import MainLayout from "../components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Skeleton } from "../components/ui/skeleton";
import TransactionTable from "../components/tables/transaction-table";
import { Filter } from "lucide-react";

export default function VatLedger() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: vatEntries, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/vat-ledger", fromDate, toDate],
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

  // Calculate VAT summary
  const vatCollected = vatEntries?.filter((entry: any) => entry.entryType === "sales_output")
    .reduce((sum: number, entry: any) => sum + Number(entry.vatAmount || 0), 0) || 0;
  
  const vatPaid = vatEntries?.filter((entry: any) => entry.entryType === "purchase_input")
    .reduce((sum: number, entry: any) => sum + Number(entry.vatAmount || 0), 0) || 0;
  
  const vatPayable = vatCollected - vatPaid;

  const handleFilter = () => {
    refetch();
  };

  const columns = [
    { key: "entryDate", label: "Date" },
    { key: "entryType", label: "Type" },
    { key: "referenceNumber", label: "Reference" },
    { key: "partyName", label: "Party" },
    { key: "partyVatNumber", label: "VAT Number" },
    { key: "taxableAmount", label: "Taxable Amount", align: "right" as const },
    { key: "vatAmount", label: "VAT Amount", align: "right" as const },
    { key: "status", label: "Status", align: "center" as const },
  ];

  return (
    <MainLayout
      title="VAT Ledger"
      subtitle="13% VAT tracking for Nepal compliance"
    >
      <div className="space-y-6">
        {/* Filter Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>VAT Ledger (13% - Nepal Rules)</span>
              <div className="flex space-x-2">
                <div>
                  <Label htmlFor="fromDate" className="sr-only">From Date</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    data-testid="input-from-date"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="toDate" className="sr-only">To Date</Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    data-testid="input-to-date"
                    className="text-sm"
                  />
                </div>
                <Button onClick={handleFilter} data-testid="button-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* VAT Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-green-800">VAT Collected (Output)</h4>
              <p className="text-xl font-bold text-green-900" data-testid="text-vat-collected">
                Rs. {vatCollected.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-blue-800">VAT Paid (Input)</h4>
              <p className="text-xl font-bold text-blue-900" data-testid="text-vat-paid">
                Rs. {vatPaid.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium text-amber-800">VAT Payable</h4>
              <p className="text-xl font-bold text-amber-900" data-testid="text-vat-payable">
                Rs. {vatPayable.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* VAT Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>VAT Transactions</CardTitle>
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
                data={vatEntries || []}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
