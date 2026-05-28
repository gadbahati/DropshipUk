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

    console.log('Fetching required items status for user:', user.id);

    // Get all required items
    const { data: requiredItems, error: itemsError } = await supabaseClient
      .from('required_items')
      .select('*')
      .order('order_index', { ascending: true });

    if (itemsError) throw itemsError;

    // Get user's statuses
    const { data: userStatuses, error: statusError } = await supabaseClient
      .from('user_required_item_status')
      .select('*')
      .eq('user_id', user.id);

    if (statusError) throw statusError;

    const statusMap = new Map(
      (userStatuses || []).map(status => [status.required_item_id, status])
    );

    const itemsWithStatus = (requiredItems || []).map(item => ({
      id: item.id,
      key: item.key,
      type: item.type,
      amount_usd: parseFloat(item.amount_usd),
      amount_kes: parseFloat(item.amount_kes),
      description: item.description,
      order_index: item.order_index,
      status: statusMap.get(item.id)?.status || 'pending',
      transaction_id: statusMap.get(item.id)?.transaction_id || null
    }));

    console.log('Required items status:', itemsWithStatus);

    return new Response(
      JSON.stringify({ items: itemsWithStatus }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error fetching required items:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});