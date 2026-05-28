import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export const DepositsTable = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchDeposits = async () => {
    try {
      const { data, error } = await supabase
        .from("pending_verifications")
        .select(`
          *,
          profiles:user_id (
            full_name,
            email
          )
        `)
        .eq("payment_type", "deposit")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDeposits(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch deposits");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleApprove = async (deposit: any) => {
    setProcessingId(deposit.id);
    try {
      // Mark verification as complete
      await supabase
        .from("pending_verifications")
        .update({ is_verified: true, verified_at: new Date().toISOString() })
        .eq("id", deposit.id);

      // Add amount to wallet
      const { data: wallet } = await supabase
        .from("wallets")
        .select("balance")
        .eq("user_id", deposit.user_id)
        .single();

      if (wallet) {
        await supabase
          .from("wallets")
          .update({ balance: Number(wallet.balance) + Number(deposit.amount) })
          .eq("user_id", deposit.user_id);

        // Create transaction record
        await supabase.from("transactions").insert({
          user_id: deposit.user_id,
          type: "deposit",
          amount: deposit.amount,
          status: "completed",
          description: `Deposit approved - ${deposit.transaction_code}`,
          payment_method: "M-Pesa",
        });
      }

      toast.success("Deposit approved successfully");
      fetchDeposits();
    } catch (error: any) {
      toast.error("Failed to approve deposit");
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (deposit: any) => {
    setProcessingId(deposit.id);
    try {
      await supabase
        .from("pending_verifications")
        .delete()
        .eq("id", deposit.id);

      toast.success("Deposit declined");
      fetchDeposits();
    } catch (error: any) {
      toast.error("Failed to decline deposit");
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deposits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposits ({deposits.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Transaction Code</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No deposits found
                  </TableCell>
                </TableRow>
              ) : (
                deposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell className="font-medium">
                      {deposit.profiles?.full_name || "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {deposit.profiles?.email || "N/A"}
                    </TableCell>
                    <TableCell className="font-semibold">KES {deposit.amount}</TableCell>
                    <TableCell className="font-mono text-sm">{deposit.transaction_code}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(deposit.created_at), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={deposit.is_verified ? "default" : "secondary"}>
                        {deposit.is_verified ? "Verified" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!deposit.is_verified && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(deposit)}
                            disabled={processingId === deposit.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processingId === deposit.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <><CheckCircle className="h-4 w-4 mr-1" /> Approve</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDecline(deposit)}
                            disabled={processingId === deposit.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Decline
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
