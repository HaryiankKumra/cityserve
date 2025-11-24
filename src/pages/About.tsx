import { Building2, Users, Target, CheckCircle2, Phone, Mail, MapPin, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const About = () => {
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [liveComplaintsCount, setLiveComplaintsCount] = useState(0);
  const [timePeriod, setTimePeriod] = useState<'1month' | '6months' | '1year'>('1month');

  const stats = [
    { label: "Complaints Resolved", value: "10,000+", icon: CheckCircle2 },
    { label: "Active Citizens", value: "50,000+", icon: Users },
    { label: "City Departments", value: "25+", icon: Building2 },
    { label: "Response Time", value: "24hrs", icon: Target },
  ];

  useEffect(() => {
    fetchAnalytics();
    fetchLiveComplaints();
  }, [timePeriod]);

  const fetchLiveComplaints = async () => {
    const { count } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .in('status', ['new', 'in_progress']);
    
    setLiveComplaintsCount(count || 0);
  };

  const fetchAnalytics = async () => {
    const now = new Date();
    let startDate = new Date();
    
    switch(timePeriod) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const { data: complaints } = await supabase
      .from('complaints')
      .select('assigned_department_id, status, departments(name)')
      .eq('status', 'resolved')
      .gte('updated_at', startDate.toISOString());

    // Group by department
    const grouped = complaints?.reduce((acc: any, curr: any) => {
      const deptName = curr.departments?.name || 'Unassigned';
      if (!acc[deptName]) {
        acc[deptName] = 0;
      }
      acc[deptName]++;
      return acc;
    }, {});

    const chartData = Object.entries(grouped || {}).map(([name, count]) => ({
      department: name,
      resolved: count
    }));

    setAnalyticsData(chartData);
  };

  const team = [
    { name: "Haryiank Kumra", role: "City Manager", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" },
    { name: "Naman Bansal", role: "Operations Head", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
    { name: "Manjot Kaur", role: "Tech Lead", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" },
    { name: "Bhaumik Verma", role: "Public Relations", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop" },
  ];

  const workImages = [
    { url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop", title: "Road Repairs" },
    { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop", title: "Infrastructure Development" },
    { url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&h=600&fit=crop", title: "Park Maintenance" },
    { url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop", title: "Street Lighting" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            About CityServe
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Empowering citizens to make their city better, one complaint at a time. 
            Our platform bridges the gap between citizens and civic authorities.
          </p>
          <Link to="/submit">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Submit a Complaint
            </Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">What We Do</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-primary">For Citizens</h3>
              <p className="text-muted-foreground leading-relaxed">
                Report civic issues easily through our platform. Track your complaints in real-time, 
                receive updates, and see the impact of your contribution to making the city better.
              </p>
            </Card>
            <Card className="p-8 hover:shadow-xl transition-all duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-accent">For Authorities</h3>
              <p className="text-muted-foreground leading-relaxed">
                Efficiently manage and prioritize complaints, assign tasks to departments, 
                track resolution progress, and maintain transparency with citizens.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Work */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Our Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {workImages.map((image, index) => (
              <div key={index} className="relative group overflow-hidden rounded-lg shadow-lg">
                <img 
                  src={image.url} 
                  alt={image.title}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                  <h3 className="text-white text-xl font-semibold">{image.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-4xl font-bold mb-4">Live Analytics</h2>
            <p className="text-xl text-muted-foreground">
              Real-time insights into complaint resolution across departments
            </p>
          </div>

          {/* Live Complaints Counter */}
          <Card className="p-8 mb-8 text-center bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="text-5xl font-bold text-primary mb-2">{liveComplaintsCount}</div>
            <div className="text-xl text-muted-foreground">Active Complaints Right Now</div>
          </Card>

          {/* Time Period Tabs */}
          <Tabs value={timePeriod} onValueChange={(v) => setTimePeriod(v as any)} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="1month">1 Month</TabsTrigger>
              <TabsTrigger value="6months">6 Months</TabsTrigger>
              <TabsTrigger value="1year">1 Year</TabsTrigger>
            </TabsList>

            <TabsContent value={timePeriod} className="mt-0">
              <Card className="p-6">
                <h3 className="text-2xl font-semibold mb-6 text-center">
                  Complaints Resolved by Department
                </h3>
                {analyticsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="department" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        className="text-sm"
                      />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="resolved" 
                        fill="hsl(var(--primary))" 
                        name="Resolved Complaints"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No resolved complaints data available for this period
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-8">How CityServe Works</h2>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto mb-12">
            Watch this video to learn how our platform is transforming citizen-government interaction 
            and making our cities better places to live.
          </p>
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="relative rounded-lg overflow-hidden shadow-2xl bg-black">
              <video
                className="w-full h-auto"
                controls
                preload="metadata"
              >
                <source src="/Video_Generation_From_Text.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Want to see CityServe in action? Join thousands of citizens making a difference today.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-primary/20"
                />
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className="text-muted-foreground">{member.role}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Get In Touch</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <Phone className="w-8 h-8 mx-auto mb-4 text-primary" />
              <p className="font-semibold mb-2">Phone</p>
              <p className="text-muted-foreground">+91 98765 43210</p>
            </Card>
            <Card className="p-6">
              <Mail className="w-8 h-8 mx-auto mb-4 text-primary" />
              <p className="font-semibold mb-2">Email</p>
              <p className="text-muted-foreground">support@cityserve.in</p>
            </Card>
            <Card className="p-6">
              <MapPin className="w-8 h-8 mx-auto mb-4 text-primary" />
              <p className="font-semibold mb-2">Address</p>
              <p className="text-muted-foreground">City Hall, New Delhi</p>
            </Card>
          </div>
          <Link to="/auth">
            <Button size="lg" variant="outline">
              Join Us Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;