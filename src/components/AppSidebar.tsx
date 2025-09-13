import { useState } from "react";
import { Flower2, History, User, Settings, LogOut, Activity, Upload, BarChart3 } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar 
} from "./ui/sidebar";

const sidebarItems = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: BarChart3,
    description: "View your detection dashboard"
  },
  { 
    title: "Analysis Tools", 
    url: "/analysis-tools", 
    icon: Activity,
    description: "Upload and analyze sunflower images" 
  },
  { 
    title: "History", 
    url: "/history", 
    icon: History,
    description: "View your detection history" 
  },
  { 
    title: "Profile", 
    url: "/profile", 
    icon: User,
    description: "Manage your account"
  },
  { 
    title: "Settings", 
    url: "/settings", 
    icon: Settings,
    description: "Configure detection settings"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  
  const getNavClass = (url: string) =>
    location.pathname === url
      ? "text-foreground"
      : "text-muted-foreground hover:text-foreground";

  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Flower2 className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <h3 className="font-bold text-lg text-foreground whitespace-nowrap overflow-hidden text-ellipsis">SunflowerScan</h3>
                <p className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">AI Disease Detection</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {!collapsed && user && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold text-foreground whitespace-nowrap overflow-hidden text-ellipsis">{user.username}</p>
                <p className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarGroup className="px-3">
            <SidebarGroupLabel className="text-sm font-semibold mb-3 px-2 text-foreground">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {sidebarItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={`flex items-start gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${getNavClass(item.url)}`}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        {!collapsed && (
                          <div className="flex-1 overflow-hidden space-y-0.5">
                            <div className="font-semibold text-sm leading-tight text-foreground whitespace-nowrap overflow-hidden text-ellipsis">{item.title}</div>
                            <div className="text-xs text-muted-foreground leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{item.description}</div>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto p-3 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-destructive/10 rounded-lg py-2"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {!collapsed && <span className="font-medium text-sm">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}