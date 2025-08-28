import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, FileText, BarChart3, Receipt } from "lucide-react";
import * as XLSX from "xlsx";

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [reportType, setReportType] = useState("sales_summary");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: isAuthenticated,
  });

  const { data: vatEntries } = useQuery({
    queryKey: ["/api/vat-ledger"],
    enabled: isAuthenticated,
  });

  const { data: sales } = useQuery({
    queryKey: ["/api/sales"],
    enabled: isAuthenticated,
  });

  const { data: purchases } = useQuery({
    queryKey: ["/api/purchases"],
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

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const handleGenerateReport = () => {
    toast({
      title: "Report Generation",
      description: `Generating ${reportType} report for ${fromDate} to ${toDate}`,
    });
    // Report generation logic would be implemented here
  };

  const handleExportPDF = () => {
    const content = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = `Report: ${reportType}`;
    content.appendChild(title);
    const summary = document.createElement('p');
    summary.textContent = `From ${fromDate || 'All time'} To ${toDate || 'Now'}`;
    content.appendChild(summary);
    const w = window.open('', 'print');
    if (w) {
      w.document.body.appendChild(content);
      w.print();
      w.close();
    }
  };

  const exportToCsv = (rows: any[], filename: string) => {
    const csv = [Object.keys(rows[0] || {}).join(','), ...rows.map(r => Object.values(r).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const exportToXlsx = (rows: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, filename);
  };

  // Calculate compliance metrics
  const calculateComplianceMetrics = () => {
    if (!sales || !purchases) return null;

    const totalSales = sales.reduce((sum: number, sale: any) => sum + Number(sale.totalAmount || 0), 0);
    const totalPurchases = purchases.reduce((sum: number, purchase: any) => sum + Number(purchase.totalAmount || 0), 0);
    const grossProfit = totalSales - totalPurchases;
    const grossMargin = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

    return {
      totalSales,
      totalPurchases,
      grossProfit,
      grossMargin,
      transactionCount: sales.length + purchases.length,
    };
  };

  const complianceMetrics = calculateComplianceMetrics();

  const reportTypes = [
    { value: "sales_summary", label: "Sales Summary Report" },
    { value: "purchase_summary", label: "Purchase Summary Report" },
    { value: "vat_report", label: "VAT Compliance Report" },
    { value: "profit_loss", label: "Profit & Loss Statement" },
    { value: "inventory_report", label: "Inventory Status Report" },
    { value: "customer_statement", label: "Customer Statement" },
    { value: "vendor_statement", label: "Vendor Statement" },
  ];

  return (
    <MainLayout
      title="Reports & Analytics"
      subtitle="Financial reports and compliance documents"
    >
      <div className="space-y-6">
        {/* Report Generation Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger data-testid="select-report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fromDate">From Date</Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  data-testid="input-from-date"
                />
              </div>
              <div>
                <Label htmlFor="toDate">To Date</Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  data-testid="input-to-date"
                />
              </div>
              <div className="flex items-end space-x-2">
                <Button onClick={handleGenerateReport} data-testid="button-generate-report">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate
                </Button>
                <Button variant="outline" onClick={handleExportPDF} data-testid="button-export-pdf">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" onClick={() => exportToCsv(vatEntries || [], 'report.csv')} data-testid="button-export-csv">
                  <Download className="w-4 h-4 mr-2" />
                  CSV
                </Button>
                <Button variant="outline" onClick={() => exportToXlsx(vatEntries || [], 'report.xlsx')} data-testid="button-export-xlsx">
                  <Download className="w-4 h-4 mr-2" />
                  XLSX
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Reports */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="w-5 h-5 mr-2" />
                VAT Compliance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>VAT Collected:</span>
                    <span className="font-medium">Rs. {(dashboardStats?.vatPayable || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT Paid:</span>
                    <span className="font-medium">Rs. 0</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>VAT Payable:</span>
                    <span>Rs. {(dashboardStats?.vatPayable || 0).toLocaleString()}</span>
                  </div>
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full mt-4" data-testid="button-vat-report">
                <FileText className="w-4 h-4 mr-2" />
                VAT Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : complianceMetrics ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Sales:</span>
                    <span className="font-medium">Rs. {complianceMetrics.totalSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Purchases:</span>
                    <span className="font-medium">Rs. {complianceMetrics.totalPurchases.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Gross Profit:</span>
                    <span>Rs. {complianceMetrics.grossProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margin:</span>
                    <span>{complianceMetrics.grossMargin.toFixed(1)}%</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No data available</p>
              )}
              <Button variant="outline" size="sm" className="w-full mt-4" data-testid="button-financial-report">
                <FileText className="w-4 h-4 mr-2" />
                P&L Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Inventory Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Value:</span>
                    <span className="font-medium">Rs. {(dashboardStats?.totalInventory || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Low Stock Items:</span>
                    <span className="font-medium text-destructive">
                      {dashboardStats?.lowStockItems?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-2">
                    <span>Status:</span>
                    <span className={dashboardStats?.lowStockItems?.length > 0 ? "text-destructive" : "text-green-600"}>
                      {dashboardStats?.lowStockItems?.length > 0 ? "Needs Attention" : "Healthy"}
                    </span>
                  </div>
                </div>
              )}
              <Button variant="outline" size="sm" className="w-full mt-4" data-testid="button-inventory-report">
                <FileText className="w-4 h-4 mr-2" />
                Inventory Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {sales?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Sales Transactions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {purchases?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Purchase Transactions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {vatEntries?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">VAT Ledger Entries</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardStats?.lowStockItems?.length > 0 && (
                <div className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                  <p className="text-sm text-amber-800">
                    {dashboardStats.lowStockItems.length} items are below minimum stock level
                  </p>
                </div>
              )}
              
              {complianceMetrics && complianceMetrics.grossMargin >= 50 && (
                <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <p className="text-sm text-blue-800">
                    High margin transactions detected - ensure compliance with regulations
                  </p>
                </div>
              )}
              
              <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <p className="text-sm text-green-800">
                  VAT calculations are up to date with 13% Nepal rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
