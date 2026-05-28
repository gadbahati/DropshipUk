import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserCheck, UserX, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Profile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  is_active: boolean;
}

const NewSignupsTable = () => {
  const [signups, setSignups] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSignups();
    
    // Subscribe to new signups
    const channel = supabase
      .channel('new-signups')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchSignups();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSignups = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSignups(data || []);
    } catch (error: any) {
      toast.error("Failed to fetch signups");
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (error) throw error;

      toast.success(isActive ? "User activated successfully" : "User deactivated");
      fetchSignups();
    } catch (error: any) {
      toast.error("Failed to update user status");
      console.error('Error:', error);
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
          <UserCheck className="h-5 w-5" />
          All User Signups
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Signed Up</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {signups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-6 text-muted-foreground">
                    No signups yet
                  </td>
                </tr>
              ) : (
                signups.map((signup) => (
                  <tr key={signup.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-medium">{signup.full_name}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {signup.email}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(signup.created_at), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        signup.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {signup.is_active ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {!signup.is_active ? (
                          <Button
                            size="sm"
                            onClick={() => handleActivate(signup.id, true)}
                            className="flex items-center gap-1"
                          >
                            <UserCheck className="h-4 w-4" />
                            Activate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivate(signup.id, false)}
                            className="flex items-center gap-1"
                          >
                            <UserX className="h-4 w-4" />
                            Deactivate
                          </Button>
                        )}
                      </div>
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

export default NewSignupsTable;
