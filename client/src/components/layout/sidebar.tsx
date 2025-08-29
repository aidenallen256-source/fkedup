import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { 
  Calculator, 
  LayoutDashboard, 
  ShoppingCart, 
  Truck, 
  Receipt, 
  FileText, 
  TrendingUp,
  Building2,
  Users,
  Package,
  BarChart3,
  LogOut,
  User
} from "lucide-react";

const navigationItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/sales", label: "Sales Entry", icon: ShoppingCart },
  { path: "/purchase", label: "Purchase Entry", icon: Truck },
  { path: "/vat-ledger", label: "VAT Ledger", icon: Receipt },
  { path: "/purchase-ledger", label: "Purchase Ledger", icon: FileText },
  { path: "/sales-ledger", label: "Sales Ledger", icon: TrendingUp },
  { path: "/vendors", label: "Vendors", icon: Building2 },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/items", label: "Items", icon: Package },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo & Company Info */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Calculator className="text-primary-foreground text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Nepal POS</h1>
            <p className="text-sm text-muted-foreground">Accounting System</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <IconComponent className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <User className="text-secondary-foreground text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {user?.firstName || user?.email || "User"}
            </p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              try {
                await fetch('/api/logout', { method: 'POST', credentials: 'include' });
              } catch {}
              window.location.href = '/';
            }}
            data-testid="button-logout"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
