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

    const { payment_method, transaction_id } = await req.json();
    console.log('Activation request:', { userId: user.id, payment_method });

    // Create activation payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('activation_payments')
      .insert({
        user_id: user.id,
        payment_method,
        transaction_id,
        status: 'paid'
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Update profile
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        activation_paid_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) throw profileError;

    // Create admin notification
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const { error: notifError } = await supabaseClient
      .from('admin_notifications')
      .insert({
        user_id: user.id,
        event_type: 'activation_payment',
        message: `New activation payment from ${profile?.full_name || profile?.email || 'User'} - $100 USD`,
        payment_id: payment.id
      });

    if (notifError) console.error('Failed to create notification:', notifError);

    console.log('Activation payment recorded:', payment.id);

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: payment.id,
        message: 'Activation payment submitted. Awaiting admin approval.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Activation request error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
