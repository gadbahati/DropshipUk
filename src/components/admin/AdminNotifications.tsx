import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle, Info, AlertCircle, DollarSign, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to new notifications
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select(`
          *,
          profiles!admin_notifications_user_id_fkey(email, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error("Failed to mark as read");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_signup':
        return <UserPlus className="w-4 h-4 text-indigo-500" />;
      case 'payment_received':
      case 'withdrawal_request':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading alerts...</div>;
  }

  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
              <Bell className="w-4 h-4" />
            </div>
            <CardTitle className="text-lg font-bold text-[#2b3674]">System Alerts</CardTitle>
          </div>
          <CardDescription className="text-slate-500">Recent operational events.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <CheckCircle className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-200 group ${
                  notification.is_read ? 'bg-slate-50/50 opacity-60' : 'bg-slate-50 border-l-4 border-primary shadow-sm'
                }`}
              >
                <div className={`mt-1 p-2 rounded-xl ${notification.is_read ? 'bg-slate-100' : 'bg-white shadow-sm'}`}>
                  {getIcon(notification.event_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm leading-tight truncate ${notification.is_read ? 'text-slate-500 font-medium' : 'text-[#2b3674] font-bold'}`}>
                      {notification.message}
                    </p>
                    <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[10px] text-slate-400 truncate">
                      {notification.profiles?.full_name || 'System Event'}
                    </p>
                    {!notification.is_read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-[10px] font-bold text-primary hover:underline"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminNotifications;
