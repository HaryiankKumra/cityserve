import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, Calendar, User, Package, Building2, Phone } from "lucide-react";
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
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  assigned_department_id: string | null;
  user_id: string;
  departments?: { name: string; contact_phone: string; contact_email: string };
}

interface UserProfile {
  full_name: string | null;
  phone_number: string | null;
}

interface Attachment {
  id: string;
  file_url: string;
  file_type: string;
}

const statusColors = {
  new: "status-badge-new",
  in_progress: "status-badge-in-progress",
  resolved: "status-badge-resolved",
  closed: "status-badge-closed",
};

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useUserRole();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const fetchComplaintDetails = async () => {
    const { data: complaintData, error } = await supabase
      .from("complaints")
      .select("*, departments(name, contact_phone, contact_email)")
      .eq("id", id)
      .maybeSingle();

    if (error || !complaintData) {
      console.error("Error fetching complaint:", error);
      setLoading(false);
      return;
    }

    setComplaint(complaintData as any);

    // Fetch user profile if admin
    if (isAdmin && (complaintData as any).user_id) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, phone_number")
        .eq("user_id", (complaintData as any).user_id)
        .maybeSingle();

      if (profileData) {
        setUserProfile(profileData);
      }
    }

    const { data: attachmentData } = await supabase
      .from("complaint_attachments")
      .select("*")
      .eq("complaint_id", id);

    if (attachmentData) {
      const attachmentsWithUrls = await Promise.all(
        attachmentData.map(async (att) => {
          const { data } = supabase.storage
            .from("complaint-attachments")
            .getPublicUrl(att.file_url);
          return { ...att, file_url: data.publicUrl };
        })
      );
      setAttachments(attachmentsWithUrls);
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

  if (!complaint) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto py-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Complaint not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{complaint.title}</CardTitle>
                <p className="text-sm text-muted-foreground font-mono">ID: {complaint.id}</p>
              </div>
              <Badge className={statusColors[complaint.status as keyof typeof statusColors]}>
                {complaint.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{complaint.description}</p>
            </div>

            <Separator />

            {isAdmin && userProfile && (
              <>
                <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-accent" />
                    Reported By
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {userProfile.full_name || "Not provided"}</p>
                    {userProfile.phone_number && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {userProfile.phone_number}
                      </p>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Submitted</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(complaint.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Priority</p>
                    <p className="text-sm text-muted-foreground capitalize">{complaint.priority}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 mt-0.5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {complaint.category.replace("_", " ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {complaint.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{complaint.address}</p>
                    </div>
                  </div>
                )}

                {complaint.departments && (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="flex items-start gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-primary mt-0.5" />
                      <p className="text-sm font-semibold text-primary">Assigned Department</p>
                    </div>
                    <p className="text-sm font-medium mb-2">{complaint.departments.name}</p>
                    {complaint.departments.contact_phone && (
                      <p className="text-xs text-muted-foreground">
                        Phone: {complaint.departments.contact_phone}
                      </p>
                    )}
                    {complaint.departments.contact_email && (
                      <p className="text-xs text-muted-foreground">
                        Email: {complaint.departments.contact_email}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {attachments.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-semibold mb-3">Attachments</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors"
                      >
                        <img
                          src={att.file_url}
                          alt="Complaint attachment"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="bg-muted/30 p-4 rounded-lg">
              <h3 className="text-sm font-semibold mb-3">Complaint Timeline</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1" />
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
                      <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1" />
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
                      <div className="w-2.5 h-2.5 rounded-full bg-success mt-1" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Complaint {complaint.status === "resolved" ? "Resolved" : "Closed"}
                      </p>
                      <p className="text-xs text-muted-foreground">Thank you for your patience</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30 mt-1" />
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
      </div>
    </div>
  );
}
