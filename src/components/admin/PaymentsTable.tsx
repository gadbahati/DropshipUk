import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Search, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PaymentsTable = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = payments.filter(p => 
        p.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.gateway_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.required_items?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPayments(filtered);
    } else {
      setFilteredPayments(payments);
    }
  }, [searchTerm, payments]);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('required_item_payments')
        .select(`
          *,
          profiles!required_item_payments_user_id_fkey(email, full_name, is_active),
          required_items(description, key)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
      setFilteredPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const { error } = await supabase.functions.invoke('admin-activate-user', {
        body: {
          target_user_id: userId,
          action: 'activate',
          notes: 'Activated via admin dashboard'
        }
      });

      if (error) throw error;

      toast.success("User activated successfully");
      fetchPayments();
    } catch (error: any) {
      console.error('Activation error:', error);
      toast.error(error.message || "Failed to activate user");
    }
  };

  const exportToCSV = () => {
    const headers = ['Payment ID', 'User Email', 'Item', 'Amount USD', 'Amount KES', 'Status', 'Transaction ID', 'Date'];
    const rows = filteredPayments.map(p => [
      p.id,
      p.profiles?.email || '',
      p.required_items?.description || '',
      p.amount_usd,
      p.amount_kes,
      p.status,
      p.gateway_id || '',
      new Date(p.created_at).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Payments</CardTitle>
            <CardDescription>View and manage user payments</CardDescription>
          </div>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, transaction ID, or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.profiles?.email}</p>
                        <p className="text-sm text-muted-foreground">{payment.profiles?.full_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>{payment.required_items?.description}</TableCell>
                    <TableCell>
                      <div>
                        <p>${payment.amount_usd}</p>
                        <p className="text-sm text-muted-foreground">KES {payment.amount_kes}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{payment.gateway_id || '-'}</TableCell>
                    <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        payment.profiles?.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.profiles?.is_active ? 'Active' : 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {!payment.profiles?.is_active && (
                        <Button
                          size="sm"
                          onClick={() => handleActivateUser(payment.user_id)}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Activate
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
  );
};

export default PaymentsTable;