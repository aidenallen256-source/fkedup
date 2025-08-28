import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

interface PurchaseFormProps {
  vendors: any[];
  items: any[];
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

interface PurchaseItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  exciseAmount: number;
  totalPrice: number;
}

export default function PurchaseForm({ vendors, items, onSubmit, isSubmitting }: PurchaseFormProps) {
  const [billNumber, setBillNumber] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [vatEnabled, setVatEnabled] = useState(true);
  const [includeExciseInAccounting, setIncludeExciseInAccounting] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState("cash");

  const addItem = () => {
    setPurchaseItems([
      ...purchaseItems,
      {
        itemId: "",
        itemName: "",
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        discountAmount: 0,
        exciseAmount: 0,
        totalPrice: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PurchaseItem, value: any) => {
    const updatedItems = [...purchaseItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // If item is selected, update name and price
    if (field === "itemId" && value) {
      const selectedItem = items.find(item => item.id === value);
      if (selectedItem) {
        updatedItems[index].itemName = selectedItem.name;
        updatedItems[index].unitPrice = Number(selectedItem.costPrice);
      }
    }

    // Recalculate totals following Nepal rules: (Item Price - Discount + Excise + VAT)
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

    // Calculate total: (Item Price - Discount + Excise)
    updatedItems[index].totalPrice = grossAmount - discountAmount + item.exciseAmount;
    setPurchaseItems(updatedItems);
  };

  // Calculate totals
  const subtotal = purchaseItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const totalDiscount = purchaseItems.reduce((sum, item) => sum + item.discountAmount, 0);
  const totalExcise = purchaseItems.reduce((sum, item) => sum + item.exciseAmount, 0);
  const taxableAmount = subtotal - totalDiscount + totalExcise;
  const vatAmount = vatEnabled ? taxableAmount * 0.13 : 0;
  const totalAmount = taxableAmount + vatAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (purchaseItems.length === 0) {
      alert("Please add at least one item");
      return;
    }

    if (!vendorName) {
      alert("Please select a vendor");
      return;
    }

    const transaction = {
      billNumber,
      vendorId: vendorId || null,
      vendorName,
      purchaseDate: new Date(purchaseDate),
      subtotal: subtotal.toString(),
      discountPercent: "0",
      discountAmount: totalDiscount.toString(),
      exciseAmount: totalExcise.toString(),
      vatEnabled,
      vatAmount: vatAmount.toString(),
      totalAmount: totalAmount.toString(),
      paymentTerms,
      paymentStatus: paymentTerms === "cash" ? "paid" : "pending",
      includeExciseInAccounting,
    };

    const transactionItems = purchaseItems.map(item => ({
      itemId: item.itemId,
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toString(),
      discountPercent: item.discountPercent.toString(),
      discountAmount: item.discountAmount.toString(),
      exciseAmount: item.exciseAmount.toString(),
      totalPrice: item.totalPrice.toString(),
    }));

    onSubmit({ transaction, items: transactionItems });
  };

  const handleVendorChange = (value: string) => {
    setVendorId(value);
    if (value) {
      const vendor = vendors.find(v => v.id === value);
      if (vendor) {
        setVendorName(vendor.name);
      }
    } else {
      setVendorName("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Entry</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vendor Selection */}
            <div>
              <Label htmlFor="vendor">Vendor</Label>
              <div className="flex space-x-2 mt-2">
                <Select value={vendorId} onValueChange={handleVendorChange}>
                  <SelectTrigger data-testid="select-vendor">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name} {vendor.vatNumber ? `(VAT: ${vendor.vatNumber})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bill Number */}
            <div>
              <Label htmlFor="billNumber">Bill Number</Label>
              <Input
                id="billNumber"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                placeholder="Vendor Bill No."
                data-testid="input-bill-number"
                className="mt-2"
                required
              />
            </div>

            {/* Purchase Date */}
            <div>
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                data-testid="input-purchase-date"
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
                    <TableHead>Excise</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseItems.map((item, index) => (
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
                                {availableItem.name}
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
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.exciseAmount}
                          onChange={(e) => updateItem(index, "exciseAmount", parseFloat(e.target.value) || 0)}
                          data-testid={`input-excise-${index}`}
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeExcise"
                    checked={includeExciseInAccounting}
                    onCheckedChange={setIncludeExciseInAccounting}
                    data-testid="checkbox-include-excise"
                  />
                  <Label htmlFor="includeExcise">Include Excise in Accounting</Label>
                </div>
              </div>
              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger data-testid="select-payment-terms" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash Payment</SelectItem>
                    <SelectItem value="credit_30">Credit - 30 Days</SelectItem>
                    <SelectItem value="credit_60">Credit - 60 Days</SelectItem>
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
                  <span>Excise Duty:</span>
                  <span data-testid="text-excise">Rs. {totalExcise.toFixed(2)}</span>
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
              data-testid="button-save-purchase"
              className="bg-primary text-primary-foreground"
            >
              {isSubmitting ? "Saving..." : "Save Purchase"}
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
