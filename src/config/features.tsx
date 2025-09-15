import { Camera, History, Shield, Zap, Users, Award, BarChart3 } from "lucide-react";

// Hook to determine theme
const useThemeAwareImage = (darkImage: string, lightImage: string) => {
  if (typeof window !== 'undefined') {
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? darkImage : lightImage;
  }
  return lightImage;
};

export const features = [
  {
    title: "AI-Powered Detection",
    description: "Advanced machine learning algorithms trained on thousands of sunflower disease images for accurate diagnosis.",
    icon: <Zap className="w-6 h-6" />,
    image: "/lovable-uploads/imageai.png"
  },
  {
    title: "Image Upload & Analysis",
    description: "Simply upload photos of your sunflower plants and get instant disease diagnosis with treatment recommendations.",
    icon: <Camera className="w-6 h-6" />,
    get image() {
      return useThemeAwareImage("/lovable-uploads/image.png", "/lovable-uploads/image2.png");
    }
  },
  {
    title: "Detection History",
    description: "Track all your previous disease detections and monitor the health progression of your sunflower crops over time.",
    icon: <History className="w-6 h-6" />,
    image: "/lovable-uploads/imagedec.png"
  },
  {
    title: "Detailed Analytics",
    description: "Comprehensive reports and analytics on disease patterns, treatment effectiveness, and crop health insights.",
    icon: <BarChart3 className="w-6 h-6" />,
    image: "/lovable-uploads/imagedet.png"
  }
];