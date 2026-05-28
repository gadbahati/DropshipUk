import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, AlertCircle, XCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FeatureCard from "@/components/FeatureCard";
import LiveChat from "@/components/LiveChat";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useBookingProgress } from "@/hooks/useBookingProgress";
import TransactionsChart from "@/components/TransactionsChart";
import { Progress } from "@/components/ui/progress";

const PACKAGES_INFO = [
  { level: "beginner", name: "Beginner", payout: 7500 },
  { level: "standard", name: "Standard", payout: 11250 },
  { level: "expert", name: "Expert", payout: 18750 },
];

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [totalWithdrawn, setTotalWithdrawn] = useState(0);
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Personalize referral link with user's name or email
  const userName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "user";
  const referralLink = `ent.pantheonsite.io/register/?ref=${userName.toLowerCase()}`;
  
  // Enable automatic booking progress updates
  useBookingProgress(user?.id);

  useEffect(() => {
    if (user) {
      checkIfAdmin();
      fetchUserData();
    }
  }, [user]);

  const checkIfAdmin = async () => {
    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id);
      
      const isAdmin = roles?.some(r => r.role === 'admin' || r.role === 'super_admin');
      
      if (isAdmin) {
        navigate('/admin-dashboard');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const client = supabase as any;
      const { data: profileData } = await client
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();

      const { data: walletData } = await client
        .from("wallets")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      // Fetch active bookings with progress
      const { data: bookingsData } = await client
        .from("bookings")
        .select("*")
        .eq("user_id", user?.id)
        .eq("is_paid", true);

      if (bookingsData) {
        setActiveBookings(bookingsData);
      }

      // Fetch total withdrawn
      const { data: transactionsData } = await client
        .from("transactions")
        .select("amount")
        .eq("user_id", user?.id)
        .eq("type", "withdrawal")
        .eq("status", "completed");

      if (transactionsData) {
        const withdrawn = transactionsData.reduce((sum: number, txn: any) => {
          return sum + parseFloat(txn.amount || 0);
        }, 0);
        setTotalWithdrawn(withdrawn);
      }

      setProfile(profileData);
      setWallet(walletData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50">
      <Header
        showLogo
        showMenu
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        backTo="/login"
      />

      <div className="flex flex-1 overflow-hidden w-full">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Top Status & Welcome */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900">
                        Welcome back, {userName}! 👋
                      </h1>
                      <p className="text-slate-500 mt-1">
                        Track your dropshipping progress and earnings here.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {profile?.is_active ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-4 py-1.5 rounded-full">
                          Active Account
                        </Badge>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => navigate("/manual-payment")}
                          className="rounded-full"
                        >
                          Activate Account
                        </Button>
                      )}
                    </div>
                  </div>
                </section>

                {/* Wallet & Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <section className="bg-primary rounded-2xl p-8 text-white shadow-lg shadow-primary/20 relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-primary-foreground/80 font-medium mb-1">Total Balance</p>
                      <h2 className="text-4xl font-bold mb-6">
                        ${(wallet?.balance / 130)?.toFixed(2) || "0.00"}
                      </h2>
                      <div className="flex gap-3">
                        <Button onClick={() => navigate("/deposit")} className="bg-white text-primary hover:bg-slate-100 border-none flex-1">
                          Deposit
                        </Button>
                        <Button onClick={() => navigate("/withdraw")} variant="outline" className="border-white/30 text-white hover:bg-white/10 flex-1">
                          Withdraw
                        </Button>
                      </div>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-10">
                      <TrendingUp size={160} />
                    </div>
                  </section>

                  <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                    <p className="text-slate-500 font-medium mb-1">Total Withdrawn</p>
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">
                      ${(totalWithdrawn / 130).toFixed(2)}
                    </h2>
                    <div className="p-4 bg-emerald-50 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-700 font-semibold uppercase">Verification Status</p>
                        <p className="text-sm text-emerald-900">{profile?.is_verified ? "Verified Member" : "Pending Verification"}</p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Referral Link Card */}
              <div className="lg:col-span-1">
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
                    <Users size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Refer & Earn</h3>
                  <p className="text-slate-500 text-sm mb-6 flex-1">
                    Invite your friends to Dropship UK and earn commissions on every successful booking they make.
                  </p>
                  <div className="space-y-3 mt-auto">
                    <div className="relative">
                      <input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 focus:outline-none"
                      />
                      <button 
                        onClick={() => handleCopy(referralLink, "Referral link")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-primary transition-colors"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                    <Button onClick={() => handleCopy(referralLink, "Referral link")} className="w-full py-6 rounded-xl">
                      Copy Invite Link
                    </Button>
                  </div>
                </section>
              </div>
            </div>

            {/* Live Progress Section */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Live Booking Progress</h3>
                  <p className="text-slate-500 text-sm">Real-time status of your active dropshipping bookings.</p>
                </div>
                <div className="hidden md:block">
                  <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-4 py-1">
                    Live Updates Enabled
                  </Badge>
                </div>
              </div>

              {activeBookings.length > 0 ? (
                <div className="space-y-8">
                  {activeBookings.map((booking: any) => (
                    <div key={booking.id} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-sm font-bold text-slate-900 uppercase tracking-wider">{booking.level} Package</p>
                          <p className="text-xs text-slate-500">ID: {booking.id.substring(0, 8)}...</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">{booking.booking_percentage}%</p>
                          <p className="text-xs text-slate-500">Completing...</p>
                        </div>
                      </div>
                      <Progress value={booking.booking_percentage} className="h-3 bg-slate-100" />
                      <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Initiated</span>
                        <span>Processing</span>
                        <span>Shipping</span>
                        <span>Delivered</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No active bookings found.</p>
                  <Button variant="link" onClick={() => navigate("/dropshipping")} className="text-primary mt-2">
                    Start your first booking →
                  </Button>
                </div>
              )}
            </section>

            {/* Transaction History Graph */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Earnings Overview</h3>
              <TransactionsChart userId={user?.id} />
            </div>

            {/* Packages Summary */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 overflow-hidden">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Package Opportunities</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-100">
                      <th className="pb-4 font-semibold text-slate-500 text-sm">Package Type</th>
                      <th className="pb-4 font-semibold text-slate-500 text-sm">Potential Payout</th>
                      <th className="pb-4 font-semibold text-slate-500 text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {PACKAGES_INFO.map((pkg) => {
                      const isActive = activeBookings.some(b => b.level === pkg.level);
                      return (
                        <tr key={pkg.level} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-5">
                            <p className="font-bold text-slate-900 capitalize">{pkg.name}</p>
                            <p className="text-xs text-slate-500">Standard UK Delivery</p>
                          </td>
                          <td className="py-5">
                            <p className="font-bold text-slate-900">${(pkg.payout / 130).toFixed(2)}</p>
                          </td>
                          <td className="py-5">
                            {isActive ? (
                              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none">
                                Running
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate("/manual-payment")}
                                className="text-xs border-slate-200 text-slate-600 hover:bg-primary hover:text-white hover:border-primary"
                              >
                                Buy Package
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>

      <LiveChat />
    </div>
  );
};

export default Dashboard;
