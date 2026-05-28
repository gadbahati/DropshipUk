import { useState } from "react";
import { IdCard, Upload, CheckCircle, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const KycAml = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "unverified">("unverified");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("KYC documents submitted for verification!");
    setVerificationStatus("pending");
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
                <IdCard className="w-5 h-5" />
                <span>KYC & AML Verification</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Know Your Customer (KYC) and Anti-Money Laundering (AML) verification helps us maintain a secure platform for all users.
              </p>

              {verificationStatus === "verified" && (
                <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Verification Complete</span>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-2">
                    Your account has been successfully verified.
                  </p>
                </div>
              )}

              {verificationStatus === "pending" && (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Verification Pending</span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-2">
                    Your documents are under review. This usually takes 1-3 business days.
                  </p>
                </div>
              )}

              {verificationStatus === "unverified" && (
                <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Verification Required</span>
                  </div>
                  <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
                    Complete your KYC verification to unlock full platform features.
                  </p>
                </div>
              )}
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm border-l-4 border-primary">
              <h3 className="font-semibold mb-4">Why Verify Your Identity?</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p>Enhanced security for your account and transactions</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p>Higher transaction limits and faster withdrawals</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p>Access to premium dropshipping features</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p>Compliance with financial regulations</p>
                </div>
              </div>
            </section>

            {verificationStatus === "unverified" && (
              <section className="bg-card rounded-xl p-6 shadow-sm border-l-4 border-primary">
                <div className="flex items-center gap-2 text-primary font-semibold mb-6">
                  <Upload className="w-5 h-5" />
                  <span>Submit Verification Documents</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Legal Name</Label>
                    <Input
                      id="fullName"
                      placeholder="As shown on your ID"
                      required
                      className="bg-secondary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="idNumber">National ID / Passport Number</Label>
                    <Input
                      id="idNumber"
                      placeholder="Enter your ID number"
                      required
                      className="bg-secondary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      required
                      className="bg-secondary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Residential Address</Label>
                    <Input
                      id="address"
                      placeholder="Street address, City, Country"
                      required
                      className="bg-secondary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="idFront">ID Document (Front)</Label>
                    <Input
                      id="idFront"
                      type="file"
                      accept="image/*,.pdf"
                      required
                      className="bg-secondary"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a clear photo of the front of your ID
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="idBack">ID Document (Back)</Label>
                    <Input
                      id="idBack"
                      type="file"
                      accept="image/*,.pdf"
                      required
                      className="bg-secondary"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload a clear photo of the back of your ID
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="selfie">Selfie with ID</Label>
                    <Input
                      id="selfie"
                      type="file"
                      accept="image/*"
                      required
                      className="bg-secondary"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Take a selfie holding your ID next to your face
                    </p>
                  </div>

                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      By submitting this form, you confirm that all information provided is accurate and you consent to our verification process. Your documents will be securely stored and used only for verification purposes.
                    </p>
                  </div>

                  <Button type="submit" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Submit for Verification
                  </Button>
                </form>
              </section>
            )}

            <section className="bg-card rounded-xl p-6 shadow-sm border-l-4 border-primary">
              <h3 className="font-semibold mb-4">Document Requirements</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Please ensure your documents meet the following requirements:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Clear, high-resolution photos (no blurry or dark images)</li>
                  <li>All corners of the document must be visible</li>
                  <li>No glare or reflections covering important information</li>
                  <li>Documents must be valid (not expired)</li>
                  <li>Accepted formats: JPG, PNG, or PDF (max 5MB per file)</li>
                </ul>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default KycAml;
