import Header from "@/components/Layout/Header";
import EmailSetupGuide from "@/components/EmailSetup/EmailSetupGuide";

const EmailSetup = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Email Configuration</h1>
            <p className="text-muted-foreground">
              Set up email sending to deliver invoices directly to your clients
            </p>
          </div>
          
          <EmailSetupGuide />
        </div>
      </div>
    </div>
  );
};

export default EmailSetup;