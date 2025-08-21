import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Info, Mail, Settings } from "lucide-react";

const EmailSetupGuide = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Email Configuration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Currently using demo mode. Emails will download PDFs instead of sending. 
            To enable real email sending, configure EmailJS below.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h4 className="font-semibold text-foreground">Setup EmailJS for Real Email Sending:</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">1. Create EmailJS Account</span>
              <Button variant="outline" size="sm" asChild>
                <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3 mr-2" />
                  EmailJS
                </a>
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-2">
              <p>2. Get your Service ID, Template ID, and Public Key</p>
              <p>3. Update the configuration in <code className="bg-muted px-1 rounded">src/utils/emailService.ts</code></p>
              <p>4. Create an email template with these parameters:</p>
              
              <div className="bg-muted/50 p-3 rounded space-y-1">
                <p><Badge variant="secondary">to_email</Badge> - Recipient emails</p>
                <p><Badge variant="secondary">subject</Badge> - Email subject</p>
                <p><Badge variant="secondary">message</Badge> - Email body</p>
                <p><Badge variant="secondary">pdf_attachment</Badge> - PDF file (base64)</p>
                <p><Badge variant="secondary">invoice_number</Badge> - Invoice number</p>
                <p><Badge variant="secondary">company_name</Badge> - Company name</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-semibold text-foreground mb-2">Current Email Options:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-primary" />
              <span><strong>Direct Send:</strong> Downloads PDF (demo mode)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-primary" />
              <span><strong>Email Client:</strong> Opens your default email app with pre-filled content</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailSetupGuide;