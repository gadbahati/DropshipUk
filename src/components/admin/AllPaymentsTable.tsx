import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DollarSign, Calendar, CreditCard, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
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
    return <div className="p-8 text-center text-slate-500">Loading financial records...</div>;
  }

  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-[#2b3674]">Financial Activity Log</CardTitle>
            <CardDescription className="text-slate-500">Real-time history of all incoming payments and transactions.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Type</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Amount</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Method</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    No financial activity recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={`${payment.type}-${payment.id}`} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[10px]">
                          {payment.profiles?.full_name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-[#2b3674] text-sm">{payment.profiles?.full_name}</p>
                          <p className="text-[10px] text-slate-400">{payment.profiles?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        payment.type === 'Activation' 
                          ? "bg-blue-50 text-blue-700 border-blue-100" 
                          : "bg-cyan-50 text-cyan-700 border-cyan-100"
                      }>
                        {payment.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-bold text-[#2b3674]">
                        <span className="text-green-500 text-xs">+$</span>
                        {payment.amount_usd}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">({payment.amount_kes} KES)</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        {payment.payment_method || 'M-Pesa'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {format(new Date(payment.created_at), 'MMM dd, HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge className={
                        payment.status === 'approved' 
                          ? "bg-green-50 text-green-700 border-green-100 hover:bg-green-50"
                          : payment.status === 'rejected'
                          ? "bg-red-50 text-red-700 border-red-100 hover:bg-red-50"
                          : "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-50"
                      }>
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AllPaymentsTable;
