import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, Receipt, BarChart3 } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Calculator className="text-primary-foreground text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Nepal POS</h1>
              <p className="text-muted-foreground">Accounting & Inventory System</p>
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-foreground">
            Complete Business Management Solution
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Manage sales, purchases, inventory, VAT compliance, and financial reporting 
            all in one place. Designed specifically for Nepal business requirements.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <TrendingUp className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Real-time Sales & POS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Instant sales entry with real-time inventory updates, 
                customer management, and invoice generation.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Receipt className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">VAT & Tax Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                13% VAT calculation, excise duty handling, and 
                automated compliance reporting for Nepal tax rules.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <BarChart3 className="w-12 h-12 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Comprehensive Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Detailed financial reports, profit analysis, 
                and dual accounting views for internal management.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-login"
          >
            Get Started - Sign In
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Secure authentication powered by Replit
          </p>
        </div>

        {/* Key Features List */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Real-time inventory tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>13% VAT calculation (Nepal rules)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Vendor & customer management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Purchase with excise duty</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Sales with discount tracking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Dual accounting ledgers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>PDF invoice generation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Multi-user support</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
