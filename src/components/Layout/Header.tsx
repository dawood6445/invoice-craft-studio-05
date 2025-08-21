import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, History, Calculator } from "lucide-react";

const Header = () => {
  const location = useLocation();

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <Calculator className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Invoice Craft Studio</h1>
            </div>
          </div>
          
          <nav className="flex items-center space-x-2">
            <Button
              variant={location.pathname === "/" ? "default" : "ghost"}
              asChild
            >
              <Link to="/" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Create Invoice</span>
              </Link>
            </Button>
            
            <Button
              variant={location.pathname === "/history" ? "default" : "ghost"}
              asChild
            >
              <Link to="/history" className="flex items-center space-x-2">
                <History className="w-4 h-4" />
                <span>History</span>
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;