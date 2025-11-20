import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Search, ArrowLeft, MapPin, Calendar, User } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  new: "status-badge-new",
  in_progress: "status-badge-in-progress",
  resolved: "status-badge-resolved",
  closed: "status-badge-closed",
};

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

export default function TrackComplaint() {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState("");
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingId.trim()) {
      toast.error("Please enter a tracking ID");
      return;
    }

    setLoading(true);
    setSearched(true);

    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .eq("id", trackingId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching complaint:", error);
      toast.error("Failed to search complaint");
    } else if (!data) {
      toast.error("Complaint not found");
      setComplaint(null);
    } else {
      setComplaint(data);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Track Your Complaint
            </CardTitle>
            <CardDescription>
              Enter your tracking ID to check the status of your complaint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter Tracking ID (e.g., CC-2025-123456)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  className="font-mono"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {searched && !complaint && !loading && (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No complaint found with tracking ID: <span className="font-mono font-semibold">{trackingId}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please check your tracking ID and try again
              </p>
            </CardContent>
          </Card>
        )}

        {complaint && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{complaint.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <span className="font-mono text-base">ID: {complaint.id}</span>
                    <Separator orientation="vertical" className="h-4" />
                    <span>{complaint.category.replace("_", " ")}</span>
                  </CardDescription>
                </div>
                <Badge className={statusColors[complaint.status as keyof typeof statusColors]}>
                  {complaint.status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{complaint.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Submitted</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(complaint.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Priority</p>
                      <p className="text-sm text-muted-foreground capitalize">{complaint.priority}</p>
                    </div>
                  </div>
                </div>

                {complaint.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{complaint.address}</p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold mb-3">Complaint Timeline</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                      <div className="w-0.5 h-full bg-border" />
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium">Complaint Submitted</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(complaint.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>

                  {complaint.status !== "new" && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                        {complaint.status !== "closed" && <div className="w-0.5 h-full bg-border" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium">Status Updated</p>
                        <p className="text-xs text-muted-foreground">
                          Currently: {complaint.status.replace("_", " ").toUpperCase()}
                        </p>
                      </div>
                    </div>
                  )}

                  {complaint.status === "resolved" || complaint.status === "closed" ? (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-success mt-1" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Complaint {complaint.status === "resolved" ? "Resolved" : "Closed"}</p>
                        <p className="text-xs text-muted-foreground">
                          Thank you for your patience
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30 mt-1" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Awaiting Resolution</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
