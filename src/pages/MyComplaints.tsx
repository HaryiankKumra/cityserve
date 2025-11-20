import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  reporter_id: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  assigned_department_id: string | null;
}

const statusColors = {
  new: "status-badge-new",
  in_progress: "status-badge-in-progress",
  resolved: "status-badge-resolved",
  closed: "status-badge-closed",
};

export default function MyComplaints() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchComplaints();
  }, [user, navigate]);

  const fetchComplaints = async () => {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("reporter_id", user?.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching complaints:", error);
    } else {
      setComplaints(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Complaints</h1>
          <p className="text-muted-foreground">
            Track the status of your submitted complaints
          </p>
        </div>

        {complaints.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't submitted any complaints yet
              </p>
              <Button onClick={() => navigate("/submit")}>
                Submit Your First Complaint
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-xl">{complaint.title}</CardTitle>
                      <CardDescription>
                        ID: {complaint.id}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[complaint.status as keyof typeof statusColors]}>
                      {complaint.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {complaint.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">
                        <span className="font-medium">Category:</span>{" "}
                        {complaint.category.replace("_", " ")}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Submitted:</span>{" "}
                        {format(new Date(complaint.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/complaint/${complaint.id}`)}
                    >
                      View Details
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}