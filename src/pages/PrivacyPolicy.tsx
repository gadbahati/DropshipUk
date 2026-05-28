import { useState } from "react";
import { Shield, Lock, Eye, FileText } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const PrivacyPolicy = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
                <Shield className="w-5 h-5" />
                <span>Privacy Policy</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Last updated: October 30, 2025
              </p>
              <p className="text-sm mb-6">
                DropshipUK ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm border-l-4 border-primary">
              <div className="flex items-center gap-2 text-primary font-semibold mb-4">
                <Eye className="w-5 h-5" />
                <span>Information We Collect</span>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Personal Information</h4>
                  <p className="text-muted-foreground">
                    We collect information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 text-muted-foreground space-y-1">
                    <li>Name and contact information (email, phone number)</li>
                    <li>Account credentials (username and password)</li>
                    <li>Payment and billing information</li>
                    <li>Shipping and delivery addresses</li>
                    <li>Transaction history and preferences</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Usage Information</h4>
                  <p className="text-muted-foreground">
                    We automatically collect certain information about your device and how you interact with our platform:
                  </p>
                  <ul className="list-disc list-inside ml-4 mt-2 text-muted-foreground space-y-1">
                    <li>Device information and IP address</li>
                    <li>Browser type and operating system</li>
                    <li>Pages visited and time spent on our platform</li>
                    <li>Referral sources and exit pages</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm border-l-4 border-primary">
              <div className="flex items-center gap-2 text-primary font-semibold mb-4">
                <FileText className="w-5 h-5" />
                <span>How We Use Your Information</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>We use the information we collect to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your transactions and send related information</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Detect, prevent, and address fraud and security issues</li>
                  <li>Comply with legal obligations</li>
                  <li>Provide personalized content and recommendations</li>
                </ul>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm border-l-4 border-primary">
              <div className="flex items-center gap-2 text-primary font-semibold mb-4">
                <Lock className="w-5 h-5" />
                <span>Data Security</span>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <p>
                  Your payment information is encrypted using secure socket layer technology (SSL). We follow PCI-DSS requirements and implement additional security measures.
                </p>
                <p>
                  However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your personal information, we cannot guarantee its absolute security.
                </p>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm border-l-4 border-primary">
              <div className="flex items-center gap-2 text-primary font-semibold mb-4">
                <Shield className="w-5 h-5" />
                <span>Your Rights</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Access and receive a copy of your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Object to or restrict processing of your information</li>
                  <li>Withdraw consent at any time</li>
                  <li>Lodge a complaint with a supervisory authority</li>
                </ul>
              </div>
            </section>

            <section className="bg-card rounded-xl p-6 shadow-sm border-l-4 border-primary">
              <div className="flex items-center gap-2 text-primary font-semibold mb-4">
                <FileText className="w-5 h-5" />
                <span>Contact Us</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="text-sm space-y-1">
                <p>Email: privacy@dropshipuk.com</p>
                <p>Phone: +254 700 000 000</p>
                <p>Address: Nairobi, Kenya</p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
