import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useNavigate } from "react-router-dom";
import { FileText, BarChart3, LogOut, Search, MapPin, Shield, Users, TrendingUp, Clock } from "lucide-react";

export default function Index() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="border-b bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                    CityServe
                  </h1>
                  <p className="text-sm text-muted-foreground">Empowering Citizens, Improving Cities</p>
                </div>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Your voice matters. Report civic issues, track their resolution, and help build a better community together.
              </p>
            </div>
            {user && (
              <Button variant="outline" onClick={handleSignOut} className="ml-4">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">50K+</p>
                    <p className="text-xs text-muted-foreground">Active Citizens</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-accent/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">25K+</p>
                    <p className="text-xs text-muted-foreground">Complaints Filed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-success/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">92%</p>
                    <p className="text-xs text-muted-foreground">Resolution Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-warning/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">3.2d</p>
                    <p className="text-xs text-muted-foreground">Avg Resolution Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {user ? (
            <>
              <Card className="hover:shadow-lg transition-all hover:border-primary cursor-pointer group" onClick={() => navigate("/submit")}>
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="text-xl">File Complaint</CardTitle>
                  <CardDescription>
                    Report a civic issue with photos and location. Get a unique tracking ID instantly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Submit New Complaint
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all hover:border-accent cursor-pointer group" onClick={() => navigate("/my-complaints")}>
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-7 h-7 text-accent" />
                  </div>
                  <CardTitle className="text-xl">My Complaints</CardTitle>
                  <CardDescription>
                    View all your submissions, track status updates, and see resolution progress.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    View My Complaints
                  </Button>
                </CardContent>
              </Card>

              {isAdmin && (
                <Card className="hover:shadow-lg transition-all hover:border-warning cursor-pointer group" onClick={() => navigate("/admin")}>
                  <CardHeader>
                    <div className="w-14 h-14 rounded-full bg-warning/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Shield className="w-7 h-7 text-warning" />
                    </div>
                    <CardTitle className="text-xl">Admin Dashboard</CardTitle>
                    <CardDescription>
                      Manage complaints, assign departments, view analytics and system insights.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="mb-2">Admin Access</Badge>
                    <Button className="w-full" variant="outline">
                      Open Dashboard
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <>
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <FileText className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle>Report Issues</CardTitle>
                  <CardDescription>
                    File complaints about roads, sanitation, utilities, safety, and more with photo evidence.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                    <MapPin className="w-7 h-7 text-accent" />
                  </div>
                  <CardTitle>Location Based</CardTitle>
                  <CardDescription>
                    Pinpoint exact locations on map. Issues are automatically routed to relevant departments.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mb-4">
                    <TrendingUp className="w-7 h-7 text-success" />
                  </div>
                  <CardTitle>Real-Time Tracking</CardTitle>
                  <CardDescription>
                    Get unique tracking IDs. Monitor progress from submission to resolution in real-time.
                  </CardDescription>
                </CardHeader>
              </Card>
            </>
          )}
        </div>

        {/* Public Tracking */}
        <Card className="mb-12 border-2 border-dashed">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Search className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>Track Any Complaint</CardTitle>
                <CardDescription>
                  Have a tracking ID? Check complaint status without logging in
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/track")} variant="outline" size="lg">
              <Search className="w-4 h-4 mr-2" />
              Track Complaint by ID
            </Button>
          </CardContent>
        </Card>

        {!user && (
          <Card className="text-center bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Join CityServe Today</CardTitle>
              <CardDescription className="text-base">
                Create an account to file complaints, track status, and help improve your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/auth")} size="lg" className="px-8">
                Sign In / Create Account
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
