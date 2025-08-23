import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Camera, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface CameraCaptureProps {
  onWhiskyAdded?: () => void;
}

export default function CameraCapture({ onWhiskyAdded }: CameraCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Mutation to analyze image and add whisky
  const analyzeImageMutation = useMutation({
    mutationFn: async (imageData: string) => {
      const response = await apiRequest("/api/analyze-bottle", {
        method: "POST",
        body: { image: imageData }
      });
      return response;
    },
    onSuccess: (result) => {
      setAnalysisResult(result.message || "Successfully identified and added whisky to your collection!");
      if (result.success && onWhiskyAdded) {
        onWhiskyAdded();
        queryClient.invalidateQueries({ queryKey: ["/api/user-products"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Could not identify the whisky from the image",
        variant: "destructive",
      });
    }
  });

  const handleCameraClick = () => {
    // On mobile devices, this will open the camera
    // On desktop, it will open file picker
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCapturedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    setAnalysisResult(null);
    
    // Extract base64 data without the data URL prefix
    const base64Data = capturedImage.split(',')[1];
    analyzeImageMutation.mutate(base64Data);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCapturedImage(null);
    setAnalysisResult(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isLoading = analyzeImageMutation.isPending || isProcessing;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg border-0"
        data-testid="button-camera-capture"
      >
        <Camera className="h-4 w-4 mr-2" />
        Scan Bottle
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scan Whisky Bottle
            </DialogTitle>
            <DialogDescription>
              Take a photo of your whisky bottle label to automatically identify and add it to your collection.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!capturedImage ? (
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No image captured yet</p>
                  <Button onClick={handleCameraClick} data-testid="button-take-photo">
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment" // Use rear camera on mobile
                  onChange={handleImageCapture}
                  className="hidden"
                  data-testid="input-camera"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img 
                    src={capturedImage} 
                    alt="Captured bottle" 
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setCapturedImage(null)}
                    className="absolute top-2 right-2"
                    data-testid="button-remove-image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {analysisResult && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <p className="text-green-800 text-sm">{analysisResult}</p>
                    </div>
                  </div>
                )}

                {analyzeImageMutation.isError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <p className="text-red-800 text-sm">
                        {analyzeImageMutation.error?.message || "Failed to analyze the image"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose} data-testid="button-cancel">
              Cancel
            </Button>
            {capturedImage && !analysisResult && (
              <Button 
                onClick={handleAnalyzeImage}
                disabled={isLoading}
                data-testid="button-analyze"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Identify Whisky"
                )}
              </Button>
            )}
            {analysisResult && (
              <Button onClick={handleClose} data-testid="button-done">
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}