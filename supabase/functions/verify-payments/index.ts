import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting payment verification process...');

    // Get pending verifications that are due
    const { data: pendingVerifications, error: fetchError } = await supabase
      .from('pending_verifications')
      .select('*')
      .eq('is_verified', false)
      .lte('verification_due_at', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching pending verifications:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingVerifications?.length || 0} verifications to process`);

    const results = [];

    for (const verification of pendingVerifications || []) {
      try {
        console.log(`Processing verification for user ${verification.user_id}, type: ${verification.payment_type}`);

        // Mark verification as complete
        await supabase
          .from('pending_verifications')
          .update({
            is_verified: true,
            verified_at: new Date().toISOString(),
          })
          .eq('id', verification.id);

        // Update profile - set is_verified and is_active to true
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            is_verified: true,
            is_active: true,
            payment_verified: true,
            payment_verified_at: new Date().toISOString(),
            verification_pending: false,
            verification_due_at: null,
          })
          .eq('id', verification.user_id);

        if (profileError) {
          console.error('Error updating profile:', profileError);
          throw profileError;
        }

        // Handle different payment types
        if (verification.payment_type === 'booking' && verification.booking_id) {
          // Mark booking as paid
          await supabase
            .from('bookings')
            .update({
              is_paid: true,
              status: 'in_transit',
              payment_method: 'M-Pesa',
            })
            .eq('id', verification.booking_id);

          console.log(`Booking ${verification.booking_id} marked as paid`);
        } else if (verification.payment_type === 'deposit' || verification.payment_type === 'activation') {
          // Add amount to wallet
          const { data: wallet } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', verification.user_id)
            .single();

          if (wallet) {
            await supabase
              .from('wallets')
              .update({
                balance: Number(wallet.balance) + Number(verification.amount),
              })
              .eq('user_id', verification.user_id);

            // Create transaction record
            await supabase.from('transactions').insert({
              user_id: verification.user_id,
              type: verification.payment_type,
              amount: verification.amount,
              status: 'completed',
              description: `${verification.payment_reason} - ${verification.transaction_code}`,
              payment_method: 'M-Pesa',
            });

            console.log(`Wallet updated for user ${verification.user_id}, amount: ${verification.amount}`);
          }
        }

        results.push({
          verification_id: verification.id,
          user_id: verification.user_id,
          status: 'success',
        });

        console.log(`Verification ${verification.id} completed successfully`);
      } catch (error: any) {
        console.error(`Error processing verification ${verification.id}:`, error);
        results.push({
          verification_id: verification.id,
          user_id: verification.user_id,
          status: 'error',
          error: error.message,
        });
      }
    }

    console.log('Payment verification process completed');

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
