import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, AlertCircle, Clock, CheckCircle2, XCircle, MapPin, Building2, Users } from "lucide-react";
import { format } from "date-fns";
import { ComplaintMap } from "@/components/ComplaintMap";
import { DepartmentManager } from "@/components/DepartmentManager";

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
  departments?: {
    name: string;
  };
}

interface Department {
  id: string;
  name: string;
  is_active: boolean;
}

const statusColors = {
  new: "status-badge-new",
  in_progress: "status-badge-in-progress",
  resolved: "status-badge-resolved",
  closed: "status-badge-closed",
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ new: 0, in_progress: 0, resolved: 0, closed: 0 });
  const [selectedComplaint, setSelectedComplaint] = useState<string | null>(null);
  const [assignDepartmentId, setAssignDepartmentId] = useState<string>("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!roleLoading && !isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }

    if (isAdmin) {
      fetchComplaints();
      fetchDepartments();
      setupRealtimeSubscription();
    }
  }, [user, isAdmin, roleLoading, navigate]);

  const fetchComplaints = async () => {
    const { data, error } = await supabase
      .from("complaints")
      .select(`
        *,
        departments (
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching complaints:", error);
      toast.error("Failed to load complaints");
    } else {
      setComplaints(data || []);
      calculateStats(data || []);
    }
    setLoading(false);
  };

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from("departments")
      .select("id, name, is_active")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching departments:", error);
    } else {
      setDepartments(data || []);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("admin-complaints")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "complaints",
        },
        () => {
          fetchComplaints();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const calculateStats = (data: Complaint[]) => {
    const stats = data.reduce(
      (acc, complaint) => {
        acc[complaint.status as keyof typeof acc]++;
        return acc;
      },
      { new: 0, in_progress: 0, resolved: 0, closed: 0 }
    );
    setStats(stats);
  };

  const updateComplaintStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("complaints")
      .update({ status: status as any })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update complaint");
      console.error(error);
    } else {
      toast.success("Complaint status updated");
      fetchComplaints();
    }
  };

  const updateComplaintPriority = async (id: string, priority: string) => {
    const { error } = await supabase
      .from("complaints")
      .update({ priority: priority as any })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update priority");
      console.error(error);
    } else {
      toast.success("Priority updated");
      fetchComplaints();
    }
  };

  const assignDepartment = async () => {
    if (!selectedComplaint || !assignDepartmentId) return;

    const { error } = await supabase
      .from("complaints")
      .update({ assigned_department_id: assignDepartmentId })
      .eq("id", selectedComplaint);

    if (error) {
      toast.error("Failed to assign department");
      console.error(error);
    } else {
      toast.success("Department assigned successfully");
      setSelectedComplaint(null);
      setAssignDepartmentId("");
      fetchComplaints();
    }
  };

  const mapComplaints = complaints
    .filter((c) => c.latitude && c.longitude)
    .map((c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      priority: c.priority,
      latitude: c.latitude!,
      longitude: c.longitude!,
      category: c.category,
    }));

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and track all citizen complaints
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>New Complaints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-info" />
                <span className="text-3xl font-bold">{stats.new}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                <span className="text-3xl font-bold">{stats.in_progress}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Resolved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                <span className="text-3xl font-bold">{stats.resolved}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Closed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-muted-foreground" />
                <span className="text-3xl font-bold">{stats.closed}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">
              <AlertCircle className="w-4 h-4 mr-2" />
              Complaints List
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapPin className="w-4 h-4 mr-2" />
              Map View
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Building2 className="w-4 h-4 mr-2" />
              Departments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>

              {["all", "new", "in_progress", "resolved"].map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-4">
                  {complaints
                    .filter((c) => tab === "all" || c.status === tab)
                    .map((complaint) => (
                      <Card key={complaint.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <CardTitle className="text-lg">{complaint.title}</CardTitle>
                      <CardDescription>
                        ID: {complaint.id} • {complaint.category.replace("_", " ")}
                        {complaint.address && (
                          <>
                            <br />
                            <MapPin className="w-3 h-4 inline mr-1" />
                            {complaint.address}
                                  </>
                                )}
                              </CardDescription>
                            </div>
                            <Badge className={statusColors[complaint.status as keyof typeof statusColors]}>
                              {complaint.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-sm text-muted-foreground">{complaint.description}</p>
                          
                          {complaint.departments && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building2 className="w-4 h-4 text-primary" />
                              <span className="font-medium">Assigned to: {complaint.departments.name}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Status:</span>
                              <Select
                                value={complaint.status}
                                onValueChange={(value) => updateComplaintStatus(complaint.id, value)}
                              >
                                <SelectTrigger className="w-[150px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Priority:</span>
                              <Select
                                value={complaint.priority}
                                onValueChange={(value) => updateComplaintPriority(complaint.id, value)}
                              >
                                <SelectTrigger className="w-[120px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedComplaint(complaint.id);
                                    setAssignDepartmentId(complaint.assigned_department_id || "");
                                  }}
                                >
                                  <Users className="w-4 h-4 mr-2" />
                                  Assign Department
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Assign Department</DialogTitle>
                                  <DialogDescription>
                                    Select a department to handle this complaint.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div>
                                    <Label>Department</Label>
                                    <Select
                                      value={assignDepartmentId}
                                      onValueChange={setAssignDepartmentId}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a department" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {departments.map((dept) => (
                                          <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button onClick={assignDepartment}>Assign</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <span className="text-sm text-muted-foreground ml-auto">
                              {format(new Date(complaint.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          <TabsContent value="map">
            <ComplaintMap 
              complaints={mapComplaints}
              onMarkerClick={(complaint) => {
                const fullComplaint = complaints.find(c => c.id === complaint.id);
                if (fullComplaint) {
                  toast.info(`ID ${complaint.id}: ${complaint.title}`);
                }
              }}
            />
          </TabsContent>

          <TabsContent value="departments">
            <DepartmentManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}