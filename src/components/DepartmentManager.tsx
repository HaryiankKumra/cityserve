import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Building2, Mail, Phone } from "lucide-react";

interface Department {
  id: string;
  name: string;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
}

export function DepartmentManager() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contact_email: "",
    contact_phone: "",
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Failed to load departments");
      console.error(error);
    } else {
      setDepartments(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("departments")
      .insert([formData]);

    if (error) {
      toast.error("Failed to create department");
      console.error(error);
    } else {
      toast.success("Department created successfully");
      setIsOpen(false);
      setFormData({ name: "", description: "", contact_email: "", contact_phone: "" });
      fetchDepartments();
    }
  };

  const toggleDepartment = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("departments")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update department");
    } else {
      toast.success(`Department ${!isActive ? "activated" : "deactivated"}`);
      fetchDepartments();
    }
  };

  if (loading) {
    return <div>Loading departments...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Department Management</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Department</DialogTitle>
                <DialogDescription>
                  Add a new department to assign complaints to.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Department Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Contact Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input
                    id="phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Department</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <Card key={dept.id} className={!dept.is_active ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <Building2 className="w-8 h-8 text-primary mb-2" />
                <Button
                  size="sm"
                  variant={dept.is_active ? "outline" : "default"}
                  onClick={() => toggleDepartment(dept.id, dept.is_active)}
                >
                  {dept.is_active ? "Deactivate" : "Activate"}
                </Button>
              </div>
              <CardTitle>{dept.name}</CardTitle>
              {dept.description && (
                <CardDescription>{dept.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {dept.contact_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{dept.contact_email}</span>
                </div>
              )}
              {dept.contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{dept.contact_phone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
