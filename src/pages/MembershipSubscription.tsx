import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Check, X, Phone } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MembershipSubscription = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const client = supabase as any;
      const { data } = await client
        .from("membership_subscriptions")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      setSubscription(data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      const client = supabase as any;
      
      // Get current wallet balance
      const { data: walletData } = await client
        .from("wallets")
        .select("balance")
        .eq("user_id", user?.id)
        .single();

      // Create membership subscription
      const { error: subError } = await client.from("membership_subscriptions").insert({
        user_id: user?.id,
        amount_paid: 5000,
        is_active: true,
        is_refundable: true,
        subscribed_at: new Date().toISOString(),
        payment_method: "pending",
      });

      if (subError) throw subError;

      // Update wallet balance - add the refundable deposit to existing balance
      const newBalance = Number(walletData?.balance || 0) + 5000;
      const { error: walletError } = await client
        .from("wallets")
        .update({ balance: newBalance })
        .eq("user_id", user?.id);

      if (walletError) throw walletError;

      // Update profile to active
      const { error: profileError } = await client
        .from("profiles")
        .update({ is_active: true })
        .eq("id", user?.id);

      if (profileError) throw profileError;

      toast.success("Membership activated! KES 5,000 added to your balance (refundable).");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header
        showLogo
        showMenu
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        backTo="/dashboard"
      />

      <div className="flex flex-1 overflow-hidden w-full">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto p-5 md:p-8 lg:p-10">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-destructive" />
                  Membership Required
                </CardTitle>
                <CardDescription>
                  Subscribe to unlock withdrawal features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert variant="destructive">
                  <AlertDescription>
                    Your withdrawal has been declined. You need to subscribe to membership to withdraw funds.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle>Membership Benefits</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary mt-0.5" />
                      <p className="text-sm">Unlimited withdrawals</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary mt-0.5" />
                      <p className="text-sm">Priority customer support</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary mt-0.5" />
                      <p className="text-sm">Access to exclusive deals</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary mt-0.5" />
                      <p className="text-sm">Refundable deposit</p>
                    </div>
                  </CardContent>
                </Card>

                <div className="border rounded-lg p-6 bg-primary/5">
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">Membership Fee</p>
                    <p className="text-4xl font-bold">$40 (KES 5,000)</p>
                    <p className="text-sm text-primary font-semibold">100% Refundable</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" size="lg" onClick={handleSubscribe}>
                    Subscribe Now
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open("mailto:dropshimpent.ecommerce@gmail.com", "_blank")}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Customer Care
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate("/dashboard")}
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MembershipSubscription;
