import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

interface AccountStatsProps {
  userId: number;
}

interface AnalysisStats {
  totalAnalyses: number;
  successfulAnalyses: number;
  recentAnalyses: number;
  accountAge: string;
}

export const AccountStats = ({ userId }: AccountStatsProps) => {
  const [stats, setStats] = useState<AnalysisStats>({
    totalAnalyses: 0,
    successfulAnalyses: 0,
    recentAnalyses: 0,
    accountAge: "New User"
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch user's analysis history to calculate stats
        const historyResponse = await apiService.getSunflowerHistory();
        
        if (historyResponse && historyResponse.data) {
          const analyses = historyResponse.data;
          const totalAnalyses = analyses.length;
          const successfulAnalyses = analyses.filter((analysis: any) => 
            analysis.confidence > 0.7
          ).length;
          
          // Calculate recent analyses (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const recentAnalyses = analyses.filter((analysis: any) => 
            new Date(analysis.created_at) > thirtyDaysAgo
          ).length;

          // Calculate account age
          const accountAge = calculateAccountAge(user?.created_at || '');

          setStats({
            totalAnalyses,
            successfulAnalyses,
            recentAnalyses,
            accountAge
          });
        }
      } catch (error) {
        console.error('Failed to fetch analysis stats:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId, user]);

  const calculateAccountAge = (createdAt: string): string => {
    if (!createdAt) return "New User";
    
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''}`;
    }
  };

  const accountStats = [
    { 
      label: "Total Analyses", 
      value: loading ? "..." : stats.totalAnalyses.toString(), 
      color: "bg-blue-500" 
    },
    { 
      label: "Successful Scans", 
      value: loading ? "..." : stats.successfulAnalyses.toString(), 
      color: "bg-green-500" 
    },
    { 
      label: "Recent Activity", 
      value: loading ? "..." : `${stats.recentAnalyses} this month`, 
      color: "bg-purple-500" 
    },
    { 
      label: "Account Age", 
      value: loading ? "..." : stats.accountAge, 
      color: "bg-orange-500" 
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Statistics</CardTitle>
        <CardDescription>Your analysis activity and account metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {accountStats.map((stat, index) => (
            <motion.div 
              key={index} 
              className="flex items-center gap-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
              <div className="flex-1">
                <p className="text-sm font-medium">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
