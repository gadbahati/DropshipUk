import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

const VerificationPaymentsTable = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();

    const channel = supabase
      .channel('verification-payments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'verification_payments' }, () => {
        fetchPayments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('verification_payments')
        .select(`
          *,
          profiles!verification_payments_user_id_fkey(email, full_name, verification_status)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching verification payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: string, userId: string) => {
    try {
      const { error } = await supabase.functions.invoke('approve-verification', {
        body: {
          payment_id: paymentId,
          target_user_id: userId,
          approved: true
        }
      });

      if (error) throw error;
      toast.success("Verification approved successfully!");
      fetchPayments();
    } catch (error: any) {
      console.error('Error approving verification:', error);
      toast.error(error.message || "Failed to approve verification");
    }
  };

  const handleReject = async (paymentId: string, userId: string) => {
    try {
      const { error } = await supabase.functions.invoke('approve-verification', {
        body: {
          payment_id: paymentId,
          target_user_id: userId,
          approved: false
        }
      });

      if (error) throw error;
      toast.success("Verification rejected");
      fetchPayments();
    } catch (error: any) {
      console.error('Error rejecting verification:', error);
      toast.error(error.message || "Failed to reject verification");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Payments</CardTitle>
        <CardDescription>Review and approve account verification payments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No verification payments found
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.profiles?.full_name || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm">{payment.profiles?.email}</TableCell>
                    <TableCell>
                      ${payment.amount_usd} / KES {payment.amount_kes}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {payment.transaction_id || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        payment.status === 'approved' ? 'default' :
                        payment.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === 'paid' && (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(payment.id, payment.user_id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(payment.id, payment.user_id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
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

export default VerificationPaymentsTable;
