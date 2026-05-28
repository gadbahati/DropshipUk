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

    const { amount } = await req.json();
    console.log('Withdraw request:', { userId: user.id, amount });

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

    // Get all required items ordered
    const { data: requiredItems } = await supabaseClient
      .from('required_items')
      .select('*')
      .order('order_index', { ascending: true });

    if (!requiredItems || requiredItems.length === 0) {
      throw new Error('Required items not configured');
    }

    // Get user's status for each required item
    const { data: userStatuses } = await supabaseClient
      .from('user_required_item_status')
      .select('*')
      .eq('user_id', user.id);

    const statusMap = new Map(
      (userStatuses || []).map(status => [status.required_item_id, status])
    );

    // Find first unpaid/unwaived item
    let nextRequiredItem = null;
    for (const item of requiredItems) {
      const status = statusMap.get(item.id);
      if (!status || (status.status !== 'paid' && status.status !== 'waived')) {
        nextRequiredItem = item;
        break;
      }
    }

    // If there's a required item, decline the withdrawal
    if (nextRequiredItem) {
      console.log('Withdrawal declined - required item:', nextRequiredItem.key);
      
      return new Response(
        JSON.stringify({
          status: 'declined',
          next_required_item: {
            id: nextRequiredItem.id,
            key: nextRequiredItem.key,
            type: nextRequiredItem.type,
            amount_usd: parseFloat(nextRequiredItem.amount_usd),
            amount_kes: parseFloat(nextRequiredItem.amount_kes),
            description: nextRequiredItem.description,
            order_index: nextRequiredItem.order_index
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // All items cleared - process withdrawal
    console.log('All requirements met - processing withdrawal');
    
    // Create withdrawal transaction
    const { data: transaction, error: txError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'withdrawal',
        amount: parseFloat(amount),
        status: 'completed',
        description: 'Withdrawal request'
      })
      .select()
      .single();

    if (txError) throw txError;

    // Update wallet balance
    const { error: walletError } = await supabaseClient
      .from('wallets')
      .update({ balance: wallet.balance - parseFloat(amount) })
      .eq('user_id', user.id);

    if (walletError) throw walletError;

    console.log('Withdrawal successful:', transaction.id);

    return new Response(
      JSON.stringify({
        status: 'ok',
        withdrawal_id: transaction.id,
        message: 'Withdrawal processed successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Withdrawal error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});