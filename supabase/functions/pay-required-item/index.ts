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

    const { required_item_id, payment_method, transaction_code, metadata } = await req.json();
    console.log('Payment for required item:', { userId: user.id, required_item_id, payment_method });

    // Get the required item details
    const { data: requiredItem, error: itemError } = await supabaseClient
      .from('required_items')
      .select('*')
      .eq('id', required_item_id)
      .single();

    if (itemError || !requiredItem) {
      throw new Error('Required item not found');
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('required_item_payments')
      .insert({
        user_id: user.id,
        required_item_id,
        amount_usd: parseFloat(requiredItem.amount_usd),
        amount_kes: parseFloat(requiredItem.amount_kes),
        payment_method: payment_method || 'mpesa',
        status: 'completed',
        gateway_id: transaction_code,
        metadata: { ...metadata, transaction_code }
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    // Update or create user status
    const { error: statusError } = await supabaseClient
      .from('user_required_item_status')
      .upsert({
        user_id: user.id,
        required_item_id,
        status: 'paid',
        transaction_id: payment.id,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,required_item_id'
      });

    if (statusError) throw statusError;

    // Get all required items to find next unpaid one
    const { data: allItems } = await supabaseClient
      .from('required_items')
      .select('*')
      .order('order_index', { ascending: true });

    const { data: userStatuses } = await supabaseClient
      .from('user_required_item_status')
      .select('*')
      .eq('user_id', user.id);

    const statusMap = new Map(
      (userStatuses || []).map(status => [status.required_item_id, status])
    );

    let nextRequiredItem = null;
    for (const item of allItems || []) {
      const status = statusMap.get(item.id);
      if (!status || (status.status !== 'paid' && status.status !== 'waived')) {
        nextRequiredItem = item;
        break;
      }
    }

    // Create admin notification
    const { error: notifError } = await supabaseClient
      .from('admin_notifications')
      .insert({
        user_id: user.id,
        payment_id: payment.id,
        event_type: 'required_item_paid',
        message: `User ${user.email} paid for ${requiredItem.description}`,
        is_read: false
      });

    if (notifError) console.error('Failed to create admin notification:', notifError);

    console.log('Payment successful:', payment.id);

    return new Response(
      JSON.stringify({
        success: true,
        payment_id: payment.id,
        next_required_item: nextRequiredItem ? {
          id: nextRequiredItem.id,
          key: nextRequiredItem.key,
          type: nextRequiredItem.type,
          amount_usd: parseFloat(nextRequiredItem.amount_usd),
          amount_kes: parseFloat(nextRequiredItem.amount_kes),
          description: nextRequiredItem.description,
          order_index: nextRequiredItem.order_index
        } : null
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Payment error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});