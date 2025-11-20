import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Users, Phone, Mail, MapPin, Clock, Briefcase } from "lucide-react";
import { format } from "date-fns";

interface Department {
  id: string;
  name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  is_active: boolean;
}

interface AssignedComplaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  address: string | null;
  assigned_at: string;
  assigned_department_id: string | null;
}

const statusColors = {
  new: "status-badge-new",
  in_progress: "status-badge-in-progress",
  resolved: "status-badge-resolved",
  closed: "status-badge-closed",
};

const priorityColors = {
  low: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  medium: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300",
  high: "bg-red-500/10 text-red-700 dark:text-red-300",
};

export default function DepartmentPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [complaints, setComplaints] = useState<AssignedComplaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    const { data: deptData } = await supabase
      .from("departments")
      .select("*")
      .eq("is_active", true)
      .order("name");

    const { data: complaintData } = await supabase
      .from("complaints")
      .select("*")
      .not("assigned_department_id", "is", null)
      .in("status", ["new", "in_progress"])
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (deptData) setDepartments(deptData);
    if (complaintData) {
      setComplaints(
        complaintData.map((c) => ({
          ...c,
          assigned_at: c.updated_at,
        }))
      );
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
      <div className="max-w-7xl mx-auto py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Department Portal</h1>
          <p className="text-muted-foreground">
            View active departments and their assigned work
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-semibold">Active Work Orders</h2>
            {complaints.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No active work orders at the moment</p>
                </CardContent>
              </Card>
            ) : (
              complaints.map((complaint) => {
                const dept = departments.find((d) => d.id === complaint.assigned_department_id);
                return (
                  <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{complaint.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <span className="capitalize">{complaint.category.replace("_", " ")}</span>
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={statusColors[complaint.status as keyof typeof statusColors]}>
                            {complaint.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Badge className={priorityColors[complaint.priority as keyof typeof priorityColors]}>
                            {complaint.priority.toUpperCase()} Priority
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {complaint.description}
                      </p>
                      
                      {complaint.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{complaint.address}</span>
                        </div>
                      )}

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          {dept && (
                            <div className="flex items-center gap-2 text-sm">
                              <Briefcase className="w-4 h-4 text-primary" />
                              <span className="font-medium">{dept.name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Assigned {format(new Date(complaint.assigned_at), "MMM d, h:mm a")}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/complaint/${complaint.id}`)}>
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Departments</h2>
            {departments.map((dept) => {
              const deptComplaints = complaints.filter((c) => c.assigned_department_id === dept.id);
              return (
                <Card key={dept.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      {dept.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {dept.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{dept.contact_phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs truncate">{dept.contact_email}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Active Work Orders</span>
                      <Badge variant="secondary">{deptComplaints.length}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
