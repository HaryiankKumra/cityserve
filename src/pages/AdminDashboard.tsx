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
import { ArrowLeft, AlertCircle, Clock, CheckCircle2, XCircle, MapPin, Building2, Users, LogOut } from "lucide-react";
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
  const { user, signOut } = useAuth();
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
<<<<<<< HEAD
    <div className="min-h-screen bg-background">
      {/* Fixed Header with Sign Out */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-3 sm:p-4 max-w-7xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate("/")} 
            className="text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Back
          </Button>
          
          <div className="flex-1 text-center px-2">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold truncate">Admin Dashboard</h1>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Out</span>
          </Button>
=======
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-7xl mx-auto py-4 sm:py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 sm:mb-6" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage and track all citizen complaints
          </p>
>>>>>>> 0e5f83a9815df6baca7c6dcdad7d7dc972318a22
        </div>
      </div>

<<<<<<< HEAD
      <div className="max-w-7xl mx-auto p-2 sm:p-4 pb-6">
        <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 px-2">
          Manage and track all citizen complaints
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardDescription className="text-xs">New</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3">
              <div className="flex items-center gap-1 sm:gap-2">
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-info flex-shrink-0" />
                <span className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.new}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardDescription className="text-xs">In Progress</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3">
              <div className="flex items-center gap-1 sm:gap-2">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-warning flex-shrink-0" />
                <span className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.in_progress}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardDescription className="text-xs">Resolved</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3">
              <div className="flex items-center gap-1 sm:gap-2">
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-accent flex-shrink-0" />
                <span className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.resolved}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardDescription className="text-xs">Closed</CardDescription>
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3">
              <div className="flex items-center gap-1 sm:gap-2">
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-muted-foreground flex-shrink-0" />
                <span className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.closed}</span>
=======
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs sm:text-sm">New</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-info" />
                <span className="text-2xl sm:text-3xl font-bold">{stats.new}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs sm:text-sm">Progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                <span className="text-2xl sm:text-3xl font-bold">{stats.in_progress}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs sm:text-sm">Resolved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                <span className="text-2xl sm:text-3xl font-bold">{stats.resolved}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2 sm:pb-3">
              <CardDescription className="text-xs sm:text-sm">Closed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <span className="text-2xl sm:text-3xl font-bold">{stats.closed}</span>
>>>>>>> 0e5f83a9815df6baca7c6dcdad7d7dc972318a22
              </div>
            </CardContent>
          </Card>
        </div>

<<<<<<< HEAD
        <Tabs defaultValue="list" className="space-y-3 sm:space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
            <TabsTrigger value="list" className="text-xs sm:text-sm">
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Complaints</span>
              <span className="sm:hidden">List</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="text-xs sm:text-sm">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Map
            </TabsTrigger>
            <TabsTrigger value="workload" className="text-xs sm:text-sm">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Workload</span>
              <span className="sm:hidden">Work</span>
            </TabsTrigger>
            <TabsTrigger value="departments" className="text-xs sm:text-sm">
              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Departments</span>
              <span className="sm:hidden">Dept</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-3 sm:space-y-4">
            <Tabs defaultValue="all" className="space-y-3 sm:space-y-4">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                <TabsTrigger value="new" className="text-xs sm:text-sm">New</TabsTrigger>
                <TabsTrigger value="in_progress" className="text-xs sm:text-sm">In Progress</TabsTrigger>
=======
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto">
            <TabsTrigger value="list" className="text-xs sm:text-sm px-2 py-2">
              <AlertCircle className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Complaints</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="text-xs sm:text-sm px-2 py-2">
              <MapPin className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Map</span>
            </TabsTrigger>
            <TabsTrigger value="workload" className="text-xs sm:text-sm px-2 py-2">
              <Users className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Workload</span>
            </TabsTrigger>
            <TabsTrigger value="departments" className="text-xs sm:text-sm px-2 py-2">
              <Building2 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Departments</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <Tabs defaultValue="all" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                <TabsTrigger value="new" className="text-xs sm:text-sm">New</TabsTrigger>
                <TabsTrigger value="in_progress" className="text-xs sm:text-sm">Progress</TabsTrigger>
