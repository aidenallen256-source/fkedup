import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

interface SalesFormProps {
  customers: any[];
  items: any[];
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

interface SalesItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  totalPrice: number;
}

export default function SalesForm({ customers, items, onSubmit, isSubmitting }: SalesFormProps) {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [salesItems, setSalesItems] = useState<SalesItem[]>([]);
  const [vatEnabled, setVatEnabled] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Generate invoice number on component mount
  useEffect(() => {
    const generateInvoiceNumber = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const time = String(Date.now()).slice(-4);
      return `INV-${year}${month}${day}-${time}`;
    };

    setInvoiceNumber(generateInvoiceNumber());
  }, []);

  const addItem = () => {
    setSalesItems([
      ...salesItems,
      {
        itemId: "",
        itemName: "",
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        discountAmount: 0,
        totalPrice: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setSalesItems(salesItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof SalesItem, value: any) => {
    const updatedItems = [...salesItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // If item is selected, update name and price
    if (field === "itemId" && value) {
      const selectedItem = items.find(item => item.id === value);
      if (selectedItem) {
        updatedItems[index].itemName = selectedItem.name;
        updatedItems[index].unitPrice = Number(selectedItem.sellingPrice);
      }
    }

    // Recalculate totals
    const item = updatedItems[index];
    const grossAmount = item.quantity * item.unitPrice;
    
    // Calculate discount
    let discountAmount = 0;
    if (item.discountPercent > 0) {
      discountAmount = (grossAmount * item.discountPercent) / 100;
      updatedItems[index].discountAmount = discountAmount;
    } else if (item.discountAmount > 0) {
      discountAmount = item.discountAmount;
      updatedItems[index].discountPercent = (discountAmount / grossAmount) * 100;
    }

    updatedItems[index].totalPrice = grossAmount - discountAmount;
    setSalesItems(updatedItems);
  };

  // Calculate totals
  const subtotal = salesItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalDiscount = salesItems.reduce((sum, item) => sum + item.discountAmount, 0);
  const taxableAmount = subtotal - totalDiscount;
  const vatAmount = vatEnabled ? taxableAmount * 0.13 : 0;
  const totalAmount = taxableAmount + vatAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (salesItems.length === 0) {
      alert("Please add at least one item");
      return;
    }

    const transaction = {
      invoiceNumber,
      customerId: customerId || null,
      customerName,
      saleDate: new Date(),
      subtotal: subtotal.toString(),
      discountPercent: "0",
      discountAmount: totalDiscount.toString(),
      vatEnabled,
      vatAmount: vatAmount.toString(),
      totalAmount: totalAmount.toString(),
      paymentMethod,
      paymentStatus: "paid",
    };

    const transactionItems = salesItems.map(item => ({
      itemId: item.itemId,
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      discountPercent: item.discountPercent.toString(),
      discountAmount: item.discountAmount.toString(),
      totalPrice: item.totalPrice.toString(),
    }));

    onSubmit({ transaction, items: transactionItems });
  };

  const handleCustomerChange = (value: string) => {
    setCustomerId(value);
    if (value) {
      const customer = customers.find(c => c.id === value);
      if (customer) {
        setCustomerName(customer.name);
      }
    } else {
      setCustomerName("Walk-in Customer");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Entry (POS Style)</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Selection */}
            <div>
              <Label htmlFor="customer">Customer</Label>
              <div className="flex space-x-2 mt-2">
                <Select value={customerId} onValueChange={handleCustomerChange}>
                  <SelectTrigger data-testid="select-customer">
                    <SelectValue placeholder="Walk-in Customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Walk-in Customer</SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.address || "No address"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Invoice Number */}
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                data-testid="input-invoice-number"
                className="mt-2"
                required
              />
            </div>
          </div>

          {/* Items Section */}
          <div>
            <Label>Items</Label>
            <div className="border border-border rounded-lg overflow-hidden mt-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead>Item</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Disc %</TableHead>
                    <TableHead>Disc Amt</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select
                          value={item.itemId}
                          onValueChange={(value) => updateItem(index, "itemId", value)}
                        >
                          <SelectTrigger data-testid={`select-item-${index}`}>
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map((availableItem) => (
                              <SelectItem key={availableItem.id} value={availableItem.id}>
                                {availableItem.name} (Stock: {availableItem.stockQuantity})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                          data-testid={`input-quantity-${index}`}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                          data-testid={`input-unit-price-${index}`}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={item.discountPercent}
                          onChange={(e) => updateItem(index, "discountPercent", parseFloat(e.target.value) || 0)}
                          data-testid={`input-discount-percent-${index}`}
                          className="w-20"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.discountAmount}
                          onChange={(e) => updateItem(index, "discountAmount", parseFloat(e.target.value) || 0)}
                          data-testid={`input-discount-amount-${index}`}
                          className="w-24"
                          placeholder="0"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        Rs. {item.totalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          data-testid={`button-remove-item-${index}`}
                          className="text-destructive hover:text-destructive/80"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 border-t border-border">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={addItem}
                  data-testid="button-add-item"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
          </div>

          {/* Calculation Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vat"
                    checked={vatEnabled}
                    onCheckedChange={setVatEnabled}
                    data-testid="checkbox-vat"
                  />
                  <Label htmlFor="vat">VAT (13%)</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger data-testid="select-payment-method" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span data-testid="text-subtotal">Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span data-testid="text-discount">Rs. {totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (13%):</span>
                  <span data-testid="text-vat">Rs. {vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base border-t border-border pt-2">
                  <span>Total:</span>
                  <span data-testid="text-total">Rs. {totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              data-testid="button-save-invoice"
              className="bg-primary text-primary-foreground"
            >
              {isSubmitting ? "Saving..." : "Save & Print Invoice"}
            </Button>
            <Button 
              type="button" 
              variant="secondary"
              data-testid="button-save-draft"
            >
              Save Draft
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => window.location.reload()}
              data-testid="button-clear"
            >
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
