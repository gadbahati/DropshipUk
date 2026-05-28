import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminAuditLog = () => {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLog();
  }, []);

  const fetchAuditLog = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_actions')
        .select(`
          *,
          admin:profiles!admin_actions_admin_user_id_fkey(email, full_name),
          target:profiles!admin_actions_target_user_id_fkey(email, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActions(data || []);
    } catch (error) {
      console.error('Error fetching audit log:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Audit Log
          </CardTitle>
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
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Audit Log
        </CardTitle>
        <CardDescription>Recent admin actions and changes</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target User</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No audit records found
                  </TableCell>
                </TableRow>
              ) : (
                actions.map((action) => (
                  <TableRow key={action.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{action.admin?.email}</p>
                        <p className="text-sm text-muted-foreground">{action.admin?.full_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {action.action_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      {action.target ? (
                        <div>
                          <p className="font-medium">{action.target.email}</p>
                          <p className="text-sm text-muted-foreground">{action.target.full_name}</p>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{new Date(action.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {action.details?.notes || '-'}
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

export default AdminAuditLog;