import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Chatbot } from "@/components/Chatbot";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useUserRole } from "@/hooks/useUserRole";
import {
  FileText,
  Search,
  BarChart3,
  Building2,
  Settings,
  Shield,
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  useSessionTimeout();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  if (!user) return null;

  const quickActions = [
    {
      title: "Submit Complaint",
      description: "Report a new civic issue",
      icon: <FileText className="h-8 w-8" />,
      onClick: () => navigate("/submit"),
      color: "text-blue-500",
    },
    {
      title: "Track Complaint",
      description: "Check status of your complaints",
      icon: <Search className="h-8 w-8" />,
      onClick: () => navigate("/track"),
      color: "text-green-500",
    },
    {
      title: "My Complaints",
      description: "View all your submitted complaints",
      icon: <FileText className="h-8 w-8" />,
      onClick: () => navigate("/my-complaints"),
      color: "text-purple-500",
    },
    {
      title: "Analytics",
      description: "View complaint statistics",
      icon: <BarChart3 className="h-8 w-8" />,
      onClick: () => navigate("/about"),
      color: "text-orange-500",
    },
    {
      title: "Departments",
      description: "Browse city departments",
      icon: <Building2 className="h-8 w-8" />,
      onClick: () => navigate("/departments"),
      color: "text-pink-500",
    },
    {
      title: "Settings",
      description: "Manage your profile",
      icon: <Settings className="h-8 w-8" />,
      onClick: () => navigate("/settings"),
      color: "text-gray-500",
    },
  ];

  const adminActions = isAdmin ? [
    {
      title: "Admin Dashboard",
      description: "Manage system and complaints",
      icon: <Shield className="h-8 w-8" />,
      onClick: () => navigate("/admin"),
      color: "text-red-500",
    },
  ] : [];

  const allActions = [...quickActions, ...adminActions];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">What would you like to do today?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {allActions.map((action, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={action.onClick}
            >
              <CardHeader>
                <div className={`${action.color} mb-4`}>
                  {action.icon}
                </div>
                <CardTitle>{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
                <p className="text-muted-foreground">
                  Chat with our AI assistant or browse our help center
                </p>
              </div>
              <Button variant="outline" onClick={() => navigate("/about")}>
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Chatbot />
    </div>
  );
}
