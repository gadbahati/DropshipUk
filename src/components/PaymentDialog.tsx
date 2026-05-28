import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Smartphone, Wallet } from "lucide-react";
import { toast } from "sonner";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  level: "beginner" | "standard" | "expert";
  onPaymentComplete: (paymentMethod: string) => void;
}

const PAYMENT_METHODS = [
  { id: "mpesa", label: "M-Pesa", icon: Smartphone, description: "Pay via M-Pesa" },
  { id: "airtel", label: "Airtel Money", icon: Smartphone, description: "Pay via Airtel Money" },
  { id: "visa", label: "Visa/Mastercard", icon: CreditCard, description: "Pay with card" },
  { id: "paypal", label: "PayPal", icon: Wallet, description: "Pay with PayPal" },
];

export const PaymentDialog = ({ open, onOpenChange, amount, level, onPaymentComplete }: PaymentDialogProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string>("mpesa");
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success("Payment successful! Your booking is now active.");
    onPaymentComplete(selectedMethod);
    setProcessing(false);
    onOpenChange(false);
  };

  const levelLabels = {
    beginner: "Beginner",
    standard: "Standard",
    expert: "Expert",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">💳</span>
            Complete Payment
          </DialogTitle>
          <DialogDescription>
            Complete your payment to activate your {levelLabels[level]} booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount Summary */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount to Pay</span>
              <span className="text-2xl font-bold text-primary">${(amount / 130).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">Booking Level</span>
              <span className="text-sm font-semibold">{levelLabels[level]}</span>
            </div>
            <div className="mt-3 p-3 bg-secondary/50 rounded-lg">
              <p className="text-xs font-semibold mb-2">Payment Method: Lipa Na M-Pesa</p>
              <div className="text-xs space-y-1">
                <p><strong>Paybill:</strong> 400200</p>
                <p><strong>Account Number:</strong> 01108744365800</p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Confirm Payment</Label>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-3">
                Please complete the payment using the M-Pesa details above, then click the button below to activate your booking.
              </p>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Activating Booking...
              </>
            ) : (
              <>Confirm Payment of ${(amount / 130).toFixed(2)}</>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment • Your data is encrypted
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
