import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Download, Mail } from "lucide-react";
import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { v4 as uuidv4 } from "uuid";
import InvoicePreview from "./InvoicePreview";
import EmailDialog from "./EmailDialog";
import LogoUpload from "./LogoUpload";
import { generatePDF } from "@/utils/pdfGenerator";
import { saveInvoice } from "@/utils/localStorage";
import { useToast } from "@/hooks/use-toast";

interface InvoiceFormProps {
  initialInvoice?: InvoiceData;
}

const InvoiceForm = ({ initialInvoice }: InvoiceFormProps) => {
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<InvoiceData>(() => {
    if (initialInvoice) {
      return initialInvoice;
    }
    
    return {
      id: uuidv4(),
      invoiceNumber: `INV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      paymentTerms: "Net 30",
      poNumber: "",
      companyName: "Your Company Name",
      billToName: "",
      billToAddress: "",
      billToCity: "",
      billToState: "",
      billToZip: "",
      items: [{
        id: uuidv4(),
        description: "",
        quantity: 1,
        rate: 0,
        amount: 0
      }],
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      discountType: 'percentage',
      discountValue: 0,
      discountAmount: 0,
      shippingAmount: 0,
      total: 0,
      amountPaid: 0,
      balanceDue: 0,
      notes: "",
      terms: "Thank you for your business!",
      createdAt: initialInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

  const updateInvoice = (field: keyof InvoiceData, value: any) => {
    setInvoice(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...invoice.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }
    
    updateInvoice('items', updatedItems);
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: uuidv4(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0
    };
    updateInvoice('items', [...invoice.items, newItem]);
  };

  const removeItem = (index: number) => {
    const updatedItems = invoice.items.filter((_, i) => i !== index);
    updateInvoice('items', updatedItems);
  };

  // Calculate totals
  useEffect(() => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    const discountAmount = invoice.discountType === 'percentage' 
      ? (subtotal * invoice.discountValue) / 100 
      : invoice.discountValue;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * invoice.taxRate) / 100;
    const total = afterDiscount + taxAmount + invoice.shippingAmount;
    const balanceDue = total - invoice.amountPaid;

    setInvoice(prev => ({
      ...prev,
      subtotal,
      discountAmount,
      taxAmount,
      total,
      balanceDue
    }));
  }, [invoice.items, invoice.taxRate, invoice.discountValue, invoice.discountType, invoice.shippingAmount, invoice.amountPaid]);

  const handleDownload = async () => {
    try {
      await generatePDF(invoice);
      toast({
        title: "Success",
        description: "Invoice downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download invoice",
        variant: "destructive",
      });
    }
  };

  const handleSave = () => {
    saveInvoice(invoice);
    toast({
      title: "Success",
      description: "Invoice saved successfully!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Invoice Details</span>
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} variant="outline" size="sm">
                      Save
                    </Button>
                    <Button onClick={handleDownload} size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button onClick={() => setIsEmailDialogOpen(true)} variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoiceNumber">Invoice Number</Label>
                    <Input
                      id="invoiceNumber"
                      value={invoice.invoiceNumber}
                      onChange={(e) => updateInvoice('invoiceNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={invoice.date}
                      onChange={(e) => updateInvoice('date', e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={invoice.dueDate}
                      onChange={(e) => updateInvoice('dueDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Select value={invoice.paymentTerms} onValueChange={(value) => updateInvoice('paymentTerms', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <LogoUpload 
                  logoUrl={invoice.companyLogo}
                  onLogoChange={(logoUrl) => updateInvoice('companyLogo', logoUrl)}
                />
                
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={invoice.companyName}
                    onChange={(e) => updateInvoice('companyName', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bill To</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="billToName">Name</Label>
                  <Input
                    id="billToName"
                    value={invoice.billToName}
                    onChange={(e) => updateInvoice('billToName', e.target.value)}
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <Label htmlFor="billToAddress">Address</Label>
                  <Input
                    id="billToAddress"
                    value={invoice.billToAddress}
                    onChange={(e) => updateInvoice('billToAddress', e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="billToCity">City</Label>
                    <Input
                      id="billToCity"
                      value={invoice.billToCity}
                      onChange={(e) => updateInvoice('billToCity', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="billToState">State</Label>
                    <Input
                      id="billToState"
                      value={invoice.billToState}
                      onChange={(e) => updateInvoice('billToState', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="billToZip">ZIP</Label>
                    <Input
                      id="billToZip"
                      value={invoice.billToZip}
                      onChange={(e) => updateInvoice('billToZip', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Items</span>
                  <Button onClick={addItem} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Rate</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Amount</Label>
                        <Input
                          value={item.amount.toFixed(2)}
                          disabled
                        />
                      </div>
                      <div className="col-span-1">
                        {invoice.items.length > 1 && (
                          <Button
                            onClick={() => removeItem(index)}
                            size="sm"
                            variant="outline"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Totals & Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      value={invoice.taxRate}
                      onChange={(e) => updateInvoice('taxRate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingAmount">Shipping</Label>
                    <Input
                      id="shippingAmount"
                      type="number"
                      step="0.01"
                      value={invoice.shippingAmount}
                      onChange={(e) => updateInvoice('shippingAmount', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={invoice.notes}
                    onChange={(e) => updateInvoice('notes', e.target.value)}
                    placeholder="Any additional notes"
                  />
                </div>
                
                <div>
                  <Label htmlFor="terms">Terms</Label>
                  <Textarea
                    id="terms"
                    value={invoice.terms}
                    onChange={(e) => updateInvoice('terms', e.target.value)}
                    placeholder="Terms and conditions"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="lg:sticky lg:top-8">
            <InvoicePreview invoice={invoice} />
          </div>
        </div>
      </div>

      <EmailDialog
        isOpen={isEmailDialogOpen}
        onClose={() => setIsEmailDialogOpen(false)}
        invoice={invoice}
      />
    </div>
  );
};

export default InvoiceForm;