>>>>>>> 0e5f83a9815df6baca7c6dcdad7d7dc972318a22
                <TabsTrigger value="resolved" className="text-xs sm:text-sm">Resolved</TabsTrigger>
              </TabsList>

              {["all", "new", "in_progress", "resolved"].map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-3 sm:space-y-4">
                  {complaints
                    .filter((c) => tab === "all" || c.status === tab)
                    .map((complaint) => (
<<<<<<< HEAD
                      <Card key={complaint.id} className="overflow-hidden">
                        <CardHeader className="pb-3 px-3 sm:px-4 pt-3 sm:pt-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-sm sm:text-base md:text-lg break-words flex-1 pr-2">
                                {complaint.title}
                              </CardTitle>
                              <Badge className={`${statusColors[complaint.status as keyof typeof statusColors]} text-xs whitespace-nowrap flex-shrink-0`}>
                                {complaint.status.replace("_", " ").toUpperCase()}
                              </Badge>
                            </div>
                            <CardDescription className="text-xs break-words">
                              ID: {complaint.id.slice(0, 8)}... • {complaint.category.replace("_", " ")}
                              {complaint.address && (
                                <span className="block mt-1">
                                  <MapPin className="w-3 h-3 inline mr-1" />
                                  {complaint.address}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-3 px-3 sm:px-4 pb-3">
                          <p className="text-xs sm:text-sm text-muted-foreground break-words leading-relaxed">
                            {complaint.description}
                          </p>
                          
                          {complaint.departments && (
                            <div className="flex items-start gap-2 text-xs sm:text-sm p-2 bg-muted/50 rounded">
                              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0 mt-0.5" />
                              <span className="font-medium break-words">
                                Assigned to: {complaint.departments.name}
                              </span>
                            </div>
                          )}

                          {/* Control Section */}
                          <div className="space-y-2 pt-2 border-t">
                            {/* Status and Priority Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Status</label>
                                <Select
                                  value={complaint.status}
                                  onValueChange={(value) => updateComplaintStatus(complaint.id, value)}
                                >
                                  <SelectTrigger className="h-8 text-xs">
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
                              
                              <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Priority</label>
                                <Select
                                  value={complaint.priority}
                                  onValueChange={(value) => updateComplaintPriority(complaint.id, value)}
                                >
                                  <SelectTrigger className="h-8 text-xs">
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
                            </div>
                            
                            {/* Action Buttons Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
=======
                      <Card key={complaint.id}>
                        <CardHeader className="pb-3">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                            <div className="space-y-1 flex-1">
                              <CardTitle className="text-base sm:text-lg">{complaint.title}</CardTitle>
                              <CardDescription className="text-xs sm:text-sm">
                                <span className="block sm:inline">ID: {complaint.id.slice(0, 8)}...</span>
                                <span className="hidden sm:inline"> • </span>
                                <span className="block sm:inline">{complaint.category.replace("_", " ")}</span>
                                {complaint.address && (
                                  <span className="block mt-1">
                                    <MapPin className="w-3 h-3 inline mr-1" />
                                    {complaint.address}
                                  </span>
                                )}
                              </CardDescription>
                            </div>
                            <Badge className={`${statusColors[complaint.status as keyof typeof statusColors]} text-xs whitespace-nowrap`}>
                              {complaint.status.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 sm:space-y-4">
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{complaint.description}</p>
                          
                          {complaint.departments && (
                            <div className="flex items-center gap-2 text-xs sm:text-sm">
                              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                              <span className="font-medium">Assigned: {complaint.departments.name}</span>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-wrap">
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <span className="text-xs sm:text-sm text-muted-foreground">Status:</span>
                              <Select
                                value={complaint.status}
                                onValueChange={(value) => updateComplaintStatus(complaint.id, value)}
                              >
                                <SelectTrigger className="w-full sm:w-[130px] h-8 text-xs sm:text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="in_progress">Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <span className="text-xs sm:text-sm text-muted-foreground">Priority:</span>
                              <Select
                                value={complaint.priority}
                                onValueChange={(value) => updateComplaintPriority(complaint.id, value)}
                              >
                                <SelectTrigger className="w-full sm:w-[110px] h-8 text-xs sm:text-sm">
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
                            
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
>>>>>>> 0e5f83a9815df6baca7c6dcdad7d7dc972318a22
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
<<<<<<< HEAD
                                    className="w-full text-xs h-8"
=======
                                    className="w-full sm:w-auto text-xs"
>>>>>>> 0e5f83a9815df6baca7c6dcdad7d7dc972318a22
                                    onClick={() => {
                                      setSelectedComplaint(complaint.id);
                                      setAssignDepartmentId(complaint.assigned_department_id || "");
                                    }}
                                  >
<<<<<<< HEAD
                                    <Users className="w-3 h-3 mr-1.5" />
                                    Assign Dept
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[95vw] sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-base">Assign Department</DialogTitle>
                                    <DialogDescription className="text-xs">
                                      Select a department to handle this complaint.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-3 py-3">
                                    <div>
                                      <Label className="text-xs">Department</Label>
=======
                                    <Users className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                                    <span className="ml-2 sm:ml-0">Assign Dept</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[90vw] sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Assign Department</DialogTitle>
                                    <DialogDescription>
                                      Select a department to handle this complaint.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div>
                                      <Label>Department</Label>
>>>>>>> 0e5f83a9815df6baca7c6dcdad7d7dc972318a22
                                      <Select
                                        value={assignDepartmentId}
                                        onValueChange={setAssignDepartmentId}
                                      >
<<<<<<< HEAD
                                        <SelectTrigger className="text-xs mt-1">
=======
                                        <SelectTrigger>
>>>>>>> 0e5f83a9815df6baca7c6dcdad7d7dc972318a22
                                          <SelectValue placeholder="Select a department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {departments.map((dept) => (
<<<<<<< HEAD
                                            <SelectItem key={dept.id} value={dept.id} className="text-xs">
=======
                                            <SelectItem key={dept.id} value={dept.id}>
>>>>>>> 0e5f83a9815df6baca7c6dcdad7d7dc972318a22
                                              {dept.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <DialogFooter>
<<<<<<< HEAD
                                    <Button onClick={assignDepartment} size="sm" className="text-xs">
                                      Assign
                                    </Button>
=======
                                    <Button onClick={assignDepartment}>Assign</Button>
>>>>>>> 0e5f83a9815df6baca7c6dcdad7d7dc972318a22
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Button
                                variant="ghost"
                                size="sm"
<<<<<<< HEAD
                                className="w-full text-xs h-8"
=======
                                className="w-full sm:w-auto text-xs"
>>>>>>> 0e5f83a9815df6baca7c6dcdad7d7dc972318a22
                                onClick={() => navigate(`/complaint/${complaint.id}`)}
                              >
                                View Details
                              </Button>
                            </div>

<<<<<<< HEAD
                            {/* Timestamp */}
                            <p className="text-xs text-muted-foreground pt-1">
                              {format(new Date(complaint.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </p>
=======
                            <span className="text-xs sm:text-sm text-muted-foreground w-full sm:w-auto sm:ml-auto text-left sm:text-right mt-2 sm:mt-0">
                              {format(new Date(complaint.created_at), "MMM d, yyyy")}
                            </span>
>>>>>>> 0e5f83a9815df6baca7c6dcdad7d7dc972318a22
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          <TabsContent value="map">
            <div className="h-[50vh] sm:h-[60vh] lg:h-[70vh]">
              <ComplaintMap 
                complaints={mapComplaints}
                onMarkerClick={(complaint) => {
                  const fullComplaint = complaints.find(c => c.id === complaint.id);
                  if (fullComplaint) {
                    toast.info(`ID ${complaint.id}: ${complaint.title}`);
                  }
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="workload" className="space-y-4">
            {departments.map((dept) => {
              const deptComplaints = complaints.filter(c => c.assigned_department_id === dept.id);
              const deptStats = {
                new: deptComplaints.filter(c => c.status === 'new').length,
                in_progress: deptComplaints.filter(c => c.status === 'in_progress').length,
                resolved: deptComplaints.filter(c => c.status === 'resolved').length,
                closed: deptComplaints.filter(c => c.status === 'closed').length,
              };
              
              return (
                <Card key={dept.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                          <span className="break-words">{dept.name}</span>
                        </CardTitle>
                        <CardDescription className="mt-1 text-xs sm:text-sm">
                          Total Complaints: {deptComplaints.length}
                        </CardDescription>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-info/10 text-xs">
                          New: {deptStats.new}
                        </Badge>
                        <Badge variant="outline" className="bg-warning/10 text-xs">
                          In Progress: {deptStats.in_progress}
                        </Badge>
                        <Badge variant="outline" className="bg-accent/10 text-xs">
                          Resolved: {deptStats.resolved}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  {deptComplaints.length > 0 && (
                    <CardContent>
                      <div className="space-y-2 sm:space-y-3">
                        {deptComplaints.slice(0, 5).map((complaint) => (
                          <div key={complaint.id} className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 p-3 rounded-lg border bg-card">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs sm:text-sm break-words">{complaint.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                ID: {complaint.id.slice(0, 8)}... • {complaint.category.replace("_", " ")}
                              </p>
                              {complaint.address && (
                                <p className="text-xs text-muted-foreground flex items-start gap-1 mt-1 break-words">
                                  <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  <span>{complaint.address}</span>
                                </p>
                              )}
                            </div>
                            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                              <Badge className={statusColors[complaint.status as keyof typeof statusColors] + " text-xs whitespace-nowrap"}>
                                {complaint.status.replace("_", " ")}
                              </Badge>
                              <span className="text-xs text-muted-foreground capitalize">{complaint.priority}</span>
                            </div>
                          </div>
                        ))}
                        {deptComplaints.length > 5 && (
                          <p className="text-xs sm:text-sm text-muted-foreground text-center pt-2">
                            And {deptComplaints.length - 5} more complaints...
                          </p>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
            {departments.length === 0 && (
              <Card>
                <CardContent className="py-8 sm:py-12 text-center">
                  <Building2 className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm sm:text-base text-muted-foreground">No active departments found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="departments">
            <DepartmentManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}