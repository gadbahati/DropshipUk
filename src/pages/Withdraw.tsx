import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Wallet, CheckCircle, XCircle } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import RequiredItemModal from "@/components/RequiredItemModal";

const Withdraw = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [requiredItem, setRequiredItem] = useState<any>(null);
  const [showRequiredItemModal, setShowRequiredItemModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchWallet();
    }
  }, [user]);

  const fetchWallet = async () => {
    const client = supabase as any;
    const { data } = await client
      .from("wallets")
      .select("*")
      .eq("user_id", user?.id)
      .maybeSingle();

    setWallet(data);
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > (wallet?.balance || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    setProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('withdraw', {
        body: { amount: parseFloat(amount) }
      });

      if (error) throw error;

      if (data.status === 'declined') {
        // Show required item modal
        setRequiredItem(data.next_required_item);
        setShowRequiredItemModal(true);
      } else if (data.status === 'ok') {
        toast.success("Withdrawal processed successfully!");
        setAmount("");
        fetchWallet();
      }
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error(error.message || "Failed to process withdrawal");
    } finally {
      setProcessing(false);
    }
  };

  const handleRequiredItemComplete = async () => {
    setShowRequiredItemModal(false);
    setRequiredItem(null);
    // Retry withdrawal after completing required item
    toast.success("Payment received. Please tap Withdraw again to continue.");
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
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Available Balance</span>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                ${(wallet?.balance / 130)?.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your current withdrawable balance
              </p>
            </section>

            <section className="bg-card rounded-xl p-4 sm:p-6 shadow-sm border-l-4 border-primary">
              <div className="flex items-center gap-2 text-primary font-semibold mb-6">
                <Download className="w-5 h-5" />
                <span>Withdraw Funds</span>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="mb-2">
                    Amount (USD)
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

                <Button 
                  onClick={handleWithdraw} 
                  className="w-full"
                  disabled={processing}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {processing ? "Processing..." : "Withdraw"}
                </Button>
              </div>
            </section>
          </div>
        </main>
      </div>

      {requiredItem && (
        <RequiredItemModal
          isOpen={showRequiredItemModal}
          onClose={() => setShowRequiredItemModal(false)}
          requiredItem={requiredItem}
          onComplete={handleRequiredItemComplete}
        />
      )}
    </div>
  );
};

export default Withdraw;