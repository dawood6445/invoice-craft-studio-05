import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  FileText, 
  Edit, 
  Trash2, 
  Download, 
  Mail, 
  Search,
  Calendar,
  DollarSign,
  Plus
} from "lucide-react";
import { InvoiceData } from "@/types/invoice";
import { getInvoices, deleteInvoice } from "@/utils/localStorage";
import { generatePDF } from "@/utils/pdfGenerator";
import InvoicePreview from "@/components/Invoice/InvoicePreview";
import EmailDialog from "@/components/Invoice/EmailDialog";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Header from "@/components/Layout/Header";

const History = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm]);

  const loadInvoices = () => {
    const savedInvoices = getInvoices();
    setInvoices(savedInvoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const filterInvoices = () => {
    if (!searchTerm) {
      setFilteredInvoices(invoices);
      return;
    }

    const filtered = invoices.filter(invoice =>
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.billToName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvoices(filtered);
  };

  const handleDelete = async (invoiceId: string) => {
    try {
      deleteInvoice(invoiceId);
      loadInvoices();
      toast({
        title: "Success",
        description: "Invoice deleted successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    }
    setDeleteConfirmId(null);
  };

  const handleDownload = async (invoice: InvoiceData) => {
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

  const handlePreview = (invoice: InvoiceData) => {
    setSelectedInvoice(invoice);
    setIsPreviewOpen(true);
  };

  const handleSendEmail = (invoice: InvoiceData) => {
    setSelectedInvoice(invoice);
    setIsEmailDialogOpen(true);
  };

  const getStatusBadge = (invoice: InvoiceData) => {
    const now = new Date();
    const dueDate = new Date(invoice.dueDate);
    const isPaid = invoice.amountPaid >= invoice.total;
    const isOverdue = now > dueDate && !isPaid;

    if (isPaid) {
      return <Badge className="bg-success text-success-foreground">Paid</Badge>;
    } else if (isOverdue) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else {
      return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Invoice History</h1>
              <p className="text-muted-foreground">Manage and track all your invoices</p>
            </div>
            
            <Button asChild>
              <Link to="/" className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create New Invoice</span>
              </Link>
            </Button>
          </div>

          {/* Search and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                      <p className="text-2xl font-bold">{invoices.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-8 h-8 text-success" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">
                        ${invoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-8 h-8 text-warning" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">This Month</p>
                      <p className="text-2xl font-bold">
                        {invoices.filter(inv => {
                          const invoiceDate = new Date(inv.date);
                          const now = new Date();
                          return invoiceDate.getMonth() === now.getMonth() && 
                                 invoiceDate.getFullYear() === now.getFullYear();
                        }).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Invoices List */}
          <Card>
            <CardHeader>
              <CardTitle>All Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {searchTerm ? "No matching invoices found" : "No invoices yet"}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchTerm 
                      ? "Try adjusting your search terms" 
                      : "Create your first invoice to get started"
                    }
                  </p>
                  {!searchTerm && (
                    <Button asChild>
                      <Link to="/">Create Invoice</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInvoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1 space-y-2 md:space-y-0">
                        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                          <div>
                            <h3 className="font-semibold text-foreground">{invoice.invoiceNumber}</h3>
                            <p className="text-sm text-muted-foreground">{invoice.billToName}</p>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                            <span className="font-semibold text-foreground">${invoice.total.toFixed(2)}</span>
                            {getStatusBadge(invoice)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mt-4 md:mt-0">
                        <Button
                          onClick={() => handlePreview(invoice)}
                          variant="outline"
                          size="sm"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          onClick={() => handleDownload(invoice)}
                          variant="outline"
                          size="sm"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          onClick={() => handleSendEmail(invoice)}
                          variant="outline"
                          size="sm"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                        >
                          <Link to={`/edit/${invoice.id}`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        
                        <Button
                          onClick={() => setDeleteConfirmId(invoice.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <InvoicePreview invoice={selectedInvoice} />
          )}
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      {selectedInvoice && (
        <EmailDialog
          isOpen={isEmailDialogOpen}
          onClose={() => setIsEmailDialogOpen(false)}
          invoice={selectedInvoice}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default History;