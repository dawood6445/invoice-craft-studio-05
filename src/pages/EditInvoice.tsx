import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { InvoiceData } from "@/types/invoice";
import { getInvoiceById, saveInvoice } from "@/utils/localStorage";
import InvoiceForm from "@/components/Invoice/InvoiceForm";
import Header from "@/components/Layout/Header";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const EditInvoice = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundInvoice = getInvoiceById(id);
      if (foundInvoice) {
        setInvoice(foundInvoice);
      } else {
        toast({
          title: "Error",
          description: "Invoice not found",
          variant: "destructive",
        });
        navigate("/history");
      }
    }
    setLoading(false);
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading invoice...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Invoice Not Found</h1>
            <Button onClick={() => navigate("/history")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to History
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-4 mb-6">
          <Button onClick={() => navigate("/history")} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            Edit Invoice {invoice.invoiceNumber}
          </h1>
        </div>
      </div>
      <InvoiceForm initialInvoice={invoice} />
    </div>
  );
};

export default EditInvoice;