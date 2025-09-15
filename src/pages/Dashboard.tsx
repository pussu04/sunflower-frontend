import { motion } from "framer-motion";
import { Upload, Flower2, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch analysis history on component mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiService.getSunflowerHistory();
        setAnalysisHistory(response.history || []);
      } catch (error) {
        console.error('Failed to fetch history:', error);
        setAnalysisHistory([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchHistory();
    } else {
      setIsLoading(false);
    }
  }, [user]);
  
  // Calculate statistics from actual data
  const totalAnalyses = analysisHistory.length;
  const diseaseDetected = analysisHistory.filter(item => 
    item.prediction && item.prediction.toLowerCase() !== 'healthy'
  ).length;
  const normalResults = analysisHistory.filter(item => 
    item.prediction && item.prediction.toLowerCase() === 'healthy'
  ).length;
  
  const analysisStats = [
    { title: "Total Analyses", value: totalAnalyses.toString(), icon: Activity, change: null },
    { title: "Sunflower Scans", value: totalAnalyses.toString(), icon: Flower2, change: null },
    { title: "Disease Detected", value: diseaseDetected.toString(), icon: AlertTriangle, change: null },
    { title: "Normal Results", value: normalResults.toString(), icon: TrendingUp, change: null },
  ];

  const handleStartAnalysis = () => {
    navigate('/analysis-tools');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">SunflowerScan Dashboard</h1>
          <p className="text-muted-foreground">
            {user ? `Welcome back, ${user.username}! ` : ''}AI-powered sunflower disease detection and monitoring
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        {analysisStats.map((stat, index) => {
          const isZero = stat.value === "0";
          return (
            <Card key={stat.title} className={isZero ? "opacity-75" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${
                  stat.title === "Disease Detected" && !isZero ? "text-red-500" :
                  stat.title === "Normal Results" && !isZero ? "text-green-500" :
                  stat.title === "Sunflower Scans" && !isZero ? "text-yellow-500" :
                  "text-muted-foreground"
                }`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  stat.title === "Disease Detected" && !isZero ? "text-red-600" :
                  stat.title === "Normal Results" && !isZero ? "text-green-600" :
                  stat.title === "Sunflower Scans" && !isZero ? "text-yellow-600" :
                  "text-foreground"
                }`}>
                  {isLoading ? "..." : stat.value}
                </div>
                {!isZero && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.title === "Disease Detected" ? "Requires attention" :
                     stat.title === "Normal Results" ? "Healthy plants" :
                     stat.title === "Total Analyses" ? "Analysis completed" :
                     "Images processed"}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Analysis Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-6"
      >
        {/* Sunflower Disease Detection */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                <Flower2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-foreground">Sunflower Disease Detection</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Upload sunflower leaf images for AI-powered disease detection and get instant results
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Flower2 className="w-4 h-4 text-blue-500" />
                  <span>AI-Powered Detection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-green-500" />
                  <span>~30 seconds processing</span>
                </div>
              </div>
              <Button 
                onClick={handleStartAnalysis}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:opacity-90 text-white text-lg py-6"
              >
                <Upload className="w-5 h-5 mr-2" />
                {totalAnalyses === 0 ? "Start Your First Analysis" : "Upload New Image"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Doctor Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50/10 to-yellow-50/10 dark:border-orange-700/30 dark:from-orange-900/10 dark:to-yellow-900/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <CardTitle className="text-foreground">Agricultural Insights</CardTitle>
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full dark:bg-orange-900 dark:text-orange-200">
                  {diseaseDetected > 0 ? diseaseDetected : "New"}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View Details
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gradient-to-r from-purple-50/20 to-blue-50/20 rounded-lg border border-purple-200/20 dark:from-purple-900/10 dark:to-blue-900/10 dark:border-purple-700/20">
              <div className="flex items-start gap-3">
                <Flower2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0 dark:text-purple-400" />
                <div>
                  <h4 className="font-medium text-purple-900 mb-2 dark:text-purple-100">
                    {totalAnalyses === 0 ? "Welcome to SunflowerScan.ai" : 
                     diseaseDetected > 0 ? "Disease Detection Alert" :
                     "Healthy Plants Detected"}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    {totalAnalyses === 0 ? 
                      "Start your agricultural monitoring journey with our AI-powered plant disease detection." :
                     diseaseDetected > 0 ? 
                      `${diseaseDetected} of your ${totalAnalyses} scans show potential disease. Review your analysis history for detailed recommendations.` :
                      `All ${totalAnalyses} of your scans show healthy plants. Keep monitoring for early detection.`}
                  </p>
                  <Button 
                    size="sm" 
                    onClick={() => totalAnalyses === 0 ? handleStartAnalysis() : navigate('/history')}
                    className="bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-600"
                  >
                    {totalAnalyses === 0 ? "Upload First Image" : "View Analysis History"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;