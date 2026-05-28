import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, Eye } from "lucide-react";

const WithdrawalsTable = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const [withdrawCode, setWithdrawCode] = useState("");

  useEffect(() => {
    fetchWithdrawals();

    const channel = supabase
      .channel('withdrawals-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawal_requests' }, () => {
        fetchWithdrawals();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          profiles!withdrawal_requests_user_id_fkey(email, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedWithdrawal) return;

    try {
      const { error } = await supabase.functions.invoke('approve-withdrawal', {
        body: {
          withdrawal_id: selectedWithdrawal.id,
          target_user_id: selectedWithdrawal.user_id,
          approved: true,
          admin_note: adminNote,
          withdraw_code: withdrawCode || `WC-${Date.now()}`
        }
      });

      if (error) throw error;
      toast.success("Withdrawal approved successfully!");
      setSelectedWithdrawal(null);
      setAdminNote("");
      setWithdrawCode("");
      fetchWithdrawals();
    } catch (error: any) {
      console.error('Error approving withdrawal:', error);
      toast.error(error.message || "Failed to approve withdrawal");
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;

    try {
      const { error } = await supabase.functions.invoke('approve-withdrawal', {
        body: {
          withdrawal_id: selectedWithdrawal.id,
          target_user_id: selectedWithdrawal.user_id,
          approved: false,
          admin_note: adminNote
        }
      });

      if (error) throw error;
      toast.success("Withdrawal rejected");
      setSelectedWithdrawal(null);
      setAdminNote("");
      fetchWithdrawals();
    } catch (error: any) {
      console.error('Error rejecting withdrawal:', error);
      toast.error(error.message || "Failed to reject withdrawal");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
          <CardDescription>Review and process withdrawal requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount (KES)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No withdrawal requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell className="font-medium">
                        {withdrawal.profiles?.full_name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm">{withdrawal.profiles?.email}</TableCell>
                      <TableCell className="font-semibold">
                        KES {parseFloat(withdrawal.amount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          withdrawal.status === 'approved' ? 'default' :
                          withdrawal.status === 'rejected' ? 'destructive' :
                          'secondary'
                        }>
                          {withdrawal.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {withdrawal.withdraw_code || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {withdrawal.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedWithdrawal(withdrawal);
                              setWithdrawCode(`WC-${Date.now()}`);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
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

      <Dialog open={!!selectedWithdrawal} onOpenChange={() => setSelectedWithdrawal(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Review Withdrawal Request</DialogTitle>
            <DialogDescription>
              User: {selectedWithdrawal?.profiles?.full_name || selectedWithdrawal?.profiles?.email}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="text-2xl font-bold">
                KES {selectedWithdrawal ? parseFloat(selectedWithdrawal.amount).toFixed(2) : '0.00'}
              </div>
            </div>

            {selectedWithdrawal?.client_note && (
              <div className="space-y-2">
                <Label>Client Note</Label>
                <p className="text-sm text-muted-foreground">{selectedWithdrawal.client_note}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="withdraw-code">Withdraw Code</Label>
              <Input
                id="withdraw-code"
                value={withdrawCode}
                onChange={(e) => setWithdrawCode(e.target.value)}
                placeholder="Auto-generated code"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-note">Admin Note (Optional)</Label>
              <Textarea
                id="admin-note"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add any notes about this withdrawal..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleReject}
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve & Issue Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WithdrawalsTable;
