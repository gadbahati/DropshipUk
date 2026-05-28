import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active bookings with percentage < 100
    const { data: bookings, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("is_paid", true)
      .eq("status", "in_transit")
      .lt("booking_percentage", 100);

    if (fetchError) throw fetchError;

    if (!bookings || bookings.length === 0) {
      return new Response(JSON.stringify({ message: "No active bookings to update" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Update each booking's percentage (increment by 10%, max 100%)
    const updates = bookings.map(async (booking) => {
      const newPercentage = Math.min(booking.booking_percentage + 10, 100);
      const newStatus = newPercentage === 100 ? "delivered" : "in_transit";

      const { error: updateError } = await supabase
        .from("bookings")
        .update({ 
          booking_percentage: newPercentage,
          status: newStatus
        })
        .eq("id", booking.id);

      if (updateError) throw updateError;

      // If completed, add outcome to wallet
      if (newPercentage === 100) {
        const { data: wallet } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", booking.user_id)
          .single();

        if (wallet) {
          await supabase
            .from("wallets")
            .update({ 
              balance: Number(wallet.balance) + Number(booking.outcome_amount)
            })
            .eq("user_id", booking.user_id);

          // Create transaction record
          await supabase.from("transactions").insert({
            user_id: booking.user_id,
            type: "booking_outcome",
            amount: booking.outcome_amount,
            booking_id: booking.id,
            status: "completed",
            description: `Booking completed - ${booking.level} package outcome`,
          });
        }
      }

      return { id: booking.id, newPercentage, newStatus };
    });

    const results = await Promise.all(updates);

    return new Response(JSON.stringify({ 
      message: "Bookings updated successfully",
      updated: results 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
