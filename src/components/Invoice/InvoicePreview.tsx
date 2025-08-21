import { InvoiceData } from "@/types/invoice";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface InvoicePreviewProps {
  invoice: InvoiceData;
}

const InvoicePreview = ({ invoice }: InvoicePreviewProps) => {
  return (
    <Card className="w-full shadow-card">
      <CardContent className="p-8" id="invoice-preview">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-6">
            {invoice.companyLogo && (
              <div className="flex-shrink-0">
                <img
                  src={invoice.companyLogo}
                  alt="Company logo"
                  className="w-20 h-20 object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">INVOICE</h1>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><span className="font-semibold">Invoice #:</span> {invoice.invoiceNumber}</p>
                <p><span className="font-semibold">Date:</span> {new Date(invoice.date).toLocaleDateString()}</p>
                <p><span className="font-semibold">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                <p><span className="font-semibold">Payment Terms:</span> {invoice.paymentTerms}</p>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-xl font-bold text-primary mb-2">{invoice.companyName}</h2>
          </div>
        </div>

        {/* Bill To & Ship To */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold text-foreground mb-2">Bill To:</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium">{invoice.billToName}</p>
              <p>{invoice.billToAddress}</p>
              <p>{invoice.billToCity}, {invoice.billToState} {invoice.billToZip}</p>
            </div>
          </div>
          
          {invoice.shipToName && (
            <div>
              <h3 className="font-semibold text-foreground mb-2">Ship To:</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="font-medium">{invoice.shipToName}</p>
                <p>{invoice.shipToAddress}</p>
                <p>{invoice.shipToCity}, {invoice.shipToState} {invoice.shipToZip}</p>
              </div>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <div className="bg-primary text-primary-foreground p-3 grid grid-cols-12 gap-4 text-sm font-semibold">
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-center">Quantity</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>
          
          {invoice.items.map((item, index) => (
            <div key={item.id} className={`p-3 grid grid-cols-12 gap-4 text-sm border-b border-border ${index % 2 === 1 ? 'bg-muted/50' : ''}`}>
              <div className="col-span-6">{item.description}</div>
              <div className="col-span-2 text-center">{item.quantity}</div>
              <div className="col-span-2 text-right">${item.rate.toFixed(2)}</div>
              <div className="col-span-2 text-right">${item.amount.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            
            {invoice.discountValue > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Discount ({invoice.discountType === 'percentage' ? `${invoice.discountValue}%` : `$${invoice.discountValue}`}):</span>
                <span>-${invoice.discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            {invoice.taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax ({invoice.taxRate}%):</span>
                <span>${invoice.taxAmount.toFixed(2)}</span>
              </div>
            )}
            
            {invoice.shippingAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Shipping:</span>
                <span>${invoice.shippingAmount.toFixed(2)}</span>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
            
            {invoice.amountPaid > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span>Amount Paid:</span>
                  <span>${invoice.amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-primary">
                  <span>Balance Due:</span>
                  <span>${invoice.balanceDue.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notes and Terms */}
        {(invoice.notes || invoice.terms) && (
          <div className="space-y-4">
            {invoice.notes && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Notes:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
            
            {invoice.terms && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Terms:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoicePreview;