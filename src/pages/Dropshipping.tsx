import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Package, TrendingUp, Truck, ArrowUpRight, Clock, DollarSign } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PaymentMethodsDialog } from "@/components/PaymentMethodsDialog";
import { useBookingProgress } from "@/hooks/useBookingProgress";

interface DropshipApplication {
  id: string;
  is_complete: boolean;
  full_name: string;
  address: string;
  city: string;
  postal_code: string;
  phone: string;
}

interface Booking {
  id: string;
  level: "beginner" | "standard" | "expert";
  amount_paid: number;
  outcome_amount: number;
  booking_percentage: number;
  status: "pending" | "in_transit" | "delivered" | "cancelled";
  is_paid: boolean;
  created_at: string;
}

const BOOKING_LEVELS = {
  beginner: { price: 1250, outcome: 8500, payout: 7500, label: "Beginner" },
  standard: { price: 3500, outcome: 12250, payout: 11250, label: "Standard" },
  expert: { price: 5500, outcome: 18750, payout: 18750, label: "Expert" },
};

const Dropshipping = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [application, setApplication] = useState<DropshipApplication | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<"beginner" | "standard" | "expert" | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Enable automatic booking progress updates
  useBookingProgress(user?.id);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Real-time updates for bookings
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Booking updated:", payload);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch dropship application
      const client = supabase as any;
      const { data: appData } = await client
        .from("dropship_applications")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      setApplication(appData);

      // Fetch bookings
      const { data: bookingsData } = await client
        .from("bookings")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      setBookings(bookingsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (level: "beginner" | "standard" | "expert") => {
    if (!application?.is_complete) {
      toast.error("Please complete your dropshipping application first!");
      return;
    }

    setSelectedLevel(level);
    const levelData = BOOKING_LEVELS[level];

    try {
      const client = supabase as any;
      const { data, error } = await client
        .from("bookings")
        .insert({
          user_id: user?.id,
          level,
          amount_paid: levelData.price,
          outcome_amount: levelData.outcome,
          booking_percentage: 0,
          status: "pending",
          is_paid: false,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Failed to create booking");

      setPendingBookingId(data.id);
      setPaymentDialogOpen(true);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePaymentComplete = async (transactionCode: string, paymentReason: string) => {
    if (!pendingBookingId) return;

    try {
      const client = supabase as any;
      
      // Get booking details
      const booking = bookings.find((b) => b.id === pendingBookingId);
      if (!booking) throw new Error("Booking not found");

      // Set verification time to 4 hours from now
      const verificationDueAt = new Date();
      verificationDueAt.setHours(verificationDueAt.getHours() + 4);

      // Create pending verification record
      await client.from("pending_verifications").insert({
        user_id: user?.id,
        transaction_code: transactionCode,
        amount: booking.amount_paid,
        payment_reason: paymentReason,
        payment_type: "booking",
        booking_id: pendingBookingId,
        verification_due_at: verificationDueAt.toISOString(),
      });

      // Update profile to show verification is pending
      await client
        .from("profiles")
        .update({
          verification_pending: true,
          verification_due_at: verificationDueAt.toISOString(),
        })
        .eq("id", user?.id);

      // Create transaction record
      await client.from("transactions").insert({
        user_id: user?.id,
        type: "booking_payment",
        amount: booking.amount_paid,
        payment_method: "M-Pesa",
        booking_id: pendingBookingId,
        status: "pending",
        description: `Payment for ${BOOKING_LEVELS[booking.level].label} booking - ${transactionCode}`,
      });

      toast.success(
        "Payment submitted successfully! Your account will be verified and booking activated within 4 working hours.",
        { duration: 6000 }
      );
      
      setPendingBookingId(null);
      setPaymentDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error("Payment submission error:", error);
      toast.error("Failed to submit payment. Please try again.");
    }
  };

  const activeBookings = bookings.filter((b) => b.is_paid && b.status === "in_transit");
  const runningBooking = bookings.find((b) => b.is_paid && b.booking_percentage < 100);

  // Calculate total withdrawn
  const totalWithdrawn = bookings
    .filter((b) => b.status === "delivered")
    .reduce((sum, b) => sum + Number(b.outcome_amount), 0);

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
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">🇬🇧 Dropshipping Dashboard</h1>
            </div>

            {/* Booking Selection Section */}
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 shadow-lg">
              <CardHeader className="border-b bg-primary/5">
                <div className="flex items-center gap-2">
                  <Package className="w-6 h-6 text-primary" />
                  <CardTitle>🚀 Start Dropshipping</CardTitle>
                </div>
                <CardDescription>Choose your investment level and start earning returns</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  {Object.entries(BOOKING_LEVELS).map(([level, data]) => {
                    const isActive = bookings.some((b) => b.level === level && b.is_paid);
                    const profit = data.outcome - data.price;
                    const profitPercentage = ((profit / data.price) * 100).toFixed(0);

                    return (
                      <Card
                        key={level}
                        className={`relative overflow-hidden transition-all ${
                          isActive
                            ? "border-success border-3 shadow-2xl bg-success/5 ring-2 ring-success/20"
                            : level === "standard"
                            ? "border-primary border-2 shadow-lg bg-primary/5"
                            : "border hover:border-primary/50 hover:shadow-lg"
                        }`}
                      >
                        {level === "standard" && !isActive && (
                          <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1.5 text-xs font-bold">
                            ⭐ RECOMMENDED
                          </div>
                        )}
                        {isActive && (
                          <div className="absolute top-0 left-0 right-0 bg-success text-success-foreground text-center py-1.5 text-sm font-bold">
                            ✓ ACTIVE
                          </div>
                        )}
                        <CardHeader className={`pb-3 ${isActive || level === "standard" ? "pt-10" : ""}`}>
                          <CardTitle className="text-xl">{data.label} Booking</CardTitle>
                          <CardDescription className="text-xs">Investment Booking</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-3">
                            <div className="bg-secondary/50 rounded-lg p-3">
                              <p className="text-xs text-muted-foreground mb-1">Payment</p>
                              <p className="text-2xl font-bold">${(data.price / 130).toFixed(2)}</p>
                            </div>
                            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                              <p className="text-xs text-muted-foreground mb-1">Payout (Outcome)</p>
                              <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-bold text-primary">
                                  ${(data.payout / 130).toFixed(2)}
                                </p>
                                <Badge variant="outline" className="text-xs border-primary text-primary">
                                  +{profitPercentage}%
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm px-2">
                              <span className="text-muted-foreground">Condition:</span>
                              <span className={`font-semibold flex items-center gap-1 ${
                                isActive ? "text-success" : "text-muted-foreground"
                              }`}>
                                {isActive ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Active
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4" />
                                    Inactive
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                          <Button
                            className={`w-full ${isActive ? "bg-success hover:bg-success/90" : ""}`}
                            onClick={() => {
                              if (!application?.is_complete) {
                                toast.error("Please complete your dropshipping application first!");
                                navigate("/dropshipping");
                                return;
                              }
                              handleCreateBooking(level as any);
                            }}
                            disabled={isActive}
                            size="lg"
                          >
                            {isActive ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Active Booking
                              </>
                            ) : (
                              <>
                                <Package className="w-4 h-4 mr-2" />
                                Pay Now
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Bookings Summary Table */}
                <div className="mt-8 border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      📊 Bookings Summary
                    </h3>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total Amount Withdrawn</p>
                      <p className="text-2xl font-bold text-primary">
                        ${(totalWithdrawn / 130).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-primary/20">
                          <th className="text-left py-3 px-4 font-semibold text-sm">Booking</th>
                          <th className="text-right py-3 px-4 font-semibold text-sm">Payout</th>
                          <th className="text-center py-3 px-4 font-semibold text-sm">Condition</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(BOOKING_LEVELS).map(([level, data], index) => {
                          const isActive = bookings.some((b) => b.level === level && b.is_paid);
                          return (
                            <tr 
                              key={level}
                              className={`border-b ${index % 2 === 0 ? "bg-secondary/20" : ""}`}
                            >
                              <td className="py-3 px-4 font-medium">{data.label}</td>
                              <td className="py-3 px-4 text-right font-bold">
                                ${(data.payout / 130).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge 
                                  variant={isActive ? "default" : "outline"}
                                  className={isActive ? "bg-success hover:bg-success/90" : ""}
                                >
                                  {isActive ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Active
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Inactive
                                    </>
                                  )}
                                </Badge>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="complete" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="complete">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete
                </TabsTrigger>
                <TabsTrigger value="incomplete">
                  <XCircle className="w-4 h-4 mr-2" />
                  Incomplete
                </TabsTrigger>
              </TabsList>

              <TabsContent value="complete" className="space-y-6">
                {application?.is_complete ? (
                  <>
                    {/* Active Shipments */}
                    {activeBookings.length > 0 && (
                      <Card className="border-info/30 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-info/5 to-transparent">
                          <div className="flex items-center gap-2">
                            <Truck className="w-5 h-5 text-info" />
                            <CardTitle>Active Shipments</CardTitle>
                          </div>
                          <CardDescription>Your packages currently in transit</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                          {activeBookings.map((booking) => (
                            <div
                              key={booking.id}
                              className="border-2 border-info/20 rounded-xl p-5 space-y-4 bg-gradient-to-br from-info/5 to-transparent hover:shadow-md transition-all"
                            >
                              <div className="flex items-center justify-between flex-wrap gap-3">
                                <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">
                                  {BOOKING_LEVELS[booking.level].label} Package
                                </Badge>
                                <Button 
                                  size="sm" 
                                  className="bg-info hover:bg-info/90 text-info-foreground"
                                  disabled
                                >
                                  <Truck className="w-4 h-4 mr-2" />
                                  In Transit
                                </Button>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4">
                                <Button
                                  variant="outline"
                                  className="h-auto flex-col items-start p-4 border-primary/30 hover:border-primary"
                                  disabled
                                >
                                  <div className="flex items-center gap-2 mb-2 w-full">
                                    <TrendingUp className="w-5 h-5 text-primary" />
                                    <p className="text-xs font-medium text-muted-foreground">Outcome</p>
                                  </div>
                                  <p className="text-2xl font-bold text-primary">
                                    KES {booking.outcome_amount.toLocaleString()}
                                  </p>
                                </Button>
                                <Button
                                  variant="outline"
                                  className="h-auto flex-col items-start p-4 border-warning/30 hover:border-warning"
                                  disabled
                                >
                                  <div className="flex items-center gap-2 mb-2 w-full">
                                    <Clock className="w-5 h-5 text-warning" />
                                    <p className="text-xs font-medium text-muted-foreground">Booking</p>
                                  </div>
                                  <div className="space-y-2 w-full">
                                    <div className="flex items-center gap-3">
                                      <Progress value={booking.booking_percentage} className="flex-1 h-3" />
                                      <span className="text-lg font-bold text-warning">
                                        {booking.booking_percentage}%
                                      </span>
                                    </div>
                                  </div>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-10 text-center">
                      <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Complete your application to access dropshipping features
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="incomplete" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Complete Your Application</CardTitle>
                    <CardDescription>
                      Fill in all required information to start dropshipping
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {application && !application.is_complete ? (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          Your application is incomplete. Please provide all required information.
                        </p>
                        <Button onClick={() => navigate("/start-dropshipping")}>
                          Complete Application
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        You haven't started your dropshipping application yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Payment Dialog */}
      {selectedLevel && pendingBookingId && (
        <PaymentMethodsDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          amount={BOOKING_LEVELS[selectedLevel].price}
          paymentType="booking"
          bookingId={pendingBookingId}
          onPaymentSubmit={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default Dropshipping;
