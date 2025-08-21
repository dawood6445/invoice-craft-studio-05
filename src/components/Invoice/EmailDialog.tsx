import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Mail, Send, Download, Settings } from "lucide-react";
import { InvoiceData, EmailData } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";
import { sendInvoiceEmail, openEmailClient, initEmailJS } from "@/utils/emailService";

interface EmailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceData;
}

const EmailDialog = ({ isOpen, onClose, invoice }: EmailDialogProps) => {
  const { toast } = useToast();
  const [emailData, setEmailData] = useState<EmailData>({
    to: [],
    subject: `Invoice ${invoice.invoiceNumber} from ${invoice.companyName}`,
    message: `Dear ${invoice.billToName},

Please find attached your invoice ${invoice.invoiceNumber} for the amount of $${invoice.total.toFixed(2)}.

Payment is due by ${new Date(invoice.dueDate).toLocaleDateString()}.

Thank you for your business!

Best regards,
${invoice.companyName}`
  });
  
  const [newEmail, setNewEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [emailMethod, setEmailMethod] = useState<'service' | 'client'>('service');

  const addEmail = () => {
    if (newEmail && isValidEmail(newEmail) && !emailData.to.includes(newEmail)) {
      setEmailData(prev => ({
        ...prev,
        to: [...prev.to, newEmail]
      }));
      setNewEmail("");
    }
  };

  const removeEmail = (email: string) => {
    setEmailData(prev => ({
      ...prev,
      to: prev.to.filter(e => e !== email)
    }));
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendEmail = async () => {
    if (emailData.to.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one recipient email",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      if (emailMethod === 'client') {
        // Open default email client
        openEmailClient(invoice, emailData.to, emailData.subject, emailData.message);
        toast({
          title: "Email Client Opened",
          description: "Please add the PDF attachment manually in your email client.",
        });
      } else {
        // Send via EmailJS service
        const success = await sendInvoiceEmail(
          invoice,
          emailData.to,
          emailData.subject,
          emailData.message
        );
        
        if (success) {
          toast({
            title: "Success",
            description: `Invoice sent successfully to ${emailData.to.length} recipient(s)!`,
          });
        }
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Send Invoice via Email</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Email Method Selection */}
          <div className="space-y-3">
            <Label>Email Method</Label>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  emailMethod === 'service'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setEmailMethod('service')}
              >
                <div className="flex items-center space-x-3">
                  <Send className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Direct Send</p>
                    <p className="text-xs text-muted-foreground">
                      Send with PDF attached (recommended)
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  emailMethod === 'client'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setEmailMethod('client')}
              >
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Email Client</p>
                    <p className="text-xs text-muted-foreground">
                      Open your default email app
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Recipients */}
          <div className="space-y-2">
            <Label htmlFor="recipients">Recipients</Label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  id="recipients"
                  type="email"
                  placeholder="Enter email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button onClick={addEmail} disabled={!newEmail || !isValidEmail(newEmail)}>
                  Add
                </Button>
              </div>
              
              {emailData.to.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 border border-border rounded-md bg-muted/50">
                  {emailData.to.map((email, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-1"
                        onClick={() => removeEmail(email)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={emailData.subject}
              onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={8}
              value={emailData.message}
              onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter your message..."
            />
          </div>

          {/* Invoice Info */}
          <div className="p-4 bg-muted/50 rounded-md">
            <h4 className="font-semibold mb-2">Invoice Details:</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Invoice #{invoice.invoiceNumber}</p>
              <p>Amount: ${invoice.total.toFixed(2)}</p>
              <p>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSendEmail} disabled={isSending || emailData.to.length === 0}>
            {isSending ? (
              "Sending..."
            ) : emailMethod === 'client' ? (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Open Email Client
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailDialog;