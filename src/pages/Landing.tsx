import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/components/Logo";
import { UserCircle, Shield } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Logo />
          <h1 className="text-4xl font-bold mt-6 mb-2">🇬🇧 Dropship UK</h1>
          <p className="text-muted-foreground">Choose how you'd like to continue</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Client Card */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <UserCircle className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Client Access</CardTitle>
              <CardDescription>
                Sign up or login to manage your dropshipping business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate("/register")}
              >
                Sign Up as Client
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={() => navigate("/login?role=client")}
              >
                Login as Client
              </Button>
            </CardContent>
          </Card>

          {/* Admin Card */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Admin Access</CardTitle>
              <CardDescription>
                Authorized personnel only - manage platform operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate("/auth?tab=admin-signup")}
              >
                Sign Up as Admin
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={() => navigate("/login?role=admin")}
              >
                Login as Admin
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;
