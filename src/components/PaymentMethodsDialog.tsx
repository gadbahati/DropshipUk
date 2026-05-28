import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Copy } from "lucide-react";
import { toast } from "sonner";

interface PaymentMethodsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  paymentType: "activation" | "deposit" | "booking";
  bookingId?: string;
  onPaymentSubmit: (transactionCode: string, reason: string) => Promise<void>;
}

export const PaymentMethodsDialog = ({
  open,
  onOpenChange,
  amount,
  paymentType,
  bookingId,
  onPaymentSubmit,
}: PaymentMethodsDialogProps) => {
  const [transactionCode, setTransactionCode] = useState("");
  const [paymentReason, setPaymentReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const paybillNumber = "400200";
  const accountNumber = "01108744365800";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleSubmit = async () => {
    if (!transactionCode.trim()) {
      toast.error("Please enter transaction code");
      return;
    }
    if (!paymentReason.trim()) {
      toast.error("Please select payment reason");
      return;
    }

    setProcessing(true);
    try {
      await onPaymentSubmit(transactionCode, paymentReason);
      setTransactionCode("");
      setPaymentReason("");
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
          <DialogDescription>
            Amount: KES {amount.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Methods */}
          <div className="bg-secondary/50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Details
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-background rounded">
                <div>
                  <p className="text-xs text-muted-foreground">Paybill Number</p>
                  <p className="font-mono font-semibold">{paybillNumber}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(paybillNumber, "Paybill number")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex justify-between items-center p-2 bg-background rounded">
                <div>
                  <p className="text-xs text-muted-foreground">Account Number</p>
                  <p className="font-mono font-semibold">{accountNumber}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(accountNumber, "Account number")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-primary/10 p-2 rounded">
              <strong>M-Pesa Instructions:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Go to M-Pesa menu</li>
                <li>Select Lipa na M-Pesa</li>
                <li>Select Paybill</li>
                <li>Enter Business number: {paybillNumber}</li>
                <li>Enter Account number: {accountNumber}</li>
                <li>Enter Amount: {amount}</li>
                <li>Enter M-Pesa PIN and confirm</li>
              </ol>
            </div>
          </div>

          {/* Transaction Code */}
          <div>
            <Label htmlFor="transactionCode">M-Pesa Transaction Code *</Label>
            <Input
              id="transactionCode"
              placeholder="e.g., RBK3X8Y9Z0"
              value={transactionCode}
              onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the M-Pesa confirmation code you received via SMS
            </p>
          </div>

          {/* Payment Reason */}
          <div>
            <Label htmlFor="paymentReason">Payment Reason *</Label>
            <Select value={paymentReason} onValueChange={setPaymentReason}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select reason for payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activation_fee">Activation Fee</SelectItem>
                <SelectItem value="booking_payment">Booking Payment</SelectItem>
                <SelectItem value="wallet_deposit">Wallet Deposit</SelectItem>
                <SelectItem value="membership">Membership Subscription</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verification Notice */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              ⏱️ <strong>Verification Time:</strong> Your payment will be verified and your account will be activated within <strong>4 working hours</strong> after submission.
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={processing || !transactionCode || !paymentReason}
            className="w-full"
          >
            {processing ? "Processing..." : "Submit Payment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
