import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { 
  FileText, 
  MapPin, 
  Bell, 
  BarChart3, 
  Users, 
  Shield,
  CheckCircle,
  Clock,
  Sparkles,
  TrendingUp,
  Award
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Submit Complaints",
      description: "Report civic issues with photos, location, and detailed descriptions"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Location Tracking",
      description: "Pin exact locations on interactive maps for precise issue identification"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Real-time Updates",
      description: "Get instant notifications on complaint status changes and resolutions"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics Dashboard",
      description: "View comprehensive analytics and statistics on resolved complaints"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Department Portal",
      description: "Dedicated portals for different civic departments to manage issues"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Admin Controls",
      description: "Advanced management tools for administrators and moderators"
    }
  ];

  const stats = [
    { icon: <CheckCircle className="w-10 h-10" />, label: "Resolved Issues", value: "1000+", color: "text-green-500" },
    { icon: <Clock className="w-10 h-10" />, label: "Avg Response Time", value: "24 hrs", color: "text-blue-500" },
    { icon: <Users className="w-10 h-10" />, label: "Active Users", value: "500+", color: "text-purple-500" },
    { icon: <TrendingUp className="w-10 h-10" />, label: "Success Rate", value: "95%", color: "text-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(var(--primary-rgb)/0.1),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Your Voice, Our Priority
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                CityServe
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Transform your city with a modern complaint management platform. Report issues, track progress, and collaborate with local government to build better communities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-all">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/about")} className="text-lg px-10 py-7">
                See How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-2 hover:border-primary/50 transition-colors bg-card/50 backdrop-blur">
                <CardContent className="pt-8 pb-8">
                  <div className={`flex justify-center mb-4 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <p className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">{stat.value}</p>
                  <p className="text-muted-foreground font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Award className="w-4 h-4" />
              Feature Rich
            </div>
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need to manage and track civic complaints efficiently with real-time updates
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-2 hover:border-primary/50 bg-card/50 backdrop-blur">
                <CardContent className="pt-8">
                  <div className="text-primary mb-6 p-3 bg-primary/10 rounded-xl w-fit group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Four simple steps to transform your community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-20" style={{ top: '32px' }} />
            
            {[
              { step: "1", title: "Sign Up", desc: "Create your account in seconds with email or Google", icon: "🚀" },
              { step: "2", title: "Report Issue", desc: "Submit complaint with details, photos and location", icon: "📝" },
              { step: "3", title: "Track Progress", desc: "Monitor status with real-time updates and notifications", icon: "📊" },
              { step: "4", title: "Get Resolved", desc: "Issue resolved efficiently by relevant department", icon: "✅" }
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg hover:scale-110 transition-transform relative z-10">
                  {item.step}
                </div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-background" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-accent/90 to-primary/90" />
            <CardContent className="relative pt-16 pb-16 text-center">
              <h2 className="text-5xl font-bold mb-6 text-primary-foreground">Ready to Make a Difference?</h2>
              <p className="text-xl mb-10 text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
                Join thousands of citizens making their cities better. Report issues, track progress, and see real change happen in your community.
              </p>
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={() => navigate("/auth")} 
                className="text-lg px-12 py-7 shadow-xl hover:scale-105 transition-all font-semibold"
              >
                Start Now - It's Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 CityServe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
