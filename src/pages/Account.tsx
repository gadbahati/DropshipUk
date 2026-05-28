import { useState, useEffect } from "react";
import { User, Mail, Phone, Key, Shield, CreditCard, CheckCircle2, Clock } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const Account = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const client = supabase as any;
      
      // Fetch profile
      const { data: profileData } = await client
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();

      setProfile(profileData);

      // Fetch manual payments
      const { data: paymentsData } = await client
        .from("manual_payments")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      setPayments(paymentsData || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleSave = () => {
    toast.success("Account details updated successfully!");
    setIsEditing(false);
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
          <div className="max-w-3xl mx-auto space-y-5">
            <section className="bg-card rounded-xl p-6 shadow-sm border-l-4 border-primary">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <User className="w-5 h-5" />
                  <span>Your Account</span>
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  size="sm"
                >
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    defaultValue={profile?.full_name || ""}
                    disabled={!isEditing}
                    className="bg-secondary"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={profile?.email || user?.email || ""}
                    disabled={!isEditing}
                    className="bg-secondary"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue={profile?.phone || ""}
                    disabled={!isEditing}
                    className="bg-secondary"
                  />
                </div>

                {isEditing && (
                  <Button onClick={handleSave} className="w-full">
                    Save Changes
                  </Button>
                )}
              </div>
            </section>

            {/* Payment History */}
            {payments.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <CardTitle>Payment History</CardTitle>
                  </div>
                  <CardDescription>Your manual payment confirmations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="space-y-1 mb-3 md:mb-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold capitalize">
                              {payment.package_level} Package
                            </p>
                            <Badge
                              variant={
                                payment.status === "confirmed"
                                  ? "default"
                                  : payment.status === "pending"
                                  ? "outline"
                                  : "destructive"
                              }
                              className={
                                payment.status === "confirmed"
                                  ? "bg-success hover:bg-success/90"
                                  : ""
                              }
                            >
                              {payment.status === "confirmed" ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Confirmed
                                </>
                              ) : payment.status === "pending" ? (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </>
                              ) : (
                                "Rejected"
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Transaction Code: {payment.transaction_code}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Amount: {payment.amount_paid} KES
                          </p>
                          {payment.payment_date && (
                            <p className="text-xs text-muted-foreground">
                              Date: {format(new Date(payment.payment_date), "PPP")}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {payment.amount_paid} KES
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ≈ ${(payment.amount_paid / 125).toFixed(2)} USD
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Account Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <CardTitle>Account Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <span className="text-sm font-medium">Account Status</span>
                    <Badge
                      className={
                        profile?.is_active
                          ? "bg-success hover:bg-success/90"
                          : "bg-destructive hover:bg-destructive/90"
                      }
                    >
                      {profile?.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <span className="text-sm font-medium">Payment Verified</span>
                    <Badge
                      variant={profile?.payment_verified ? "default" : "outline"}
                      className={profile?.payment_verified ? "bg-success hover:bg-success/90" : ""}
                    >
                      {profile?.payment_verified ? "Yes" : "No"}
                    </Badge>
                  </div>
                  {profile?.payment_verified_at && (
                    <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                      <span className="text-sm font-medium">Verified On</span>
                      <span className="text-sm">
                        {format(new Date(profile.payment_verified_at), "PPP")}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <section className="bg-card rounded-xl p-6 shadow-sm border-l-4 border-primary">
              <div className="flex items-center gap-2 text-primary font-semibold mb-6">
                <Shield className="w-5 h-5" />
                <span>Security</span>
              </div>

              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Two-Factor Authentication
                </Button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Account;
