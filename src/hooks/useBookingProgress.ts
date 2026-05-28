import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook to automatically update booking progress in the background
 * Simulates real-time progress by incrementing booking_percentage
 */
export const useBookingProgress = (userId: string | undefined, enabled: boolean = true) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userId || !enabled) return;

    const updateProgress = async () => {
      try {
        const client = supabase as any;
        
        // Fetch active bookings
        const { data: bookings, error: fetchError } = await client
          .from("bookings")
          .select("*")
          .eq("user_id", userId)
          .eq("is_paid", true)
          .eq("status", "in_transit")
          .lt("booking_percentage", 100);

        if (fetchError) throw fetchError;
        if (!bookings || bookings.length === 0) return;

        // Update each booking
        for (const booking of bookings) {
          const newPercentage = Math.min(booking.booking_percentage + 10, 100);
          const newStatus = newPercentage === 100 ? "delivered" : "in_transit";

          await client
            .from("bookings")
            .update({ 
              booking_percentage: newPercentage,
              status: newStatus
            })
            .eq("id", booking.id);

          // If completed, add outcome to wallet
          if (newPercentage === 100) {
            const { data: wallet } = await client
              .from("wallets")
              .select("balance")
              .eq("user_id", userId)
              .single();

            if (wallet) {
              await client
                .from("wallets")
                .update({ 
                  balance: Number(wallet.balance) + Number(booking.outcome_amount)
                })
                .eq("user_id", userId);

              // Create transaction record
              await client.from("transactions").insert({
                user_id: userId,
                type: "booking_outcome",
                amount: booking.outcome_amount,
                booking_id: booking.id,
                status: "completed",
                description: `Booking completed - outcome received`,
              });

              toast.success(`🎉 Booking completed! KES ${booking.outcome_amount.toLocaleString()} added to your wallet!`);
            }
          }
        }
      } catch (error) {
        console.error("Error updating booking progress:", error);
      }
    };

    // Update progress every 30 seconds
    intervalRef.current = setInterval(updateProgress, 30000);

    // Run once immediately
    updateProgress();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [userId, enabled]);
};
