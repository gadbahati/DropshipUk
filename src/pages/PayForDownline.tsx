import { useState } from "react";
import { Users, Package } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const PayForDownline = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [downlinePhone, setDownlinePhone] = useState("");
  const [amount, setAmount] = useState("");

  const handlePayment = () => {
    if (!downlinePhone || !amount || parseFloat(amount) <= 0) {
      toast.error("Please enter valid phone number and amount");
      return;
    }
    if (parseFloat(amount) < 4) {
      toast.error("Minimum amount is $4");
      return;
    }
    toast.success(`Payment of $${amount} for ${downlinePhone} initiated!`);
    setDownlinePhone("");
    setAmount("");
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
            <section className="bg-card rounded-xl p-6 shadow-sm border-l-4 border-primary">
              <div className="flex items-center gap-2 text-primary font-semibold mb-6">
                <Users className="w-5 h-5" />
                <span>Pay For Downline</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Pay for products or services on behalf of your downline members. This helps grow your network and earn commissions.
              </p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="downlinePhone" className="mb-2">
                    Downline Phone Number
                  </Label>
                  <Input
                    id="downlinePhone"
                    type="tel"
                    placeholder="07XX XXX XXX"
                    value={downlinePhone}
                    onChange={(e) => setDownlinePhone(e.target.value)}
                    className="bg-secondary"
                  />
                </div>

                <div>
                  <Label htmlFor="payAmount" className="mb-2">
                    Amount (USD)
                  </Label>
                  <Input
                    id="payAmount"
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-secondary"
                  />
                </div>

                <div className="bg-secondary/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Minimum payment: $4</strong>
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    Processing time: Instant
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Commission earned: 10% of payment amount
                  </p>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-semibold mb-1">Payment Method: Lipa Na M-Pesa</p>
                    <p className="text-xs"><strong>Paybill:</strong> 400200</p>
                    <p className="text-xs"><strong>Account Number:</strong> 01108744365800</p>
                  </div>
                </div>

                <Button onClick={handlePayment} className="w-full">
                  <Package className="w-4 h-4 mr-2" />
                  Pay Now
                </Button>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm border-l-4 border-primary">
              <div className="flex items-center gap-2 text-primary font-semibold mb-4">
                <Users className="w-5 h-5" />
                <span>Your Downline Network</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Total downline members: 0
              </p>
              <p className="text-sm text-muted-foreground">
                Total commissions earned: $0.00
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PayForDownline;
