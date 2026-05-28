import { useState, useEffect } from "react";
import { Link as LinkIcon, Copy, Users, TrendingUp } from "lucide-react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ReferAndEarn = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .maybeSingle();
    setProfile(data);
  };

  const userName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "user";
  const referralLink = `ent.pantheonsite.io/register/?ref=${userName.toLowerCase()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-slate-50">
      <Header
        showLogo
        showMenu
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        backTo="/dashboard"
      />

      <div className="flex flex-1 overflow-hidden w-full">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Refer & Earn</h1>
              <p className="text-slate-500">Invite friends and earn rewards for every successful booking they make.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 text-primary font-bold mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl">Your Unique Referral Link</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-slate-600">
                      Copy and share this link. When someone registers using your link, they become your referral.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input
                        type="text"
                        value={referralLink}
                        readOnly
                        className="bg-slate-50 border-slate-200 h-12 rounded-xl font-medium"
                      />
                      <Button onClick={handleCopy} size="lg" className="rounded-xl px-8 h-12">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">How It Works</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">1</div>
                      <h4 className="font-bold text-slate-900">Invite Friends</h4>
                      <p className="text-sm text-slate-500">Share your referral link via social media, email, or text.</p>
                    </div>
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">2</div>
                      <h4 className="font-bold text-slate-900">They Book</h4>
                      <p className="text-sm text-slate-500">Your friends sign up and start their dropshipping journey.</p>
                    </div>
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold">3</div>
                      <h4 className="font-bold text-slate-900">Earn Rewards</h4>
                      <p className="text-sm text-slate-500">Receive 5% commission on every successful booking they complete.</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-slate-500 font-medium">Total Referrals</p>
                    <Users className="text-primary w-5 h-5" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">0</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-slate-500 font-medium">Active Referrals</p>
                    <TrendingUp className="text-emerald-500 w-5 h-5" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900">0</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-slate-500 font-medium">Total Earned</p>
                    <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold text-[10px]">$</div>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">$0.00</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReferAndEarn;
