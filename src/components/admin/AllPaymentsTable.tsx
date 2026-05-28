import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DollarSign, Calendar, CreditCard } from "lucide-react";
import { format } from "date-fns";

interface Payment {
  id: string;
  user_id: string;
  amount_usd: number;
  amount_kes: number;
  payment_method: string;
  status: string;
  created_at: string;
  type: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const AllPaymentsTable = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPayments();
  }, []);

  const fetchAllPayments = async () => {
    try {
      // Fetch activation payments
      const { data: activationPayments, error: activationError } = await supabase
        .from('activation_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (activationError) throw activationError;

      // Fetch verification payments
      const { data: verificationPayments, error: verificationError } = await supabase
        .from('verification_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (verificationError) throw verificationError;

      // Get unique user IDs
      const userIds = [...new Set([
        ...(activationPayments || []).map(p => p.user_id),
        ...(verificationPayments || []).map(p => p.user_id)
      ])];

      // Fetch profiles for all users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

      // Combine and format all payments
      const allPayments: Payment[] = [
        ...(activationPayments || []).map(p => ({
          ...p,
          type: 'Activation',
          profiles: profileMap.get(p.user_id) || { full_name: 'Unknown', email: 'unknown@email.com' }
        })),
        ...(verificationPayments || []).map(p => ({
          ...p,
          type: 'Verification',
          profiles: profileMap.get(p.user_id) || { full_name: 'Unknown', email: 'unknown@email.com' }
        }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setPayments(allPayments);
    } catch (error: any) {
      toast.error("Failed to fetch payments");
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          All Payments Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">Method</th>
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-6 text-muted-foreground">
                    No payments yet
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={`${payment.type}-${payment.id}`} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{payment.profiles?.full_name}</div>
                        <div className="text-xs text-muted-foreground">{payment.profiles?.email}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {payment.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">${payment.amount_usd}</div>
                        <div className="text-xs text-muted-foreground">KES {payment.amount_kes}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="h-4 w-4" />
                        {payment.payment_method || 'M-Pesa'}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'approved' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : payment.status === 'rejected'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AllPaymentsTable;
