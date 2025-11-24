import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Upload, X, Camera } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function ComplaintForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useSessionTimeout();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", category: "", priority: "medium" });

  useEffect(() => {
    if (showMap && mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapRef.current);

      mapRef.current.on("click", async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) markerRef.current.remove();
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current!);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          setLocation({ lat, lng, address: data.display_name || "Unknown location" });
        } catch {
          setLocation({ lat, lng, address: "Location selected" });
        }
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [showMap]);

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          setLocation({ lat, lng, address: data.display_name || "Current location" });
          toast.success("Location detected successfully");
        } catch {
          setLocation({ lat, lng, address: "Current location" });
          toast.success("Location detected");
        }
        setDetectingLocation(false);
      },
      () => {
        toast.error("Failed to detect location");
        setDetectingLocation(false);
      }
    );
  };

  const geocodeAddress = async () => {
    if (!manualAddress.trim()) return toast.error("Please enter an address");
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualAddress)}&format=json&limit=1`);
      const data = await res.json();
      if (data[0]) {
        setLocation({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), address: data[0].display_name });
        toast.success("Address found");
      } else {
        toast.error("Address not found");
      }
    } catch {
      toast.error("Failed to geocode address");
    }
  };

  useEffect(() => { if (!user) navigate("/auth"); }, [user, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.size <= 10485760 && f.type.startsWith("image/")).slice(0, 5);
    setImages(prev => [...prev, ...files].slice(0, 5));
    files.forEach(f => { const r = new FileReader(); r.onloadend = () => setImagePreviews(p => [...p, r.result as string]); r.readAsDataURL(f); });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || formData.description.length < 50) return toast.error("Please complete all fields");
    setLoading(true);
    const { data: complaint, error } = await supabase.from("complaints").insert([{ ...formData, priority: formData.priority as any, reporter_id: user.id, latitude: location?.lat, longitude: location?.lng, address: location?.address }]).select().single();
    if (error || !complaint) {
      toast.error("Failed to file complaint");
      setLoading(false);
      return;
    }
    if (images.length > 0) await Promise.all(images.map(async (f, i) => { const n = `${complaint.id}/${Date.now()}_${i}.${f.name.split(".").pop()}`; await supabase.storage.from("complaint-attachments").upload(n, f); await supabase.from("complaint_attachments").insert({ complaint_id: complaint.id, file_url: n, file_type: f.type }); }));
    toast.success("Complaint filed!");
    navigate("/my-complaints");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <Card><CardHeader><CardTitle>File a Complaint</CardTitle></CardHeader>
          <CardContent><form onSubmit={handleSubmit} className="space-y-6">
            <div><Label>Title *</Label><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
            <div><Label>Category *</Label><Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="road_maintenance">Road</SelectItem><SelectItem value="street_lighting">Lighting</SelectItem><SelectItem value="waste_management">Waste</SelectItem></SelectContent></Select></div>
            <div><Label>Description * (min 50 chars)</Label><Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={5} required minLength={50} /><p className="text-xs text-muted-foreground">{formData.description.length}/50</p></div>
            <div><Label>Images</Label><Button type="button" variant="outline" onClick={() => document.getElementById("img")?.click()}><Upload className="w-4 h-4 mr-2" />Upload ({images.length}/5)</Button><input id="img" type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />{imagePreviews.length > 0 && <div className="grid grid-cols-3 gap-2">{imagePreviews.map((p, i) => <div key={i} className="relative aspect-square"><img src={p} className="w-full h-full object-cover rounded" /><Button type="button" size="sm" variant="destructive" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => { setImages(prev => prev.filter((_, idx) => idx !== i)); setImagePreviews(prev => prev.filter((_, idx) => idx !== i)); }}><X className="w-3 h-3" /></Button></div>)}</div>}</div>
            
            <div className="space-y-3">
              <Label>Location (Optional)</Label>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={detectCurrentLocation} disabled={detectingLocation} className="flex-1">
                  <MapPin className="w-4 h-4 mr-2" />{detectingLocation ? "Detecting..." : "Detect Location"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowMap(!showMap)} className="flex-1">
                  <MapPin className="w-4 h-4 mr-2" />{showMap ? "Hide Map" : "Select on Map"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Or enter address manually..." value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} />
                <Button type="button" variant="outline" onClick={geocodeAddress}>Find</Button>
              </div>
              {location && <p className="text-sm text-muted-foreground"><MapPin className="w-3 h-3 inline mr-1" />{location.address}</p>}
              {showMap && <div ref={mapContainerRef} className="h-[300px] w-full rounded-lg border" />}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Submitting..." : "Submit Complaint"}</Button>
          </form></CardContent></Card>
      </div>
    </div>
  );
}
