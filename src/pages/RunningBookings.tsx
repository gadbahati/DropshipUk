import { useState, useEffect } from "react";
import { Package, TrendingUp, Truck, Clock } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const BOOKING_LEVELS = {
  beginner: { label: "Beginner", color: "bg-blue-500" },
  standard: { label: "Standard", color: "bg-purple-500" },
  expert: { label: "Expert", color: "bg-rose-500" },
};

const RunningBookings = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  // Real-time updates for bookings
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("running-bookings-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchBookings = async () => {
    try {
      const client = supabase as any;
      const { data, error } = await client
        .from("bookings")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_paid", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "in_transit":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pending",
      in_transit: "In Transit",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen w-full">
        <Header
          showLogo
          showMenu
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          backTo="/dashboard"
        />
        <div className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

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
          <div className="max-w-5xl mx-auto space-y-5">
            <section className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border-l-4 border-primary">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Package className="w-5 h-5" />
                  <span className="text-sm sm:text-base">Your Running Bookings</span>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
                </span>
              </div>

              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No bookings yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start dropshipping to see your orders here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className="border-l-4 border-l-primary hover:shadow-md transition-all"
                    >
                      <CardHeader className="pb-3">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <CardTitle className="text-base sm:text-lg mb-1">
                              {BOOKING_LEVELS[booking.level as keyof typeof BOOKING_LEVELS]?.label || booking.level} Booking
                            </CardTitle>
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusLabel(booking.status)}
                            </Badge>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-xs text-muted-foreground">Investment</p>
                            <p className="text-lg sm:text-xl font-bold">
                              ${(booking.amount_paid / 130).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div className="bg-primary/5 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                              <span className="text-xs text-muted-foreground">Expected Outcome</span>
                            </div>
                            <p className="text-lg sm:text-xl font-bold text-primary">
                              ${(booking.outcome_amount / 130).toFixed(2)}
                            </p>
                          </div>
                          <div className="bg-warning/5 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-warning" />
                              <span className="text-xs text-muted-foreground">Progress</span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Progress value={booking.booking_percentage} className="flex-1 h-2" />
                              <span className="text-base sm:text-lg font-bold text-warning">
                                {booking.booking_percentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                          <span>Created: {new Date(booking.created_at).toLocaleDateString()}</span>
                          {booking.status === "in_transit" && (
                            <div className="flex items-center gap-1 text-info">
                              <Truck className="w-3 h-3" />
                              <span className="font-semibold">In Transit</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Statistics */}
            {bookings.length > 0 && (
              <section className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border-l-4 border-primary">
                <h3 className="font-semibold mb-4 text-sm sm:text-base">📊 Booking Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-primary">{bookings.length}</p>
                    <p className="text-xs text-muted-foreground">Total Bookings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-warning">
                      {bookings.filter((b) => b.status === "in_transit").length}
                    </p>
                    <p className="text-xs text-muted-foreground">In Transit</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-success">
                      {bookings.filter((b) => b.status === "delivered").length}
                    </p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl sm:text-2xl font-bold text-primary">
                      KES{" "}
                      {bookings
                        .reduce((sum, b) => sum + Number(b.outcome_amount), 0)
                        .toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Expected</p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RunningBookings;
