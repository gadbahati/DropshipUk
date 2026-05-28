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

    const { withdrawal_id, target_user_id, approved, admin_note, withdraw_code } = await req.json();
    console.log('Withdrawal approval:', { adminId: user.id, withdrawalId: withdrawal_id, approved });

    // Get withdrawal details
    const { data: withdrawal } = await supabaseClient
      .from('withdrawal_requests')
      .select('amount')
      .eq('id', withdrawal_id)
      .single();

    if (!withdrawal) {
      throw new Error('Withdrawal request not found');
    }

    if (approved) {
      // Update withdrawal request
      const { error: withdrawalError } = await supabaseClient
        .from('withdrawal_requests')
        .update({
          status: 'approved',
          admin_note,
          withdraw_code: withdraw_code || `WC-${Date.now()}`
        })
        .eq('id', withdrawal_id);

      if (withdrawalError) throw withdrawalError;

      // Deduct from wallet
      const { error: walletError } = await supabaseClient.rpc('decrement_wallet_balance', {
        user_id_param: target_user_id,
        amount_param: withdrawal.amount
      });

      if (walletError) {
        // Manual wallet update if RPC fails
        const { data: wallet } = await supabaseClient
          .from('wallets')
          .select('balance')
          .eq('user_id', target_user_id)
          .single();

        if (wallet) {
          await supabaseClient
            .from('wallets')
            .update({ balance: wallet.balance - withdrawal.amount })
            .eq('user_id', target_user_id);
        }
      }

      // Create transaction record
      await supabaseClient
        .from('transactions')
        .insert({
          user_id: target_user_id,
          type: 'withdrawal',
          amount: withdrawal.amount,
          status: 'completed',
          description: `Withdrawal approved by admin`
        });
    } else {
      // Reject withdrawal
      const { error: withdrawalError } = await supabaseClient
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          admin_note
        })
        .eq('id', withdrawal_id);

      if (withdrawalError) throw withdrawalError;
    }

    // Log admin action
    const { error: auditError } = await supabaseClient
      .from('admin_actions')
      .insert({
        admin_user_id: user.id,
        target_user_id,
        action_type: approved ? 'approve_withdrawal' : 'reject_withdrawal',
        details: { withdrawal_id, admin_note, withdraw_code }
      });

    if (auditError) console.error('Failed to log audit:', auditError);

    console.log('Withdrawal decision recorded:', { approved, withdrawal_id });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Withdrawal ${approved ? 'approved' : 'rejected'} successfully`,
        withdraw_code: approved ? (withdraw_code || `WC-${Date.now()}`) : null
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Withdrawal approval error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
