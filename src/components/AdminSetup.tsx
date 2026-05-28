import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminSetup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const grantAdminRole = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      // Get user by email
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (!profiles) {
        toast.error("User not found");
        return;
      }

      // Grant admin role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: profiles.id,
          role: 'admin'
        });

      if (error) throw error;

      toast.success("Admin role granted successfully!");
      setEmail("");
    } catch (error: any) {
      console.error('Error granting admin role:', error);
      toast.error(error.message || "Failed to grant admin role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Grant Admin Access</CardTitle>
        <CardDescription>
          Enter the email address of the user you want to grant admin privileges
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={grantAdminRole} disabled={loading} className="w-full">
          {loading ? "Granting..." : "Grant Admin Role"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminSetup;