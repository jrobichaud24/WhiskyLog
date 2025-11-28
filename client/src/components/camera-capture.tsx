import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Camera, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getRatingLabel, getRatingColor } from "@/lib/rating-utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface CameraCaptureProps {
  onWhiskyAdded?: () => void;
}

export default function CameraCapture({ onWhiskyAdded }: CameraCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [whiskyDataToAdd, setWhiskyDataToAdd] = useState<any>(null);

  // Rating state
  const [showRateDialog, setShowRateDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [tastingNotes, setTastingNotes] = useState("");
  const [userProductToRate, setUserProductToRate] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Mutation to analyze image
  const analyzeImageMutation = useMutation({
    mutationFn: async (imageData: string) => {
      // Add timeout to the API request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await apiRequest("/api/analyze-bottle", {
          method: "POST",
          body: { image: imageData },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
    onSuccess: (result) => {
      setIsProcessing(false);
      setAnalysisResult(result);
      if (result.success) {
        // Product found and added (or already exists)
        if (result.userProduct) {
          setUserProductToRate(result.userProduct);
          setRating(result.userProduct.rating || 0);
          setTastingNotes(result.userProduct.tastingNotes || "");
          setShowRateDialog(true);
        } else if (onWhiskyAdded) {
          onWhiskyAdded();
          queryClient.invalidateQueries({ queryKey: ["/api/user-products"] });
        }
      } else if (result.productNotFound && result.canAdd) {
        // Show confirmation dialog for adding new product
        setWhiskyDataToAdd(result.whiskyData);
        setShowAddDialog(true);
      }
    },
    onError: (error: Error) => {
      setIsProcessing(false);
      console.error("Analysis error:", error);

      let errorMessage = "Could not identify the whisky from the image";
      if (error.name === 'AbortError') {
        errorMessage = "Analysis timed out. Please try again with a clearer, well-lit photo.";
      } else if (error.message.includes('413')) {
        errorMessage = "Image too large. Please try with a smaller photo.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setAnalysisResult({
        success: false,
        message: errorMessage
      });
    }
  });

  // Mutation to create new product
  const createProductMutation = useMutation({
    mutationFn: async (whiskyData: any) => {
      const response = await apiRequest("/api/analyze-bottle/create-product", {
        method: "POST",
        body: { whiskyData }
      });
      return response;
    },
    onSuccess: (result) => {
      toast({
        title: "Success!",
        description: result.message,
      });
      setAnalysisResult(result);
      setShowAddDialog(false);

      if (result.userProduct) {
        setUserProductToRate(result.userProduct);
        setRating(0); // New product, no rating yet
        setTastingNotes(result.userProduct.tastingNotes || "");
        setShowRateDialog(true);
      } else if (onWhiskyAdded) {
        onWhiskyAdded();
        queryClient.invalidateQueries({ queryKey: ["/api/user-products"] });
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        queryClient.invalidateQueries({ queryKey: ["/api/distilleries"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Product",
        description: error.message || "Could not add the whisky to the database",
        variant: "destructive",
      });
    }
  });

  // Mutation to update rating/notes
  const updateProductMutation = useMutation({
    mutationFn: async (data: { id: string; rating: number; tastingNotes: string }) => {
      return await apiRequest(`/api/user-products/${data.id}`, {
        method: "PATCH",
        body: { rating: data.rating, tastingNotes: data.tastingNotes }
      });
    },
    onSuccess: () => {
      toast({
        title: "Rating Saved",
        description: "Your rating and notes have been saved.",
      });
      setShowRateDialog(false);
      if (onWhiskyAdded) {
        onWhiskyAdded();
        queryClient.invalidateQueries({ queryKey: ["/api/user-products"] });
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Save",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    try {
      const compressedImage = await compressImage(file, 1200, 0.8);
      setCapturedImage(compressedImage);
    } catch (error) {
      toast({
        title: "Image Processing Error",
        description: "Could not process the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAnalyzeImage = () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setAnalysisResult(null);

    try {
      const base64Data = capturedImage.split(',')[1];
      if (!base64Data) {
        throw new Error("Invalid image data");
      }

      console.log("Starting image analysis...");
      analyzeImageMutation.mutate(base64Data);
    } catch (error) {
      console.error("Error preparing image for analysis:", error);
      setIsProcessing(false);
      toast({
        title: "Image Error",
        description: "Could not process the image. Please try taking a new photo.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCapturedImage(null);
    setAnalysisResult(null);
    setShowAddDialog(false);
    setWhiskyDataToAdd(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowRateDialog(false);
    setUserProductToRate(null);
    setRating(0);
    setTastingNotes("");
  };

  const handleAddProduct = () => {
    if (whiskyDataToAdd) {
      createProductMutation.mutate(whiskyDataToAdd);
    }
  };

  const handleDeclineAdd = () => {
    setShowAddDialog(false);
    setAnalysisResult({
      success: false,
      message: "Whisky identification complete. You chose not to add it to the database."
    });
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
                  <div className={`p-4 border rounded-lg ${analysisResult.success
                      ? "bg-green-50 border-green-200"
                      : "bg-blue-50 border-blue-200"
                    }`}>
                    <div className="flex items-start gap-2">
                      <CheckCircle className={`h-5 w-5 mt-0.5 ${analysisResult.success ? "text-green-600" : "text-blue-600"
                        }`} />
                      <p className={`text-sm ${analysisResult.success ? "text-green-800" : "text-blue-800"
                        }`}>
                        {analysisResult.message}
                      </p>
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
            {analysisResult && !showAddDialog && !showRateDialog && (
              <Button onClick={handleClose} data-testid="button-done">
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for adding new product */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Whisky to Database?</DialogTitle>
            <DialogDescription>
              We identified a whisky that's not in our database yet. Would you like to add it?
            </DialogDescription>
          </DialogHeader>

          {whiskyDataToAdd && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                <div><strong>Name:</strong> {whiskyDataToAdd.name || "Unknown"}</div>
                {whiskyDataToAdd.distillery && (
                  <div><strong>Distillery:</strong> {whiskyDataToAdd.distillery}</div>
                )}
                {whiskyDataToAdd.age && (
                  <div><strong>Age:</strong> {whiskyDataToAdd.age}</div>
                )}
                {whiskyDataToAdd.abv && (
                  <div><strong>ABV:</strong> {whiskyDataToAdd.abv}</div>
                )}
                {whiskyDataToAdd.description && (
                  <div className="text-sm text-slate-600">
                    <strong>Notes:</strong> {whiskyDataToAdd.description}
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500">
                This will add the whisky to our database and to your collection.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleDeclineAdd}
              data-testid="button-decline-add"
            >
              No, Skip
            </Button>
            <Button
              onClick={handleAddProduct}
              disabled={createProductMutation.isPending}
              data-testid="button-confirm-add"
            >
              {createProductMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Yes, Add It"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRateDialog} onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
        setShowRateDialog(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate & Review</DialogTitle>
            <DialogDescription>
              Add your personal rating and tasting notes for this whisky.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <Label className="text-base font-semibold">Your Rating</Label>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-3xl font-bold ${getRatingColor(rating)}`}>
                  {rating > 0 ? rating : "-"}<span className="text-lg text-slate-400 font-normal">/10</span>
                </span>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                  {getRatingLabel(rating)}
                </Badge>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-xs text-slate-400 px-1">
                <span>0</span>
                <span>5</span>
                <span>10</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-base font-semibold">Tasting Notes</Label>
              <Textarea
                id="notes"
                placeholder="Describe the nose, taste, and finish..."
                value={tastingNotes}
                onChange={(e) => setTastingNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-slate-500"
            >
              Skip
            </Button>
            <Button
              onClick={() => {
                if (userProductToRate) {
                  updateProductMutation.mutate({
                    id: userProductToRate.id,
                    rating,
                    tastingNotes
                  });
                }
              }}
              disabled={updateProductMutation.isPending}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {updateProductMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Rating"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}