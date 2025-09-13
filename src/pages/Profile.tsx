import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { AccountStats } from "@/components/profile/AccountStats";
import { AccountSettings } from "@/components/profile/AccountSettings";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { User } from "@/services/api";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(user);

  if (!user || !currentUser) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Profile Not Available</h2>
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleChangeAvatar = () => {
    toast({
      title: "Coming Soon",
      description: "Avatar upload functionality will be available in a future update.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <ProfileHeader onEditProfile={handleEditProfile} />

      <div className="grid lg:grid-cols-3 gap-6">
        <ProfileCard 
          user={currentUser} 
          onChangeAvatar={handleChangeAvatar}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          <AccountStats userId={currentUser.id} />
          <AccountSettings />
        </motion.div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        user={currentUser}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
};

export default Profile;