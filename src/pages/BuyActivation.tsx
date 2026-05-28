import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { DollarSign, CheckCircle } from "lucide-react";

const BuyActivation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("M-Pesa");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionId.trim()) {
      toast.error("Please enter transaction ID");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('request-activation', {
        body: {
          payment_method: paymentMethod,
          transaction_id: transactionId
        }
      });

      if (error) throw error;

      toast.success("Activation payment submitted! Awaiting admin approval.");
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Activation error:', error);
      toast.error(error.message || "Failed to submit activation payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="Buy Activation" backTo="/dashboard" />
      
      <main className="flex-1 container max-w-2xl mx-auto px-4 py-8">
        <Card className="border-2">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl md:text-3xl">Account Activation</CardTitle>
            <CardDescription className="text-base">
              Activate your account to access all platform features
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Activation Fee:</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">$100 USD</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Equivalent:</span>
                <span className="font-semibold">KES 12,500</span>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">1</span>
                Pay via M-Pesa
              </h3>
              <p className="text-sm text-muted-foreground ml-8">
                Send payment to: <strong>Paybill 400200</strong><br />
                Account: <strong>DROPSHIP</strong>
              </p>
            </div>

            <div className="bg-card border rounded-lg p-4 space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">2</span>
                Submit Transaction Details
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4 ml-8 mt-3">
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <Input
                    id="payment-method"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="M-Pesa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transaction-id">M-Pesa Transaction ID</Label>
                  <Input
                    id="transaction-id"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="e.g., QGH7K8L9M0"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Payment"}
                </Button>
              </form>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                <strong>Note:</strong> Your account will be activated after admin verification of your payment. This typically takes a few minutes to 24 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default BuyActivation;
