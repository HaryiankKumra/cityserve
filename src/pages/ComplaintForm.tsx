import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { MapPin, Upload, ArrowLeft } from "lucide-react";

const categories = [
  "Road Maintenance",
  "Street Lighting",
  "Waste Management",
  "Water Supply",
  "Public Safety",
  "Parks & Recreation",
  "Noise Complaint",
  "Building Violation",
  "Other"
];

export default function ComplaintForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    street_address: "",
    contact_name: "",
    contact_phone: "",
    contact_email: user?.email || "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast.success("Location captured successfully");
        },
        (error) => {
          toast.error("Could not get your location");
          console.error(error);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be signed in to submit a complaint");
      return;
    }

    if (!formData.title || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      // Create complaint
      const { data: complaint, error: complaintError } = await supabase
        .from("complaints")
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          street_address: formData.street_address,
          location: location ? `POINT(${location.lng} ${location.lat})` : null,
          contact_name: formData.contact_name,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
          reporter_id: user.id,
        })
        .select()
        .single();

      if (complaintError) throw complaintError;

      // Upload files if any
      if (files.length > 0 && complaint) {
        for (const file of files) {
          const fileName = `${complaint.id}/${Date.now()}-${file.name}`;
          
          const { error: uploadError } = await supabase.storage
            .from("complaint-attachments")
            .upload(fileName, file);

          if (uploadError) {
            console.error("Upload error:", uploadError);
            continue;
          }

          // Create attachment record
          await supabase.from("attachments").insert({
            complaint_id: complaint.id,
            file_name: file.name,
            file_path: fileName,
            file_size: file.size,
            mime_type: file.type,
          });
        }
      }

      toast.success(`Complaint submitted! Tracking ID: ${complaint.tracking_id}`);
      navigate("/my-complaints");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit complaint");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Submit a Complaint</CardTitle>
            <CardDescription>
              Help us improve your community by reporting issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the issue"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat.toLowerCase().replace(/ /g, "_")}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the issue"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main St"
                  value={formData.street_address}
                  onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetLocation}
                  className="w-full"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {location ? "Location Captured" : "Capture Current Location"}
                </Button>
                {location && (
                  <p className="text-sm text-muted-foreground">
                    Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact Name</Label>
                  <Input
                    id="contact_name"
                    placeholder="Your name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="files">Attachments</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="files"
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                {files.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {files.length} file(s) selected
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Submitting..." : "Submit Complaint"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}