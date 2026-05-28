import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "@/components/Header";
import FormInput from "@/components/FormInput";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { LogIn, ShieldCheck } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role");
  const isAdminLogin = roleParam === "admin";
  
  const [formData, setFormData] = useState({
    emailUsername: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.emailUsername || !formData.password) {
      toast.error("Please fill in all fields!");
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(formData.emailUsername, formData.password);
      
      if (error) {
        toast.error(error.message || "Login failed!");
      } else {
        toast.success("Login successful!");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header backTo="/landing" />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                {isAdminLogin ? <ShieldCheck size={32} /> : <LogIn size={32} />}
              </div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isAdminLogin ? "Admin Login" : "Welcome Back"}
              </h1>
              {isAdminLogin && (
                <div className="mt-2">
                  <Badge variant="destructive" className="rounded-full px-4">Authorized Personnel Only</Badge>
                </div>
              )}
              <p className="text-slate-500 mt-2">
                {isAdminLogin 
                  ? "Access the administrative dashboard" 
                  : "Login to manage your dropshipping account"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <FormInput
                  label="Email or Username"
                  type="text"
                  placeholder="Enter your email or username"
                  value={formData.emailUsername}
                  onChange={(e) => setFormData({ ...formData, emailUsername: e.target.value })}
                  required
                />
                <FormInput
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                  Remember me
                </label>
                <button type="button" className="text-primary font-semibold hover:underline">
                  Forgot password?
                </button>
              </div>

              <Button 
                type="submit" 
                className="w-full py-7 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-slate-500">
                Don't have an account?{" "}
                <button 
                  onClick={() => navigate("/register")} 
                  className="text-primary font-bold hover:underline"
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
          
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Secure Login Powered by Dropship UK 🇬🇧
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
