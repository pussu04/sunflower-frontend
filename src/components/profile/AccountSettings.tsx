import { motion } from "framer-motion";
import { Bell, Shield, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";

export const AccountSettings = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const handleExportData = async () => {
    try {
      if (!user) return;
      
      // Fetch user's analysis history
      const historyResponse = await apiService.getSunflowerHistory();
      
      const exportData = {
        user: {
          username: user.username,
          email: user.email,
          age: user.age,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        analyses: historyResponse.data || []
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `sunflower-account-data-${user.username}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "Your account data has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export account data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data including analysis history."
    );
    
    if (confirmed) {
      try {
        await apiService.deleteUser(user.id);
        
        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted.",
        });
        
        logout();
      } catch (error) {
        toast({
          title: "Deletion Failed",
          description: "Failed to delete account. Please try again or contact support.",
          variant: "destructive",
        });
      }
    }
  };

  const handleNotificationSettings = () => {
    toast({
      title: "Coming Soon",
      description: "Notification settings will be available in a future update.",
    });
  };

  const handleSecuritySettings = () => {
    toast({
      title: "Coming Soon",
      description: "Security settings will be available in a future update.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Manage your preferences and security settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <motion.div 
          className="flex items-center justify-between p-3 border rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive analysis results via email</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleNotificationSettings}>
            Configure
          </Button>
        </motion.div>

        <motion.div 
          className="flex items-center justify-between p-3 border rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Security Settings</p>
              <p className="text-sm text-muted-foreground">Manage password and security preferences</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSecuritySettings}>
            Manage
          </Button>
        </motion.div>

        <Separator />

        <motion.div 
          className="pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h4 className="font-medium mb-3 text-orange-600">Data Management</h4>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start text-blue-600 border-blue-200 hover:bg-blue-50"
              onClick={handleExportData}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Account Data
            </Button>
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};
