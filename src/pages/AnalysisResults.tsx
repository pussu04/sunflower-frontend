import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Download, 
  Share2,
  Clock,
  Brain,
  Activity,
  FileText,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

interface AnalysisResult {
  id: string;
  filename: string;
  uploadTime: string;
  analysisTime: string;
  status: 'healthy' | 'diseased' | 'uncertain';
  confidence: number;
  disease?: string;
  severity?: 'low' | 'medium' | 'high';
  recommendations: string[];
  imageUrl: string;
  technicalDetails: {
    modelVersion: string;
    processingTime: number;
    imageSize: string;
    resolution: string;
  };
}

const AnalysisResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    // Simulate loading and get result from location state or API
    const timer = setTimeout(() => {
      // Mock result - in real app, this would come from API or location state
      const mockResult: AnalysisResult = {
        id: "analysis_" + Date.now(),
        filename: location.state?.filename || "sunflower_leaf.jpg",
        uploadTime: new Date().toISOString(),
        analysisTime: new Date().toISOString(),
        status: Math.random() > 0.5 ? 'healthy' : 'diseased',
        confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
        disease: Math.random() > 0.5 ? 'Downy Mildew' : undefined,
        severity: Math.random() > 0.5 ? 'medium' : 'low',
        recommendations: [
          "Monitor plant regularly for symptom progression",
          "Ensure proper air circulation around plants",
          "Consider applying organic fungicide if symptoms worsen",
          "Remove affected leaves to prevent spread"
        ],
        imageUrl: location.state?.imageUrl || "/placeholder-sunflower.jpg",
        technicalDetails: {
          modelVersion: "SunflowerNet v2.1",
          processingTime: Math.floor(Math.random() * 3000) + 1000, // 1-4 seconds
          imageSize: "2.4 MB",
          resolution: "1920x1080"
        }
      };
      
      setResult(mockResult);
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [location.state]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'diseased': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      case 'uncertain': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'diseased': return <AlertTriangle className="w-5 h-5" />;
      case 'uncertain': return <Info className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const handleDownloadReport = () => {
    toast({
      title: "Report Downloaded",
      description: "Analysis report has been saved to your downloads folder.",
    });
  };

  const handleShareResults = () => {
    toast({
      title: "Results Shared",
      description: "Analysis results have been copied to clipboard.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mx-auto">
            <Brain className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold">Analyzing Your Image</h2>
            <p className="text-xl text-muted-foreground">
              Our AI is examining your sunflower leaf for disease detection...
            </p>
            <div className="max-w-md mx-auto">
              <Progress value={75} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">Processing... 75%</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">No Analysis Results Found</h2>
        <Button onClick={() => navigate('/analysis-tools')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Analysis Tools
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/analysis-tools')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Analysis Tools
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Analysis Results</h1>
            <p className="text-muted-foreground">
              Analysis completed on {new Date(result.analysisTime).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShareResults}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleDownloadReport}>
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Results */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${getStatusColor(result.status)}`}>
                  {getStatusIcon(result.status)}
                </div>
                Analysis Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge className={getStatusColor(result.status)} variant="secondary">
                    {result.status.toUpperCase()}
                  </Badge>
                  {result.disease && (
                    <p className="text-lg font-semibold mt-2">
                      Detected: {result.disease}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{result.confidence}%</p>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Confidence Level</span>
                  <span>{result.confidence}%</span>
                </div>
                <Progress value={result.confidence} className="h-2" />
              </div>

              {result.severity && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Severity:</span>
                  <Badge variant={result.severity === 'high' ? 'destructive' : 'secondary'}>
                    {result.severity.toUpperCase()}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recommendations
              </CardTitle>
              <CardDescription>
                Based on the analysis results, here are our recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm">{rec}</p>
                  </motion.li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Technical Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Model Version</p>
                  <p className="text-sm text-muted-foreground">{result.technicalDetails.modelVersion}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Processing Time</p>
                  <p className="text-sm text-muted-foreground">
                    {(result.technicalDetails.processingTime / 1000).toFixed(1)}s
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Image Size</p>
                  <p className="text-sm text-muted-foreground">{result.technicalDetails.imageSize}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Resolution</p>
                  <p className="text-sm text-muted-foreground">{result.technicalDetails.resolution}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Image Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Analyzed Image
              </CardTitle>
              <CardDescription>
                {result.filename}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden">
                <img
                  src={result.imageUrl}
                  alt="Analyzed sunflower leaf"
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='100' y='100' text-anchor='middle' dy='0.3em' font-family='Arial' font-size='14' fill='%236b7280'%3ESunflower Leaf%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Analysis Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Analysis Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Image Uploaded</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(result.uploadTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Analysis Started</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(result.analysisTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Results Generated</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(Date.now()).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalysisResults;
