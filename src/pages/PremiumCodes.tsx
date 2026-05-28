import { useState } from "react";
import { ShoppingCart, Award } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const PREMIUM_CODES = [
  {
    name: "Bronze Code",
    price: 30,
    benefits: [
      "Refunded instantly",
      "Full earnings withdrawal",
      "24/7 support",
      "Exclusive member benefits",
    ],
    color: "from-orange-500/20 to-orange-600/10",
    badgeColor: "bg-orange-500",
  },
  {
    name: "Silver Code",
    price: 50,
    benefits: [
      "Refunded instantly",
      "Full earnings withdrawal",
      "24/7 support",
      "Exclusive member benefits",
    ],
    color: "from-gray-400/20 to-gray-500/10",
    badgeColor: "bg-gray-400",
    recommended: true,
  },
  {
    name: "Gold Code",
    price: 150,
    benefits: [
      "Refunded instantly",
      "Full earnings withdrawal",
      "24/7 support",
      "Exclusive member benefits",
    ],
    color: "from-yellow-500/20 to-yellow-600/10",
    badgeColor: "bg-yellow-500",
  },
];

const PremiumCodes = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handlePurchase = (codeName: string, price: number) => {
    toast.info(`Redirecting to payment for ${codeName} ($${price})...`);
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

        <main className="flex-1 overflow-y-auto p-5 md:p-8 lg:p-10 bg-gradient-to-br from-background to-secondary/20">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center space-y-2 mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-8 h-8 text-primary" />
                <h1 className="text-3xl md:text-4xl font-bold">Premium Withdraw Codes</h1>
              </div>
              <p className="text-muted-foreground">
                Unlock exclusive benefits and withdraw your full earnings with premium codes
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {PREMIUM_CODES.map((code) => (
                <Card
                  key={code.name}
                  className={`relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br ${code.color}`}
                >
                  {code.recommended && (
                    <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1.5 text-xs font-bold">
                      ⭐ RECOMMENDED
                    </div>
                  )}
                  <CardHeader className={code.recommended ? "pt-10" : ""}>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-2xl">{code.name}</CardTitle>
                      <Badge className={`${code.badgeColor} text-white`}>Premium</Badge>
                    </div>
                    <CardDescription>Exclusive benefits await you</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-t border-b py-4 my-4">
                      <p className="text-3xl font-bold text-success">
                        ${code.price}
                      </p>
                      <p className="text-xs text-muted-foreground">One-time payment</p>
                    </div>

                    <Button
                      onClick={() => handlePurchase(code.name, code.price)}
                      className="w-full bg-warning hover:bg-warning/90 text-warning-foreground font-semibold"
                      size="lg"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Purchase Now
                    </Button>

                    <ul className="space-y-2 text-sm">
                      {code.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-success font-bold">✓</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  How Premium Codes Work
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  Premium withdraw codes give you priority access to withdraw your full earnings
                  without restrictions.
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Purchase your preferred code level</li>
                  <li>Your code is activated instantly</li>
                  <li>Withdraw earnings immediately without verification delays</li>
                  <li>Code fee is fully refundable after your first withdrawal</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PremiumCodes;
