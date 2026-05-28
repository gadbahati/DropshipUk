import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Users, DollarSign, Activity, ShieldCheck, Wallet, UserPlus, TrendingUp, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import WithdrawalsTable from "@/components/admin/WithdrawalsTable";
import ActivationPaymentsTable from "@/components/admin/ActivationPaymentsTable";
import VerificationPaymentsTable from "@/components/admin/VerificationPaymentsTable";
import NewSignupsTable from "@/components/admin/NewSignupsTable";
import AllPaymentsTable from "@/components/admin/AllPaymentsTable";
import { DepositsTable } from "@/components/admin/DepositsTable";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPayments: 0,
    pendingActivations: 0,
    pendingWithdrawals: 0,
    pendingVerifications: 0,
    totalRevenue: 0,
    activeUsers: 0,
    newSignups: 0,
    pendingSignups: 0
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      const hasAdminRole = roles?.some(r => r.role === 'admin' || r.role === 'super_admin');
      
      if (!hasAdminRole) {
        toast.error("Admin access required");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      
      // Ensure admin profile is always activated, verified, and premium
      await supabase
        .from('profiles')
        .update({
          is_active: true,
          is_verified: true,
          activation_status: 'approved',
          verification_status: 'approved'
        })
        .eq('id', user.id);
      
      fetchStats();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch activation payments
      const { data: activationPayments } = await supabase
        .from('activation_payments')
        .select('amount_usd, status');

      // Fetch verification payments
      const { data: verificationPayments } = await supabase
        .from('verification_payments')
        .select('amount_usd, status');

      // Fetch withdrawal requests
      const { data: withdrawals } = await supabase
        .from('withdrawal_requests')
        .select('status');

      const totalRevenue = [
        ...(activationPayments || []),
        ...(verificationPayments || [])
      ].reduce((sum, p) => sum + parseFloat(p.amount_usd?.toString() || '0'), 0);

      // Fetch active users
      const { data: activeUsers } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_active', true);

      // Fetch pending activations
      const { data: pendingActivations } = await supabase
        .from('activation_payments')
        .select('id')
        .eq('status', 'paid');

      // Fetch pending verifications
      const { data: pendingVerifications } = await supabase
        .from('verification_payments')
        .select('id')
        .eq('status', 'paid');

      // Fetch pending withdrawals
      const { data: pendingWithdrawals } = await supabase
        .from('withdrawal_requests')
        .select('id')
        .eq('status', 'pending');

      // Fetch all users and pending signups
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, is_active');

      const newSignupsCount = allProfiles?.length || 0;
      const pendingSignupsCount = allProfiles?.filter(p => !p.is_active).length || 0;

      setStats({
        totalPayments: (activationPayments?.length || 0) + (verificationPayments?.length || 0),
        pendingActivations: pendingActivations?.length || 0,
        pendingVerifications: pendingVerifications?.length || 0,
        pendingWithdrawals: pendingWithdrawals?.length || 0,
        totalRevenue,
        activeUsers: activeUsers?.length || 0,
        newSignups: newSignupsCount,
        pendingSignups: pendingSignupsCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading Admin Control...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const totalPending = stats.pendingActivations + stats.pendingVerifications + stats.pendingWithdrawals + stats.pendingSignups;

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f4f7fe]">
      <Header
        showLogo
        showMenu
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        backTo="/"
      />

      <div className="flex flex-1 overflow-hidden w-full">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#2b3674] tracking-tight">System Control Center</h1>
                <p className="text-slate-500 text-sm mt-1">Monitor and manage all client operations in real-time.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attention Required</p>
                    <p className="text-lg font-bold text-[#2b3674] leading-none">{totalPending}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard 
                title="Total Revenue" 
                value={`$${stats.totalRevenue.toLocaleString()}`} 
                icon={<DollarSign className="w-6 h-6" />}
                trend="+12.5%"
                color="blue"
              />
              <StatCard 
                title="New Signups" 
                value={stats.newSignups} 
                icon={<UserPlus className="w-6 h-6" />}
                trend={`${stats.pendingSignups} pending`}
                color="indigo"
              />
              <StatCard 
                title="Active Clients" 
                value={stats.activeUsers} 
                icon={<Users className="w-6 h-6" />}
                trend="Live now"
                color="green"
              />
              <StatCard 
                title="Pending Actions" 
                value={totalPending} 
                icon={<Activity className="w-6 h-6" />}
                trend="Needs review"
                color="amber"
              />
            </div>

            {/* Main Content Sections */}
            <div className="space-y-8 pb-12">
              {/* Clients Section */}
              <section id="new-signups" className="scroll-mt-20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                    <Users className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-bold text-[#2b3674]">Client Directory</h2>
                  <Badge variant="outline" className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-100">
                    {stats.newSignups} Total
                  </Badge>
                </div>
                <NewSignupsTable />
              </section>

              {/* Financial Sections */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <section id="activation-payments" className="scroll-mt-20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-bold text-[#2b3674]">Activations</h2>
                    {stats.pendingActivations > 0 && (
                      <Badge className="ml-2 bg-amber-500 text-white border-none">
                        {stats.pendingActivations} Pending
                      </Badge>
                    )}
                  </div>
                  <ActivationPaymentsTable />
                </section>

                <section id="verification-payments" className="scroll-mt-20">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-600">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-bold text-[#2b3674]">Verifications</h2>
                    {stats.pendingVerifications > 0 && (
                      <Badge className="ml-2 bg-amber-500 text-white border-none">
                        {stats.pendingVerifications} Pending
                      </Badge>
                    )}
                  </div>
                  <VerificationPaymentsTable />
                </section>
              </div>

              <section id="withdrawals" className="scroll-mt-20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-bold text-[#2b3674]">Withdrawal Requests</h2>
                  {stats.pendingWithdrawals > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white border-none animate-pulse">
                      {stats.pendingWithdrawals} Action Required
                    </Badge>
                  )}
                </div>
                <WithdrawalsTable />
              </section>

              <section id="all-payments" className="scroll-mt-20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-bold text-[#2b3674]">Financial Activity Log</h2>
                </div>
                <AllPaymentsTable />
              </section>

              <section id="deposits" className="scroll-mt-20">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-bold text-[#2b3674]">Manual Deposits</h2>
                </div>
                <DepositsTable />
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: 'blue' | 'indigo' | 'green' | 'amber';
}

const StatCard = ({ title, value, icon, trend, color }: StatCardProps) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600"
  };

  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color]}`}>
            {icon}
          </div>
          {trend && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" />
              {trend}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-[#2b3674] mt-1 tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDashboard;
