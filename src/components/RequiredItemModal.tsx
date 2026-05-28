import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RequiredItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredItem: {
    id: string;
    key: string;
    type: string;
    amount_usd: number;
    amount_kes: number;
    description: string;
    order_index: number;
  };
  onComplete: () => void;
}

const RequiredItemModal = ({ isOpen, onClose, requiredItem, onComplete }: RequiredItemModalProps) => {
  const [transactionCode, setTransactionCode] = useState("");
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (requiredItem.amount_usd > 0 && !transactionCode) {
      toast.error("Please enter transaction code");
      return;
    }

    setProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('pay-required-item', {
        body: {
          required_item_id: requiredItem.id,
          payment_method: 'mpesa',
          transaction_code: transactionCode,
          metadata: {
            key: requiredItem.key,
            description: requiredItem.description
          }
        }
      });

      if (error) throw error;

      toast.success("Payment successful!");
      onComplete();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkResolved = async () => {
    setProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('pay-required-item', {
        body: {
          required_item_id: requiredItem.id,
          payment_method: 'manual',
          transaction_code: 'marked_resolved',
          metadata: {
            key: requiredItem.key,
            description: requiredItem.description,
            action: 'marked_resolved'
          }
        }
      });

      if (error) throw error;

      toast.success("Marked as resolved!");
      onComplete();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || "Failed to mark as resolved");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <DialogTitle>Withdrawal declined — action required</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-destructive/10 border-2 border-destructive rounded-lg p-4">
            <p className="font-semibold mb-2">{requiredItem.description}</p>
            
            {requiredItem.amount_usd > 0 && (
              <div className="text-sm space-y-1">
                <p>Amount: <strong>USD ${requiredItem.amount_usd}</strong></p>
                <p className="text-muted-foreground">KES {requiredItem.amount_kes.toLocaleString()}</p>
              </div>
            )}
          </div>

          {requiredItem.amount_usd > 0 ? (
            <>
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <p className="font-semibold">M-Pesa Payment Details:</p>
                <p>Paybill: <strong>400200</strong></p>
                <p>Account: <strong>01108744365800</strong></p>
              </div>

              <div>
                <Label htmlFor="transaction_code">Transaction Code</Label>
                <Input
                  id="transaction_code"
                  placeholder="Enter M-Pesa transaction code"
                  value={transactionCode}
                  onChange={(e) => setTransactionCode(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full"
              >
                {processing ? "Processing..." : `Pay $${requiredItem.amount_usd}`}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleMarkResolved}
              disabled={processing}
              className="w-full"
              variant="outline"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {processing ? "Processing..." : "Mark as resolved"}
            </Button>
          )}

          <p className="text-xs text-muted-foreground text-center">
            After completion, tap Withdraw again to continue
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequiredItemModal;