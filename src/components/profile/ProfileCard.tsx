import { motion } from "framer-motion";
import { Mail, Phone, Calendar, MapPin, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "@/services/api";

interface ProfileCardProps {
  user: User;
  onChangeAvatar: () => void;
}

export const ProfileCard = ({ user, onChangeAvatar }: ProfileCardProps) => {
  const getInitials = (username: string) => {
    return username.split(' ').map(name => name.charAt(0).toUpperCase()).join('').slice(0, 2);
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="lg:col-span-1"
    >
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-2 -right-2 rounded-full p-2"
                onClick={onChangeAvatar}
              >
                <Camera className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <CardTitle className="text-xl">{user.username}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
          <Badge variant="secondary" className="w-fit mx-auto mt-2">
            Active Account
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{user.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Age: {user.age} years</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">Joined {formatJoinDate(user.created_at)}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
