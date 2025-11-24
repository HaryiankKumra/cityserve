import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  MapPin, 
  Bell, 
  BarChart3, 
  Users, 
  Shield,
  CheckCircle,
  Clock,
  ExternalLink
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
    { icon: <CheckCircle className="w-8 h-8 text-green-500" />, label: "Resolved Issues", value: "1000+" },
    { icon: <Clock className="w-8 h-8 text-blue-500" />, label: "Avg Response Time", value: "24 hrs" },
    { icon: <Users className="w-8 h-8 text-purple-500" />, label: "Active Users", value: "500+" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                CityServe
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              A modern civic complaint management platform that connects citizens with their local government
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/auth")} className="text-lg px-8 py-6">
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/about")} className="text-lg px-8 py-6">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {stat.icon}
                  </div>
                  <p className="text-3xl font-bold mb-2">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage and track civic complaints efficiently
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-primary mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple steps to get your civic issues resolved
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Sign Up", desc: "Create your account in seconds" },
              { step: "2", title: "Report Issue", desc: "Submit complaint with details and photos" },
              { step: "3", title: "Track Progress", desc: "Monitor status in real-time" },
              { step: "4", title: "Get Resolved", desc: "Issue resolved by relevant department" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-12 pb-12">
              <h2 className="text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of citizens making their cities better, one complaint at a time
              </p>
              <Button size="lg" variant="secondary" onClick={() => navigate("/auth")} className="text-lg px-8 py-6">
                Start Now - It's Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Created by <span className="font-semibold text-foreground">Haryank Kumra</span>
            </p>
            <a 
              href="https://haryank.me" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              Visit haryank.me for more details
              <ExternalLink className="w-4 h-4" />
            </a>
            <p className="text-sm text-muted-foreground">
              © 2024 CityServe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
