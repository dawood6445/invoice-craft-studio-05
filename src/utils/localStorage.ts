import { InvoiceData } from '@/types/invoice';

const STORAGE_KEY = 'invoice-craft-invoices';

export const getInvoices = (): InvoiceData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading invoices from localStorage:', error);
    return [];
  }
};

export const saveInvoice = (invoice: InvoiceData): void => {
  try {
    const invoices = getInvoices();
    const existingIndex = invoices.findIndex(inv => inv.id === invoice.id);
    
    if (existingIndex >= 0) {
      invoices[existingIndex] = invoice;
    } else {
      invoices.push(invoice);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  } catch (error) {
    console.error('Error saving invoice to localStorage:', error);
    throw error;
  }
};

export const deleteInvoice = (invoiceId: string): void => {
  try {
    const invoices = getInvoices();
    const filtered = invoices.filter(inv => inv.id !== invoiceId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting invoice from localStorage:', error);
    throw error;
  }
};

export const getInvoiceById = (invoiceId: string): InvoiceData | undefined => {
  const invoices = getInvoices();
  return invoices.find(inv => inv.id === invoiceId);
};