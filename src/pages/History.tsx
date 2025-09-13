import { motion } from "framer-motion";
import { Calendar, Clock, AlertCircle, CheckCircle, FileText, Download, Image as ImageIcon, Loader2, Eye, X, FileDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface AnalysisHistoryItem {
  id: number;
  user_id: number;
  predicted_class: string;
  confidence: number;
  all_predictions: Record<string, number>;
  image_info: {
    filename: string;
    size: string;
    processing_time: number;
  };
  images: {
    original_image_url: string;
  };
  created_at: string;
  // Legacy fallback fields for backward compatibility
  original_image_url?: string;
  image_url?: string;
  cloudinary_url?: string;
  image_filename?: string;
  image_size?: string;
  processing_time?: number;
}

const History = () => {
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState<number | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    fetchAnalysisHistory();
  }, []);

  const fetchAnalysisHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSunflowerHistory();
      console.log('🔍 Full API Response:', response);
      if (response.status === 'success' && response.history) {
        console.log('📊 Analysis History Data:', response.history);
        console.log('🖼️ First item structure:', response.history[0]);
        // Debug: Log each item to check image URLs
        response.history.forEach((item: any, index: number) => {
          console.log(`📸 Item ${index + 1} DETAILED:`, {
            id: item.id,
            images: item.images,
            image_info: item.image_info,
            original_image_url: item.original_image_url,
            image_url: item.image_url,
            cloudinary_url: item.cloudinary_url,
            allKeys: Object.keys(item),
            fullItem: item
          });
        });
        setAnalysisHistory(response.history);
      } else {
        setError('Failed to fetch analysis history');
      }
    } catch (err: any) {
      console.error('❌ API Error:', err);
      setError(err.message || 'Failed to fetch analysis history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const getHealthStatus = (predictedClass: string) => {
    return predictedClass === 'Fresh Leaf' ? 'Healthy' : 'Disease Detected';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const openImagePreview = (imageUrl: string) => {
    // Process Cloudinary URL for better loading
    let processedUrl = imageUrl;
    if (imageUrl && imageUrl.includes('cloudinary.com')) {
      // Ensure proper Cloudinary transformations
      if (imageUrl.includes('/upload/') && !imageUrl.includes('q_auto')) {
        processedUrl = imageUrl.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
      }
    }
    console.log('Opening image preview:', processedUrl);
    setSelectedImage(processedUrl);
    setIsPreviewOpen(true);
  };

  const closeImagePreview = () => {
    setSelectedImage(null);
    setIsPreviewOpen(false);
  };

  const generatePDF = async (analysis: AnalysisHistoryItem) => {
    try {
      setDownloadingPdf(analysis.id);
      const pdf = new jsPDF();
      const { date, time } = formatDate(analysis.created_at);
      const healthStatus = getHealthStatus(analysis.predicted_class);
      
      // Title
      pdf.setFontSize(20);
      pdf.text('Sunflower Disease Analysis Report', 20, 30);
      
      // Basic info
      pdf.setFontSize(12);
      pdf.text(`Analysis ID: #${analysis.id}`, 20, 50);
      pdf.text(`Date: ${date} • ${time}`, 20, 65);
      pdf.text(`Image: ${analysis.image_filename}`, 20, 80);
      
      // Add image if available
      const imageUrl = analysis.original_image_url || analysis.image_url || analysis.cloudinary_url;
      if (imageUrl) {
        try {
          // Create a promise to load the image with proper Cloudinary handling
          const loadImage = (url: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
              const img = new Image();
              
              // Handle Cloudinary URLs properly
              let imageUrl = url;
              if (url.includes('cloudinary.com')) {
                // Add transformation parameters for better loading
                if (!url.includes('/upload/')) {
                  imageUrl = url;
                } else {
                  // Insert quality and format parameters
                  imageUrl = url.replace('/upload/', '/upload/q_auto,f_auto/');
                }
              }
              
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                console.log('PDF Image loaded successfully:', imageUrl);
                resolve(img);
              };
              img.onerror = (error) => {
                console.error('PDF Image failed to load:', imageUrl, error);
                reject(error);
              };
              img.src = imageUrl;
            });
          };
          
          const img = await loadImage(imageUrl);
          
          // Create canvas to convert image to base64
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas size (maintain aspect ratio)
          const maxWidth = 80;
          const maxHeight = 80;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            
            // Add image to PDF (left side)
            pdf.addImage(imageData, 'JPEG', 20, 100, width, height);
            console.log('Image added to PDF successfully');
          }
        } catch (error) {
          console.warn('Could not load image for PDF:', error);
          // Add a placeholder text instead of image
          pdf.setFontSize(10);
          pdf.text('Image could not be loaded', 20, 120);
          pdf.text('for PDF generation', 20, 135);
        }
      }
      
      // Analysis results (right side)
      const rightColumnX = 120;
      pdf.setFontSize(14);
      pdf.text('Analysis Results', rightColumnX, 100);
      
      pdf.setFontSize(12);
      pdf.text(`Health Status: ${healthStatus}`, rightColumnX, 120);
      pdf.text(`Predicted Class: ${analysis.predicted_class}`, rightColumnX, 135);
      pdf.text(`Confidence: ${((analysis.confidence || 0) * 100).toFixed(1)}%`, rightColumnX, 150);
      pdf.text(`Processing Time: ${analysis.image_info?.processing_time?.toFixed(2) || analysis.processing_time?.toFixed(2) || 'N/A'}s`, rightColumnX, 165);
      pdf.text(`Image Size: ${analysis.image_info?.size || analysis.image_size || 'N/A'}`, rightColumnX, 180);
      
      // All predictions if available
      if (analysis.all_predictions) {
        let predictions;
        try {
          if (typeof analysis.all_predictions === 'string') {
            predictions = JSON.parse(analysis.all_predictions);
          } else {
            predictions = analysis.all_predictions;
          }
          
          pdf.setFontSize(14);
          pdf.text('All Predictions:', rightColumnX, 200);
          
          pdf.setFontSize(10);
          let yPos = 215;
          Object.entries(predictions).forEach(([label, confidence]) => {
            pdf.text(`${label}: ${((confidence as number) * 100).toFixed(1)}%`, rightColumnX, yPos);
            yPos += 12;
          });
        } catch (error) {
          console.error('Error parsing predictions for PDF:', error);
        }
      }
      
      pdf.save(`sunflower-analysis-${analysis.id}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setDownloadingPdf(null);
    }
  };

  const generateAllPDFs = async () => {
    try {
      setDownloadingAll(true);
      const pdf = new jsPDF();
      
      // Title page
      pdf.setFontSize(24);
      pdf.text('Sunflower Disease Analysis', 20, 30);
      pdf.setFontSize(16);
      pdf.text('Complete History Report', 20, 50);
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 70);
      pdf.text(`Total Analyses: ${analysisHistory.length}`, 20, 85);
      
      let yPos = 110;
      
      analysisHistory.forEach((analysis, index) => {
        if (yPos > 250) {
          pdf.addPage();
          yPos = 30;
        }
        
        const { date, time } = formatDate(analysis.created_at);
        const healthStatus = getHealthStatus(analysis.predicted_class);
        
        pdf.setFontSize(14);
        pdf.text(`Analysis #${analysis.id}`, 20, yPos);
        yPos += 15;
        
        pdf.setFontSize(10);
        pdf.text(`Date: ${date} ${time}`, 25, yPos);
        pdf.text(`Status: ${healthStatus}`, 25, yPos + 12);
        pdf.text(`Confidence: ${((analysis.confidence || 0) * 100).toFixed(1)}%`, 25, yPos + 24);
        pdf.text(`Class: ${analysis.predicted_class}`, 25, yPos + 36);
        
        yPos += 55;
      });
      
      pdf.save('sunflower-analysis-complete-history.pdf');
      toast.success('Complete history PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating complete PDF:', error);
      toast.error('Failed to generate complete PDF');
    } finally {
      setDownloadingAll(false);
    }
  };

  const exportToCSV = () => {
    try {
      const headers = ['ID', 'Date', 'Time', 'Filename', 'Predicted Class', 'Confidence', 'Processing Time', 'Image Size'];
      const csvContent = [headers.join(',')];
      
      analysisHistory.forEach(analysis => {
        const { date, time } = formatDate(analysis.created_at);
        const row = [
          analysis.id,
          date,
          time,
          analysis.image_info?.filename || analysis.image_filename || 'sunflower_analysis.jpg',
          analysis.predicted_class,
          ((analysis.confidence || 0) * 100).toFixed(1) + '%',
          (analysis.image_info?.processing_time || analysis.processing_time || 0).toFixed(2) + 's',
          analysis.image_info?.size || analysis.image_size || 'N/A'
        ];
        csvContent.push(row.join(','));
      });
      
      const blob = new Blob([csvContent.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sunflower-analysis-history.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('CSV exported successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
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
          <h1 className="text-3xl font-bold">Analysis History</h1>
          <p className="text-muted-foreground">View your past analyses and download reports</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-bold">{analysisHistory.length}</span>
            </div>
            <span className="text-sm font-medium">Sunflower Disease Analysis History</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={generateAllPDFs}
              disabled={downloadingAll || analysisHistory.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              {downloadingAll ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 mr-2" />
              )}
              Download All PDFs
            </Button>
            <Button 
              onClick={exportToCSV}
              disabled={analysisHistory.length === 0}
              className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Loading Analysis History</h3>
          <p className="text-muted-foreground">Please wait while we fetch your analysis data...</p>
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">Error Loading History</h3>
          <p className="text-muted-foreground mb-6 max-w-md">{error}</p>
          <Button onClick={fetchAnalysisHistory} className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:opacity-90 text-white">
            <FileText className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </motion.div>
      ) : analysisHistory.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center mb-6">
            <FileText className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No Analysis History Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start analyzing sunflower images to see your analysis history here. 
            All your past scans and results will be stored securely.
          </p>
          <Button 
            onClick={() => window.location.href = '/analysis-tools'}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:opacity-90 text-white"
          >
            <FileText className="w-4 h-4 mr-2" />
            Start First Analysis
          </Button>
        </motion.div>
      ) : (
        /* Analysis History Grid - Brain Tumor Style Layout */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {analysisHistory.map((analysis, index) => {
            const { date, time } = formatDate(analysis.created_at);
            const healthStatus = getHealthStatus(analysis.predicted_class);
            const isHealthy = healthStatus === 'Healthy';
            // Access image URL from correct nested structure based on backend to_dict() method
            const imageUrl = analysis.images?.original_image_url || 
                           analysis.original_image_url || 
                           analysis.image_url || 
                           analysis.cloudinary_url;
            
            console.log(`🔍 Analysis ${analysis.id} URL search:`, {
              nestedImageUrl: analysis.images?.original_image_url,
              legacyImageUrl: analysis.original_image_url,
              selectedUrl: imageUrl,
              hasSelectedUrl: !!imageUrl
            });
            
            return (
              <Card key={analysis.id} className="relative overflow-hidden hover:shadow-xl hover:shadow-gray-900/50 transition-all duration-300 bg-gray-900 text-white border-gray-700 hover:border-gray-600">
                {/* Status Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <Badge 
                    variant={isHealthy ? "secondary" : "destructive"}
                    className={`${isHealthy ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white border-0`}
                  >
                    {analysis.predicted_class}
                  </Badge>
                </div>
                
                {/* Action Buttons */}
                <div className="absolute top-3 right-3 z-10 flex gap-1">
                  {imageUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openImagePreview(imageUrl)}
                      title="Preview Image"
                      className="bg-black/50 hover:bg-black/70 text-white border-0 h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => generatePDF(analysis)}
                    disabled={downloadingPdf === analysis.id}
                    title="Download PDF Report"
                    className="bg-black/50 hover:bg-black/70 text-white border-0 h-8 w-8 p-0"
                  >
                    {downloadingPdf === analysis.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {/* Main Image */}
                <div 
                  className="aspect-square bg-gray-900 flex items-center justify-center cursor-pointer relative overflow-hidden"
                  onClick={() => {
                    if (imageUrl) {
                      openImagePreview(imageUrl);
                    } else {
                      console.log('No image URL available for analysis', analysis.id);
                    }
                  }}
                >
                  {(() => {
                    console.log(`🖼️ RENDERING IMAGE for Analysis ${analysis.id}:`, {
                      imageUrl,
                      hasImageUrl: !!imageUrl,
                      original_image_url: analysis.original_image_url,
                      image_url: analysis.image_url,
                      cloudinary_url: analysis.cloudinary_url,
                      allAnalysisKeys: Object.keys(analysis)
                    });
                    
                    return imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={`Analysis ${analysis.id}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.error('❌ Image failed to load for Analysis', analysis.id, ':', {
                            attemptedUrl: imageUrl,
                            error: e,
                            retried: target.dataset.retried
                          });
                          
                          // Try Cloudinary fallback if not already tried
                          if (imageUrl && imageUrl.includes('cloudinary.com') && !target.dataset.retried) {
                            target.dataset.retried = 'true';
                            const fallbackUrl = imageUrl.replace('/upload/', '/upload/q_auto,f_auto,c_fill,w_400,h_400/');
                            console.log('🔄 Trying Cloudinary fallback:', fallbackUrl);
                            target.src = fallbackUrl;
                            return;
                          }
                          
                          // Show icon fallback
                          target.style.display = 'none';
                          const iconElement = target.parentElement?.querySelector('.lucide-image');
                          if (iconElement) {
                            iconElement.classList.remove('hidden');
                          }
                        }}
                        onLoad={() => {
                          console.log('✅ Image loaded successfully for Analysis', analysis.id, ':', imageUrl);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                        <ImageIcon className="w-16 h-16 mb-2" />
                        <span className="text-xs">No Image URL</span>
                        <span className="text-xs mt-1">ID: {analysis.id}</span>
                      </div>
                    );
                  })()}
                  <ImageIcon className={`w-16 h-16 text-gray-600 ${imageUrl ? 'hidden' : ''} lucide-image`} />
                </div>

                {/* Card Content */}
                <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {/* Confidence */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-400 font-medium">Confidence:</span>
                    <span className={`text-base sm:text-lg font-bold ${getConfidenceColor(analysis.confidence || 0)}`}>
                      {((analysis.confidence || 0) * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* File Info */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-400 font-medium">File:</span>
                    <span className="text-xs sm:text-sm text-gray-100 truncate max-w-[100px] sm:max-w-[120px]" title={analysis.image_info?.filename || analysis.image_filename}>
                      {analysis.image_info?.filename || analysis.image_filename}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-400 font-medium">Date:</span>
                    <span className="text-xs sm:text-sm text-gray-100">
                      {date}
                    </span>
                  </div>

                  {/* Size */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-400 font-medium">Size:</span>
                    <span className="text-xs sm:text-sm text-gray-100">
                      {analysis.image_info?.size || analysis.image_size}
                    </span>
                  </div>

                  {/* All Predictions - Responsive */}
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="text-xs sm:text-sm font-semibold text-gray-300 mb-2 tracking-wide">All Predictions:</div>
                    <div className="space-y-1.5">
                      {(() => {
                        let predictions;
                        try {
                          if (typeof analysis.all_predictions === 'string') {
                            predictions = JSON.parse(analysis.all_predictions);
                          } else {
                            predictions = analysis.all_predictions;
                          }
                          
                          return Object.entries(predictions || {}).map(([className, confidence]) => {
                            const percentage = ((confidence as number) * 100).toFixed(1);
                            const isHighConfidence = (confidence as number) > 0.5;
                            
                            return (
                              <div key={className} className="flex justify-between items-center py-0.5">
                                <span className="text-xs sm:text-sm text-gray-200 font-medium truncate pr-2">
                                  {className}:
                                </span>
                                <div className="flex items-center gap-2 min-w-0">
                                  {/* Progress bar for visual representation */}
                                  <div className="hidden sm:block w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        isHighConfidence ? 'bg-green-500' : 'bg-blue-400'
                                      }`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className={`text-xs sm:text-sm font-bold min-w-[40px] text-right ${
                                    isHighConfidence ? 'text-green-400' : 'text-white'
                                  }`}>
                                    {percentage}%
                                  </span>
                                </div>
                              </div>
                            );
                          });
                        } catch (e) {
                          return (
                            <div className="text-xs sm:text-sm text-gray-400 italic text-center py-2">
                              No prediction data available
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>

                  {/* Processed indicator */}
                  <div className="flex items-center justify-center pt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Processed
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>
      )}
      
      {/* Image Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl font-semibold">Image Preview & Analysis</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-0">
            {selectedImage && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left side - Image */}
                <div className="relative">
                  <div className="bg-muted rounded-lg p-4">
                    <img 
                      src={selectedImage} 
                      alt="Analysis Preview"
                      className="w-full h-auto max-h-[60vh] object-contain rounded-lg shadow-lg"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.error('Preview image failed to load:', selectedImage);
                        // Try to reload with different Cloudinary parameters
                        if (selectedImage && selectedImage.includes('cloudinary.com') && !target.dataset.retried) {
                          target.dataset.retried = 'true';
                          const fallbackUrl = selectedImage.replace('/upload/', '/upload/q_auto,f_auto,c_scale,w_600/');
                          target.src = fallbackUrl;
                        } else {
                          // Show error state
                          target.style.display = 'none';
                          const errorDiv = document.createElement('div');
                          errorDiv.className = 'flex items-center justify-center h-64 bg-gray-100 rounded-lg';
                          errorDiv.innerHTML = '<p class="text-gray-500">Image could not be loaded</p>';
                          target.parentElement?.appendChild(errorDiv);
                        }
                      }}
                      onLoad={() => {
                        console.log('Preview image loaded successfully:', selectedImage);
                      }}
                    />
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                    onClick={() => window.open(selectedImage, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Original
                  </Button>
                </div>
                
                {/* Right side - Analysis Details */}
                <div className="space-y-4">
                  {(() => {
                    // Find the analysis data for this image
                    const currentAnalysis = analysisHistory.find(a => a.original_image_url === selectedImage);
                    if (!currentAnalysis) return null;
                    
                    const { date, time } = formatDate(currentAnalysis.created_at);
                    const healthStatus = getHealthStatus(currentAnalysis.predicted_class);
                    const isHealthy = healthStatus === 'Healthy';
                    
                    return (
                      <>
                        <div className="border-b pb-4">
                          <h3 className="text-lg font-semibold mb-2">Analysis #{currentAnalysis.id}</h3>
                          <p className="text-sm text-muted-foreground">{date} • {time}</p>
                          <p className="text-sm text-muted-foreground">{currentAnalysis.image_info?.filename || currentAnalysis.image_filename}</p>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Health Status:</span>
                            <Badge variant={isHealthy ? "secondary" : "destructive"}>
                              {isHealthy ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                              {currentAnalysis.predicted_class}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Confidence:</span>
                            <span className={`text-lg font-bold ${getConfidenceColor(currentAnalysis.confidence || 0)}`}>
                              {((currentAnalysis.confidence || 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Processing Time:</span>
                            <span>{(currentAnalysis.image_info?.processing_time || currentAnalysis.processing_time || 0).toFixed(2)}s</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Image Size:</span>
                            <span>{currentAnalysis.image_info?.size || currentAnalysis.image_size}</span>
                          </div>
                        </div>
                        
                        {/* All Predictions */}
                        {currentAnalysis.all_predictions && (() => {
                          let predictions;
                          try {
                            if (typeof currentAnalysis.all_predictions === 'string') {
                              predictions = JSON.parse(currentAnalysis.all_predictions);
                            } else {
                              predictions = currentAnalysis.all_predictions;
                            }
                          } catch (error) {
                            console.error('Error parsing predictions:', error);
                            return null;
                          }
                          
                          return (
                            <div className="border-t pt-4">
                              <h4 className="font-medium mb-3">All Predictions:</h4>
                              <div className="space-y-2">
                                {Object.entries(predictions)
                                  .sort(([,a], [,b]) => (b as number) - (a as number))
                                  .map(([label, confidence]) => (
                                  <div key={label} className="flex items-center justify-between">
                                    <span className="text-sm">{label}:</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all"
                                          style={{ width: `${(confidence as number) * 100}%` }}
                                        />
                                      </div>
                                      <span className="text-sm font-medium w-12 text-right">
                                        {((confidence as number) * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                        
                        <div className="pt-4">
                          <Button 
                            onClick={() => generatePDF(currentAnalysis)}
                            disabled={downloadingPdf === currentAnalysis.id}
                            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90"
                          >
                            {downloadingPdf === currentAnalysis.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <FileDown className="w-4 h-4 mr-2" />
                            )}
                            Download PDF Report
                          </Button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default History;