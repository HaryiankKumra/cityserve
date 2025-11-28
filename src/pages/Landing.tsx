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
  Award,
  Mail,
  Phone,
  Send,
  Rocket,
  Zap,
  Star
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export default function Landing() {
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

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
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Global ambient layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Aurora blobs */}
        <div className="absolute -top-32 -left-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-pulse [animation-delay:400ms]" />
        {/* Radial vignette */}
        <div className="absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_40%,black,transparent)] bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <Navbar />

      {/* HERO: split layout with video on the right (upgraded frame) */}
      <section className="relative overflow-hidden">
        {/* ...ambient blobs preserved... */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-20 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 md:px-6 lg:grid-cols-2 lg:py-24">
          {/* Left copy + CTAs (polish buttons) */}
          <div className="order-2 lg:order-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary ring-1 ring-primary/20 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Your Voice, Our Priority</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
              <span className="bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent">
                CityServe
              </span>
              <br />
              <span className="text-foreground/80">Report. Track. Resolve.</span>
            </h1>

            <p className="max-w-xl text-lg text-muted-foreground">
              A next‑gen civic complaint platform with real‑time tracking, analytics, and department workflows. Built for speed and transparency.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="group relative px-8 py-6 text-base rounded-xl transition-all hover:scale-[1.02] active:scale-[.99] shadow-lg"
              >
                <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary to-accent opacity-90 blur-sm transition group-hover:blur md:blur" />
                <Rocket className="mr-2 h-4 w-4 transition group-hover:rotate-12" />
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/about")}
                className="relative px-8 py-6 text-base rounded-xl border-2 border-primary/30 hover:border-primary/60 backdrop-blur"
              >
                <Zap className="mr-2 h-4 w-4" />
                See How It Works
              </Button>
            </div>

            <div className="mt-6 flex items-center gap-2 text-muted-foreground">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              ))}
              <span className="text-sm">Loved by proactive citizens</span>
            </div>
          </div>

          {/* Right: premium video frame */}
          <div className="order-1 lg:order-2 relative">
            <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary/30 via-accent/20 to-transparent p-[2px] shadow-2xl">
              <div className="relative h-full w-full overflow-hidden rounded-[14px] border bg-black">
                <video
                  src="/Video_Generation_From_Text.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="/showcase/poster.jpg"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                {/* glossy + grid overlays */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/35 via-transparent to-white/10" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
                {/* glow ring */}
                <div className="pointer-events-none absolute -inset-10 -z-10 bg-gradient-to-br from-primary/20 to-accent/20 blur-[40px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section (glass + gradient glow) */}
      <section className="py-20 border-y bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="relative overflow-hidden border-2 border-border/60 bg-card/60 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-primary/50"
              >
                <span className="pointer-events-none absolute -inset-1 -z-10 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 blur-xl transition-opacity duration-300 hover:opacity-100" />
                <CardContent className="pt-8 pb-8 text-center">
                  <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${stat.color} bg-muted`}>
                    {stat.icon}
                  </div>
                  <p className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-4xl font-extrabold text-transparent">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section (glass/gradient cards) */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 ring-1 ring-primary/20">
              <Award className="w-4 h-4" />
              Feature Rich
            </div>
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need to manage and track civic complaints efficiently with real-time updates
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden border-2 border-border/60 bg-card/60 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-primary/50"
              >
                <span className="pointer-events-none absolute -inset-1 -z-10 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
                <CardContent className="pt-8">
                  <div className="mb-6 w-fit rounded-xl bg-primary/10 p-3 text-primary transition-transform group-hover:scale-110">
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

      {/* How It Works Section (unchanged content, enhanced visuals) */}
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

      {/* CTA Section (glowing gradient panel) */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-background" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden border-2 border-primary/30 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-accent/90 to-primary/90" />
            <div className="absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_40%,white,transparent)] opacity-20" />
            <CardContent className="relative pt-16 pb-16 text-center">
              <h2 className="text-5xl font-bold mb-6 text-primary-foreground">Ready to Make a Difference?</h2>
              <p className="text-xl mb-10 text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
                Join thousands of citizens making their cities better. Report issues, track progress, and see real change happen in your community.
              </p>
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={() => navigate("/auth")} 
                className="text-lg px-12 py-7 shadow-xl hover:scale-105 transition-all font-semibold rounded-xl"
              >
                Start Now - It's Free
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section (kept, with subtle glass) */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Mail className="w-4 h-4" />
              Get In Touch
            </div>
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Contact Us</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-8">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSubmitting(true);
                  
                  try {
                    // For now, just show success message
                    // TODO: Set up contact_messages table in database
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    toast.success("Message sent successfully! We'll get back to you soon.");
                    setContactForm({ name: "", email: "", phone: "", message: "" });
                  } catch (error) {
                    console.error('Error:', error);
                    toast.error("Failed to send message. Please try again.");
                  } finally {
                    setSubmitting(false);
                  }
                }} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Your Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      rows={5}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    <Send className="w-4 h-4 mr-2" />
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Office Location & Map */}
            <div className="space-y-6">
              <Card className="border-2">
                <CardContent className="pt-8 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-primary" />
                      Our Office
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Visit us at our main office for in-person assistance
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Address</p>
                          <p className="text-sm text-muted-foreground">
                            Thapar University<br />
                            Patiala, Punjab<br />
                            India
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Phone</p>
                          <p className="text-sm text-muted-foreground">+91 98765 43210</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Email</p>
                          <p className="text-sm text-muted-foreground">support@cityserve.in</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Map */}
                  <div className="rounded-lg overflow-hidden border-2 h-[300px]">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3443.8970841842877!2d76.36354831512!3d30.35365408177!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391028ab86cd6c6f%3A0x86219d2c946b2233!2sThapar%20Institute%20of%20Engineering%20and%20Technology!5e0!3m2!1sen!2sin!4v1234567890"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Thapar University Location"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 CityServe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
