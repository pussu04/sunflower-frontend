import { motion } from "framer-motion";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  onEditProfile: () => void;
}

export const ProfileHeader = ({ onEditProfile }: ProfileHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between"
    >
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account information and preferences</p>
      </div>
      <Button onClick={onEditProfile}>
        <Edit className="w-4 h-4 mr-2" />
        Edit Profile
      </Button>
    </motion.div>
  );
};
