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

    const { amount, client_note } = await req.json();
    console.log('Withdrawal request:', { userId: user.id, amount });

    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check wallet balance
    const { data: wallet } = await supabaseClient
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (!wallet || parseFloat(amount) > wallet.balance) {
      return new Response(
        JSON.stringify({ error: 'Insufficient balance' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create withdrawal request
    const { data: withdrawal, error: withdrawalError } = await supabaseClient
      .from('withdrawal_requests')
      .insert({
        user_id: user.id,
        amount: parseFloat(amount),
        client_note,
        status: 'pending'
      })
      .select()
      .single();

    if (withdrawalError) throw withdrawalError;

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
        event_type: 'withdrawal_request',
        message: `Withdrawal request from ${profile?.full_name || profile?.email || 'User'} - KES ${parseFloat(amount).toFixed(2)}`,
        payment_id: withdrawal.id
      });

    if (notifError) console.error('Failed to create notification:', notifError);

    console.log('Withdrawal request created:', withdrawal.id);

    return new Response(
      JSON.stringify({
        success: true,
        withdrawal_id: withdrawal.id,
        message: 'Withdrawal request submitted. Awaiting admin approval.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Withdrawal request error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
