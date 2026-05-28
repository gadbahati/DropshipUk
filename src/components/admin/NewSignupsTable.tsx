import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserCheck, UserX, Shield, Star, User, MoreHorizontal, Mail, Phone, Calendar, CheckCircle2, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NewSignupsTable = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();

    const channel = supabase
      .channel('profiles-admin-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchProfiles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: !currentStatus })
        .eq('id', userId);

      if (error) throw error;
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      // First delete existing roles
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      // Then insert new role
      const { error } = await supabase.from('user_roles').insert({
        user_id: userId,
        role: newRole
      });

      if (error) throw error;
      toast.success(`Role updated to ${newRole}`);
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateActivation = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          activation_status: status,
          is_active: status === 'approved'
        })
        .eq('id', userId);

      if (error) throw error;
      toast.success(`Activation status set to ${status}`);
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateVerification = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          verification_status: status,
          is_verified: status === 'approved'
        })
        .eq('id', userId);

      if (error) throw error;
      toast.success(`Verification status set to ${status}`);
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getRoleBadge = (roles: any[]) => {
    const role = roles?.[0]?.role || 'client';
    switch (role) {
      case 'admin':
      case 'super_admin':
        return <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>;
      case 'agent':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100"><Star className="w-3 h-3 mr-1" /> Agent</Badge>;
      default:
        return <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100"><User className="w-3 h-3 mr-1" /> Client</Badge>;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading clients...</div>;
  }

  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-[#2b3674]">Client Management</CardTitle>
            <CardDescription className="text-slate-500">View and manage all registered users and their permissions.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client Info</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Activation</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verification</TableHead>
                <TableHead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Role</TableHead>
                <TableHead className="text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {profile.full_name?.substring(0, 2).toUpperCase() || '??'}
                      </div>
                      <div>
                        <p className="font-bold text-[#2b3674] text-sm">{profile.full_name || 'Anonymous'}</p>
                        <p className="text-[10px] text-slate-400">{profile.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={profile.is_active 
                      ? "bg-green-50 text-green-700 border-green-100 hover:bg-green-50" 
                      : "bg-red-50 text-red-700 border-red-100 hover:bg-red-50"
                    }>
                      {profile.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      profile.activation_status === 'approved' ? "bg-blue-50 text-blue-700 border-blue-100" :
                      profile.activation_status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-100" :
                      "bg-slate-50 text-slate-700 border-slate-100"
                    }>
                      {profile.activation_status || 'none'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      profile.verification_status === 'approved' ? "bg-cyan-50 text-cyan-700 border-cyan-100" :
                      profile.verification_status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-100" :
                      "bg-slate-50 text-slate-700 border-slate-100"
                    }>
                      {profile.verification_status || 'none'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(profile.user_roles)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-xl border-slate-100 shadow-xl">
                        <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quick Actions</DropdownMenuLabel>
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => handleToggleStatus(profile.id, profile.is_active)}
                        >
                          {profile.is_active ? <UserX className="w-4 h-4 text-red-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                          <span>{profile.is_active ? 'Deactivate' : 'Activate'} Account</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuSeparator className="bg-slate-50" />
                        <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activation Status</DropdownMenuLabel>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => handleUpdateActivation(profile.id, 'approved')}>
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span>Approve Activation</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => handleUpdateActivation(profile.id, 'rejected')}>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span>Reject Activation</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-slate-50" />
                        <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verification Status</DropdownMenuLabel>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => handleUpdateVerification(profile.id, 'approved')}>
                          <CheckCircle2 className="w-4 h-4 text-cyan-500" />
                          <span>Approve Verification</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => handleUpdateVerification(profile.id, 'rejected')}>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span>Reject Verification</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-slate-50" />
                        <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">User Role</DropdownMenuLabel>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => handleUpdateRole(profile.id, 'client')}>
                          <User className="w-4 h-4 text-slate-400" />
                          <span>Set as Client</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => handleUpdateRole(profile.id, 'agent')}>
                          <Star className="w-4 h-4 text-blue-500" />
                          <span>Set as Agent</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => handleUpdateRole(profile.id, 'admin')}>
                          <Shield className="w-4 h-4 text-red-500" />
                          <span>Set as Admin</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewSignupsTable;
