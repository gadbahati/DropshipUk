import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, CreditCard, Package, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const PACKAGES = [
  { level: "beginner", name: "Beginner Package", price: 1250, priceUSD: 4, priceKES: 500 },
  { level: "standard", name: "Standard Package", price: 3500, priceUSD: 4, priceKES: 500 },
  { level: "expert", name: "Expert Package", price: 5500, priceUSD: 4, priceKES: 500 },
];

const PAYBILL_NUMBER = "400200";
const ACCOUNT_NUMBER = "01108744365800";

const paymentSchema = z.object({
  transactionCode: z.string().min(8, "Transaction code must be at least 8 characters").max(20),
  amountPaid: z.number().min(500, "Minimum amount is KES 500"),
  accountIdentifier: z.string().email("Invalid email format").or(z.string().min(3, "Invalid account identifier")),
});

const ManualPayment = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [transactionCode, setTransactionCode] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [accountIdentifier, setAccountIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      // Pre-fill email
      setAccountIdentifier(user.email || "");
    }
  }, [user]);

  const handleSubmitPayment = async () => {
    if (!selectedPackage) {
      toast.error("Please select a package");
      return;
    }

    // Validate inputs
    try {
      paymentSchema.parse({
        transactionCode: transactionCode.trim(),
        amountPaid: parseFloat(amountPaid),
        accountIdentifier: accountIdentifier.trim(),
      });
    } catch (error: any) {
      if (error.errors && error.errors.length > 0) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Please fill all fields correctly");
      }
      return;
    }

    setLoading(true);

    try {
      const client = supabase as any;

      // Insert manual payment record
      const { data: paymentData, error: paymentError } = await client
        .from("manual_payments")
        .insert({
          user_id: user?.id,
          package_level: selectedPackage,
          transaction_code: transactionCode.trim(),
          amount_paid: parseFloat(amountPaid),
          account_identifier: accountIdentifier.trim(),
          status: "pending",
        })
        .select()
        .single();

      if (paymentError) {
        if (paymentError.code === "23505") {
          toast.error("This transaction code has already been used");
        } else {
          throw paymentError;
        }
        return;
      }

      // Update profile status to active and verified
      const { error: profileError } = await client
        .from("profiles")
        .update({
          is_active: true,
          payment_verified: true,
          payment_verified_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (profileError) throw profileError;

      // Show confirmation dialog
      setShowConfirmation(true);
    } catch (error: any) {
      console.error("Payment submission error:", error);
      toast.error(error.message || "Failed to submit payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    navigate("/dashboard");
  };

  const selectedPkg = PACKAGES.find((p) => p.level === selectedPackage);

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
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Activate Your Account</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Complete your payment to activate your Dropship UK account
              </p>
            </div>

            {/* Package Selection */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  <CardTitle>Step 1: Select Your Package</CardTitle>
                </div>
                <CardDescription>Choose the package you want to activate</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPackage} onValueChange={setSelectedPackage}>
                  <div className="space-y-3">
                    {PACKAGES.map((pkg) => (
                      <div
                        key={pkg.level}
                        className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPackage === pkg.level
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedPackage(pkg.level)}
                      >
                        <RadioGroupItem value={pkg.level} id={pkg.level} />
                        <Label
                          htmlFor={pkg.level}
                          className="flex-1 cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <p className="font-semibold">{pkg.name}</p>
                            <p className="text-sm text-muted-foreground">Activation Fee</p>
                          </div>
                          <Badge variant="outline" className="ml-4">
                            ${pkg.priceUSD} USD / {pkg.priceKES} KES
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Instructions */}
            {selectedPackage && (
              <Card className="border-primary/50 shadow-lg">
                <CardHeader className="bg-primary/5">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <CardTitle>Step 2: Make Payment</CardTitle>
                  </div>
                  <CardDescription>Follow these instructions to complete your payment</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {/* Payment Amount */}
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 sm:p-6 text-center border border-primary/20">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">Amount Due</p>
                    <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-1">
                      {selectedPkg?.priceKES} KES
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      (Approximately ${selectedPkg?.priceUSD} USD)
                    </p>
                  </div>

                  {/* Payment Instructions */}
                  <div className="space-y-4 p-3 sm:p-4 bg-secondary/30 rounded-lg border">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <p className="font-semibold text-base sm:text-lg">Payment Instructions:</p>
                        <ol className="space-y-2 text-xs sm:text-sm">
                          <li className="flex flex-col">
                            <span className="font-medium">1. Open your M-Pesa or Bank App</span>
                          </li>
                          <li className="flex flex-col">
                            <span className="font-medium">2. Select "Paybill" or "Pay to Business"</span>
                          </li>
                          <li className="flex flex-col">
                            <span className="font-medium">3. Enter the following details:</span>
                            <div className="mt-2 space-y-2 ml-2 sm:ml-4">
                              <div className="flex items-center justify-between bg-card p-2 sm:p-3 rounded border">
                                <span className="text-muted-foreground text-xs sm:text-sm">Paybill Number:</span>
                                <span className="font-bold text-base sm:text-lg">{PAYBILL_NUMBER}</span>
                              </div>
                              <div className="flex items-center justify-between bg-card p-2 sm:p-3 rounded border">
                                <span className="text-muted-foreground text-xs sm:text-sm">Account Number:</span>
                                <span className="font-bold text-base sm:text-lg">{ACCOUNT_NUMBER}</span>
                              </div>
                              <div className="flex items-center justify-between bg-card p-2 sm:p-3 rounded border">
                                <span className="text-muted-foreground text-xs sm:text-sm">Amount:</span>
                                <span className="font-bold text-base sm:text-lg">{selectedPkg?.priceKES} KES</span>
                              </div>
                            </div>
                          </li>
                          <li className="flex flex-col">
                            <span className="font-medium">4. Complete the payment</span>
                          </li>
                          <li className="flex flex-col">
                            <span className="font-medium">5. Note down your transaction code (e.g., SKJ8H4G2LP)</span>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Confirmation Form */}
            {selectedPackage && (
              <Card className="border-success/50">
                <CardHeader className="bg-success/5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <CardTitle>Step 3: Confirm Payment</CardTitle>
                  </div>
                  <CardDescription>
                    After making payment, enter your transaction details below
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="transactionCode">
                      Transaction Code <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="transactionCode"
                      placeholder="e.g., SKJ8H4G2LP"
                      value={transactionCode}
                      onChange={(e) => setTransactionCode(e.target.value)}
                      className="uppercase"
                      maxLength={20}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the M-Pesa or bank transaction code you received
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amountPaid">
                      Amount Paid (KES) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="amountPaid"
                      type="number"
                      placeholder="500"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      min={500}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the exact amount you paid in Kenya Shillings
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountIdentifier">
                      Your Email or Username <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="accountIdentifier"
                      type="email"
                      placeholder="your@email.com"
                      value={accountIdentifier}
                      onChange={(e) => setAccountIdentifier(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your account email for verification purposes
                    </p>
                  </div>

                  <Button
                    onClick={handleSubmitPayment}
                    disabled={loading || !transactionCode || !amountPaid || !accountIdentifier}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Confirm Payment & Activate Account
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="max-w-md mx-4">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
              </div>
            </div>
            <AlertDialogTitle className="text-center text-xl sm:text-2xl">
              Payment Received! 🎉
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center space-y-2">
              <p className="text-base">
                Thank you! Your payment of <span className="font-bold">{amountPaid} KES</span> has been
                received and your account is now <span className="font-bold text-success">Active</span>.
              </p>
              <p className="text-sm">
                You can now access all features of your {selectedPkg?.name}.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleConfirmationClose} className="w-full">
              Go to Dashboard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManualPayment;