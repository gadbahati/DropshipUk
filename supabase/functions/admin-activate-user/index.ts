import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = roles?.some(r => r.role === 'admin' || r.role === 'super_admin');
    if (!isAdmin) {
      throw new Error('Forbidden - Admin access required');
    }

    const { target_user_id, action, notes } = await req.json();
    console.log('Admin action:', { adminId: user.id, targetUserId: target_user_id, action });

    // Update user profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        is_active: action === 'activate',
        updated_at: new Date().toISOString()
      })
      .eq('id', target_user_id);

    if (profileError) throw profileError;

    // Log admin action
    const { error: auditError } = await supabaseClient
      .from('admin_actions')
      .insert({
        admin_user_id: user.id,
        target_user_id,
        action_type: action,
        details: { notes }
      });

    if (auditError) console.error('Failed to log audit:', auditError);

    console.log('User activation updated:', { targetUserId: target_user_id, action });

    return new Response(
      JSON.stringify({
        success: true,
        message: `User ${action === 'activate' ? 'activated' : 'deactivated'} successfully`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Admin activation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});