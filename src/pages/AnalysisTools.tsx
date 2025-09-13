import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Camera, FileImage, Zap, Brain, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";

const AnalysisTools = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file (JPG, PNG, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !user) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const result = await apiService.uploadSunflowerImage(formData);
      
      toast({
        title: "Analysis Complete",
        description: "Your sunflower image has been analyzed successfully!",
      });

      // Navigate to analysis results page with data
      navigate('/analysis', {
        state: {
          filename: selectedFile.name,
          imageUrl: previewUrl,
          result: result
        }
      });
      
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze image",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Analysis Tools
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upload sunflower leaf images for AI-powered disease detection and get instant results
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Upload className="w-6 h-6" />
                Upload Image
              </CardTitle>
              <CardDescription className="text-base">
                Select a sunflower leaf image for disease analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="image-upload" className="text-base font-medium">
                  Choose Image File
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    Browse
                  </Button>
                </div>
              </div>

              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-base font-medium">Selected File:</p>
                    <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:opacity-90"
                      size="lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Activity className="w-5 h-5 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Start Analysis
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearSelection}
                      disabled={isAnalyzing}
                      size="lg"
                    >
                      Clear
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Preview Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Camera className="w-6 h-6" />
                Image Preview
              </CardTitle>
              <CardDescription className="text-base">
                Preview of your selected image
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                {previewUrl ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center space-y-3">
                    <FileImage className="w-16 h-16 mx-auto text-muted-foreground/50" />
                    <p className="text-lg text-muted-foreground">
                      No image selected
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      Upload an image to see preview
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold">AI-Powered Detection</h3>
            <p className="text-sm text-muted-foreground">
              Advanced machine learning algorithms for accurate disease identification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold">Instant Results</h3>
            <p className="text-sm text-muted-foreground">
              Get analysis results in seconds with detailed confidence scores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mx-auto">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold">Track History</h3>
            <p className="text-sm text-muted-foreground">
              View all your previous analyses and track patterns over time
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AnalysisTools;
