export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  paymentTerms: string;
  poNumber: string;
  
  // Company Info
  companyLogo?: string;
  companyName: string;
  
  // Bill To
  billToName: string;
  billToAddress: string;
  billToCity: string;
  billToState: string;
  billToZip: string;
  
  // Ship To (optional)
  shipToName?: string;
  shipToAddress?: string;
  shipToCity?: string;
  shipToState?: string;
  shipToZip?: string;
  
  // Items
  items: InvoiceItem[];
  
  // Financial
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  
  // Additional
  notes: string;
  terms: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface EmailData {
  to: string[];
  subject: string;
  message: string;
}