import { useState } from "react";
import { Upload } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PaymentMethodsDialog } from "@/components/PaymentMethodsDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Deposit = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const { user } = useAuth();

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (parseFloat(amount) < 500) {
      toast.error("Minimum deposit is KES 500");
      return;
    }
    setPaymentDialogOpen(true);
  };

  const handlePaymentSubmit = async (transactionCode: string, reason: string) => {
    try {
      const verificationDueAt = new Date();
      verificationDueAt.setHours(verificationDueAt.getHours() + 4);

      await supabase.from("pending_verifications").insert({
        user_id: user?.id,
        transaction_code: transactionCode,
        amount: parseFloat(amount),
        payment_reason: reason,
        payment_type: "deposit",
        verification_due_at: verificationDueAt.toISOString(),
      });

      await supabase
        .from("profiles")
        .update({
          verification_pending: true,
          verification_due_at: verificationDueAt.toISOString(),
        })
        .eq("id", user?.id);

      toast.success(
        "Payment submitted! Your account will be verified within 4 working hours."
      );
      setPaymentDialogOpen(false);
      setAmount("");
    } catch (error) {
      console.error("Payment submission error:", error);
      toast.error("Failed to submit payment. Please try again.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header
        showLogo
        showMenu
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        backTo="/dashboard"
      />

      <div className="flex flex-1 overflow-hidden w-full">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto p-5 md:p-8 lg:p-10">
          <div className="max-w-3xl mx-auto space-y-5">
            <section className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border-l-4 border-primary">
              <div className="flex items-center gap-2 text-primary font-semibold mb-4 sm:mb-6">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Deposit Funds</span>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="mb-2">
                    Amount (KES)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-secondary"
                  />
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Minimum deposit: KES 500</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Maximum deposit: KES 1,000,000
                  </p>
                </div>

                <Button onClick={handleDeposit} className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Deposit Now
                </Button>
              </div>
            </section>
          </div>
        </main>
      </div>

      <PaymentMethodsDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        amount={parseFloat(amount) || 0}
        paymentType="deposit"
        onPaymentSubmit={handlePaymentSubmit}
      />
    </div>
  );
};

export default Deposit;
