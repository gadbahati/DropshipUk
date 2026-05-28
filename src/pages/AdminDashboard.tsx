import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Users, DollarSign, Activity, ShieldCheck, Wallet, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import WithdrawalsTable from "@/components/admin/WithdrawalsTable";
import ActivationPaymentsTable from "@/components/admin/ActivationPaymentsTable";
import VerificationPaymentsTable from "@/components/admin/VerificationPaymentsTable";
import NewSignupsTable from "@/components/admin/NewSignupsTable";
import AllPaymentsTable from "@/components/admin/AllPaymentsTable";
import { DepositsTable } from "@/components/admin/DepositsTable";

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header
        showLogo
        showMenu
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        backTo="/"
      />

      <div className="flex flex-1 overflow-hidden w-full">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold">Clients Management Dashboard</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New Signups</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.newSignups}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingSignups} pending approval
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPayments}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <Activity className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Activations</CardTitle>
                  <Bell className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{stats.pendingActivations}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.pendingVerifications}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
                  <Wallet className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.pendingWithdrawals}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <Bell className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.pendingActivations + stats.pendingVerifications + stats.pendingWithdrawals + stats.pendingSignups}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Clients Section - All client information */}
            <div className="space-y-4 md:space-y-6">
              {/* New Signups */}
              <div id="new-signups">
                <NewSignupsTable />
              </div>

              {/* All Payments Activity */}
              <div id="all-payments">
                <AllPaymentsTable />
              </div>

              {/* Deposits */}
              <div id="deposits">
                <DepositsTable />
              </div>

              {/* Activation Payments */}
              <div id="activation-payments">
                <ActivationPaymentsTable />
              </div>

              {/* Verification Payments */}
              <div id="verification-payments">
                <VerificationPaymentsTable />
              </div>

              {/* Withdrawal Requests */}
              <div id="withdrawals">
                <WithdrawalsTable />
              </div>


            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;