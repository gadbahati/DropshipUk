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

    const isAdmin = roles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      throw new Error('Forbidden - Admin access required');
    }

    const { payment_id, target_user_id, approved } = await req.json();
    console.log('Activation approval:', { adminId: user.id, paymentId: payment_id, approved });

    if (approved) {
      // Update profile activation status
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({
          activation_status: 'approved',
          is_active: true
        })
        .eq('id', target_user_id);

      if (profileError) throw profileError;

      // Update payment status
      const { error: paymentError } = await supabaseClient
        .from('activation_payments')
        .update({ status: 'approved' })
        .eq('id', payment_id);

      if (paymentError) throw paymentError;
    } else {
      // Reject activation
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({ activation_status: 'rejected' })
        .eq('id', target_user_id);

      if (profileError) throw profileError;

      const { error: paymentError } = await supabaseClient
        .from('activation_payments')
        .update({ status: 'rejected' })
        .eq('id', payment_id);

      if (paymentError) throw paymentError;
    }

    // Log admin action
    const { error: auditError } = await supabaseClient
      .from('admin_actions')
      .insert({
        admin_user_id: user.id,
        target_user_id,
        action_type: approved ? 'approve_activation' : 'reject_activation',
        details: { payment_id }
      });

    if (auditError) console.error('Failed to log audit:', auditError);

    console.log('Activation decision recorded:', { approved, target_user_id });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Activation ${approved ? 'approved' : 'rejected'} successfully`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Activation approval error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
