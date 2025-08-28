import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import MainLayout from "@/components/layout/main-layout";
import StatsCard from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Receipt, Package, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard/stats"],
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

  return (
    <MainLayout
      title="Dashboard"
      subtitle="Overview of your business metrics"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-20 w-full" />
                </Card>
              ))}
            </>
          ) : (
            <>
              <StatsCard
                title="Today's Sales"
                value={`Rs. ${stats?.todaySales?.toLocaleString() || "0"}`}
                change="+12.5% from yesterday"
                changeType="positive"
                icon={<ShoppingCart className="text-xl" />}
                iconBgColor="bg-green-100"
                iconColor="text-green-600"
              />
              
              <StatsCard
                title="VAT Payable"
                value={`Rs. ${stats?.vatPayable?.toLocaleString() || "0"}`}
                change="13% VAT current period"
                changeType="neutral"
                icon={<Receipt className="text-xl" />}
                iconBgColor="bg-amber-100"
                iconColor="text-amber-600"
              />
              
              <StatsCard
                title="Total Inventory"
                value={`Rs. ${stats?.totalInventory?.toLocaleString() || "0"}`}
                change={`${stats?.lowStockItems?.length || 0} low stock items`}
                changeType="neutral"
                icon={<Package className="text-xl" />}
                iconBgColor="bg-blue-100"
                iconColor="text-blue-600"
              />
              
              <StatsCard
                title="Net Profit"
                value={`Rs. ${stats?.netProfit?.toLocaleString() || "0"}`}
                change="Monthly performance"
                changeType="positive"
                icon={<TrendingUp className="text-xl" />}
                iconBgColor="bg-green-100"
                iconColor="text-green-600"
              />
            </>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.recentSales?.length > 0 ? (
                    stats.recentSales.map((sale: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {sale.invoiceNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Customer: {sale.customerName || "Walk-in Customer"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            Rs. {Number(sale.totalAmount).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(sale.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent sales</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.lowStockItems?.length > 0 ? (
                    stats.lowStockItems.map((item: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Category: {item.category || "General"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-destructive">
                            {item.stockQuantity} {item.unit}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Min: {item.minStockLevel} {item.unit}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">All items in stock</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
