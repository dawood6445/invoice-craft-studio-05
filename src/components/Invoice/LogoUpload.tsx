import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, X, Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";

interface LogoUploadProps {
  logoUrl?: string;
  onLogoChange: (logoUrl: string | undefined) => void;
}

const LogoUpload = ({ logoUrl, onLogoChange }: LogoUploadProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onLogoChange(result);
        toast({
          title: "Success",
          description: "Logo uploaded successfully!",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    }
  };

  const handleRemoveBackground = async () => {
    if (!logoUrl) return;

    setIsProcessing(true);
    try {
      // Convert data URL to blob
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      
      // Load image
      const imageElement = await loadImage(blob);
      
      // Remove background
      const processedBlob = await removeBackground(imageElement);
      
      // Convert back to data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onLogoChange(result);
        toast({
          title: "Success",
          description: "Background removed successfully!",
        });
      };
      reader.readAsDataURL(processedBlob);
    } catch (error) {
      console.error('Background removal error:', error);
      toast({
        title: "Error",
        description: "Failed to remove background. Try with a different image.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Company Logo</Label>
      
      {logoUrl ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img
                  src={logoUrl}
                  alt="Company logo"
                  className="w-16 h-16 object-contain border border-border rounded"
                />
              </div>
              
              <div className="flex-1 space-y-2">
                <p className="text-sm text-muted-foreground">Logo uploaded successfully</p>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleRemoveBackground}
                    disabled={isProcessing}
                    variant="outline"
                    size="sm"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3 h-3 mr-2" />
                        Remove Background
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => onLogoChange(undefined)}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-3 h-3 mr-2" />
                    Remove Logo
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Upload your company logo</p>
                <p className="text-xs text-muted-foreground">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
              
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                id="logo-upload"
              />
              
              <Button
                onClick={() => document.getElementById('logo-upload')?.click()}
                variant="outline"
                size="sm"
                className="mt-4"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LogoUpload;