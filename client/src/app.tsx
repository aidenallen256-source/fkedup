import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./hooks/useAuth";
import AuthPage from "./pages/auth-page";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import SalesEntry from "./pages/sales-entry";
import PurchaseEntry from "./pages/purchase-entry";
import VatLedger from "./pages/vat-ledger";
import PurchaseLedger from "./pages/purchase-ledger";
import SalesLedger from "./pages/sales-ledger";
import Vendors from "./pages/vendors";
import Customers from "./pages/customers";
import Items from "./pages/items-new";
import Reports from "./pages/reports";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={AuthPage} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/sales" component={SalesEntry} />
          <Route path="/purchase" component={PurchaseEntry} />
          <Route path="/vat-ledger" component={VatLedger} />
          <Route path="/purchase-ledger" component={PurchaseLedger} />
          <Route path="/sales-ledger" component={SalesLedger} />
          <Route path="/vendors" component={Vendors} />
          <Route path="/customers" component={Customers} />
          <Route path="/items" component={Items} />
          <Route path="/reports" component={Reports} />
        </>
      )}
      
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      
        <Router />
     
    </QueryClientProvider>
  );
}

export default App;
