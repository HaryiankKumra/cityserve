import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card } from "@/components/ui/card";

// Fix default marker icon issue with Leaflet + bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface ComplaintLocation {
  id: string;
  tracking_id: string;
  title: string;
  status: string;
  priority: string;
  latitude: number;
  longitude: number;
  category: string;
}

interface ComplaintMapProps {
  complaints: ComplaintLocation[];
  onMarkerClick?: (complaint: ComplaintLocation) => void;
}

const statusColors = {
  new: "#3b82f6",
  in_progress: "#f59e0b",
  resolved: "#10b981",
  closed: "#6b7280",
};

export function ComplaintMap({ complaints, onMarkerClick }: ComplaintMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5); // India center

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    if (complaints.length > 0) {
      const bounds = L.latLngBounds([]);

      complaints.forEach((complaint) => {
        if (complaint.latitude && complaint.longitude) {
          const color = statusColors[complaint.status as keyof typeof statusColors] || "#6b7280";
          
          const icon = L.divIcon({
            className: "custom-marker",
            html: `<div style="
              background-color: ${color};
              width: 24px;
              height: 24px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
              font-weight: bold;
            ">${complaint.priority === 'critical' ? '!' : complaint.priority === 'high' ? 'H' : ''}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const marker = L.marker([complaint.latitude, complaint.longitude], { icon })
            .addTo(mapRef.current!)
            .bindPopup(`
              <div style="min-width: 200px;">
                <strong>${complaint.tracking_id}</strong><br/>
                <strong>${complaint.title}</strong><br/>
                <em>${complaint.category.replace("_", " ")}</em><br/>
                Status: ${complaint.status.replace("_", " ").toUpperCase()}<br/>
                Priority: ${complaint.priority.toUpperCase()}
              </div>
            `);

          if (onMarkerClick) {
            marker.on("click", () => onMarkerClick(complaint));
          }

          markersRef.current.push(marker);
          bounds.extend([complaint.latitude, complaint.longitude]);
        }
      });

      // Fit map to show all markers
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [complaints, onMarkerClick]);

  return (
    <Card className="overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-[600px]" />
      <div className="p-4 bg-muted/50 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: statusColors.new }} />
          <span>New</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: statusColors.in_progress }} />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: statusColors.resolved }} />
          <span>Resolved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: statusColors.closed }} />
          <span>Closed</span>
        </div>
      </div>
    </Card>
  );
}
