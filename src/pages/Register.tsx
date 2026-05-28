import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "@/components/Header";
import FormInput from "@/components/FormInput";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields!");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(formData.email, formData.password, formData.name);
      
      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Please login instead.");
        } else {
          toast.error(error.message || "Registration failed!");
        }
      } else {
        toast.success("Registration successful! Please check your email to verify your account.");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header backTo="/landing" />
      
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-[500px] bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6">
                <UserPlus size={32} />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
              <p className="text-slate-500 mt-2">Join Dropship UK and start your business journey</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <FormInput
                  label="Username"
                  type="text"
                  placeholder="johndoe123"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <FormInput
                  label="Phone Number"
                  type="tel"
                  placeholder="+44 123 456 789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <FormInput
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-4 pt-2">
                <p className="text-xs text-slate-400 text-center px-4">
                  By clicking "Create Account", you agree to our{" "}
                  <button type="button" className="text-primary hover:underline font-medium">Terms of Service</button> and{" "}
                  <button type="button" className="text-primary hover:underline font-medium">Privacy Policy</button>.
                </p>
                <Button 
                  type="submit" 
                  className="w-full py-7 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </div>
            </form>

            <div className="mt-10 text-center">
              <p className="text-slate-500">
                Already have an account?{" "}
                <button 
                  onClick={() => navigate("/login")} 
                  className="text-primary font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </div>
          
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Secure Registration Powered by Dropship UK 🇬🇧
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
