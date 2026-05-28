import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

interface TransactionsChartProps {
  userId: string | undefined;
}

interface ChartData {
  date: string;
  inbound: number;
  outbound: number;
}

const TransactionsChart = ({ userId }: TransactionsChartProps) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchTransactionData();
    }
  }, [userId]);

  const fetchTransactionData = async () => {
    try {
      const client = supabase as any;
      const { data: transactions } = await client
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (transactions) {
        // Group transactions by date
        const groupedByDate: { [key: string]: { inbound: number; outbound: number } } = {};

        transactions.forEach((txn: any) => {
          const date = new Date(txn.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          if (!groupedByDate[date]) {
            groupedByDate[date] = { inbound: 0, outbound: 0 };
          }

          const amount = parseFloat(txn.amount || "0");

          // Inbound: deposit, credit, outcome
          // Outbound: withdrawal, debit, payment
          if (
            txn.type === "deposit" ||
            txn.type === "credit" ||
            txn.type === "outcome" ||
            txn.type === "refund"
          ) {
            groupedByDate[date].inbound += amount;
          } else if (
            txn.type === "withdrawal" ||
            txn.type === "debit" ||
            txn.type === "payment"
          ) {
            groupedByDate[date].outbound += amount;
          }
        });

        // Convert to array format for chart
        const chartArray = Object.entries(groupedByDate).map(([date, values]) => ({
          date,
          inbound: values.inbound,
          outbound: values.outbound,
        }));

        setChartData(chartArray);
      }
    } catch (error) {
      console.error("Error fetching transaction data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="p-6">
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No transaction data available yet</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">📈 Transaction History</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            className="text-xs"
            tick={{ fill: "hsl(var(--foreground))" }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fill: "hsl(var(--foreground))" }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number) => `KSh ${value.toLocaleString()}`}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: "20px",
            }}
          />
          <Bar 
            dataKey="inbound" 
            fill="hsl(142, 76%, 36%)" 
            name="Inbound (Deposits/Credits)"
            radius={[8, 8, 0, 0]}
          />
          <Bar 
            dataKey="outbound" 
            fill="hsl(0, 84%, 60%)" 
            name="Outbound (Withdrawals/Payments)"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default TransactionsChart;
