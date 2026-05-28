import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Package, ArrowUpRight } from "lucide-react";

interface PackageSummaryChatProps {
  runningPackage?: {
    level: "beginner" | "standard" | "expert";
    price: number;
    outcome: number;
    percentage: number;
  } | null;
  onUpgrade?: () => void;
}

const BOOKINGS = [
  { level: "beginner", label: "Beginner", price: 1250, outcome: 8500, color: "bg-blue-500" },
  { level: "standard", label: "Standard", price: 3500, outcome: 12250, color: "bg-purple-500" },
  { level: "expert", label: "Expert", price: 5500, outcome: 18750, color: "bg-rose-500" },
];

export const PackageSummaryChat = ({ runningPackage, onUpgrade }: PackageSummaryChatProps) => {
  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20 shadow-lg">
      <CardHeader className="border-b bg-primary/5">
        <CardTitle className="flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          📊 Bookings Summary
        </CardTitle>
        <CardDescription>All available investment bookings at a glance</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-3">
          {BOOKINGS.map((pkg) => {
            const isRunning = runningPackage?.level === pkg.level;
            const profit = pkg.outcome - pkg.price;
            const profitPercentage = ((profit / pkg.price) * 100).toFixed(0);

            return (
              <div
                key={pkg.level}
                className={`rounded-xl p-4 border-2 transition-all ${
                  isRunning
                    ? "bg-success/10 border-success shadow-lg ring-2 ring-success/20"
                    : "bg-card border-border hover:border-primary/40"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${pkg.color}`} />
                    <div>
                      <h3 className="font-bold text-sm">{pkg.label}</h3>
                      {isRunning && (
                        <Badge variant="outline" className="text-xs border-success text-success mt-1">
                          ✓ Running {runningPackage.percentage}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Investment</p>
                    <p className="font-bold">${(pkg.price / 130).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 bg-primary/5 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Expected Outcome</p>
                      <p className="font-bold text-primary">${(pkg.outcome / 130).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-success">+{profitPercentage}%</p>
                    <div className="flex items-center gap-1 text-xs text-success">
                      <ArrowUpRight className="w-3 h-3" />
                      <span className="font-semibold">${(profit / 130).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {runningPackage && runningPackage.level !== "expert" && (
          <Button 
            className="w-full mt-4" 
            variant="outline"
            onClick={onUpgrade}
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Upgrade to Higher Booking
          </Button>
        )}

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-center text-muted-foreground">
            💡 <strong>Tip:</strong> Higher bookings offer better returns. Choose wisely!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
