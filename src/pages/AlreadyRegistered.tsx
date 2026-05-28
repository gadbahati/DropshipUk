import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Logo from "@/components/Logo";
import { Home } from "lucide-react";

const AlreadyRegistered = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Sign up for DropshipUK" backTo="/register" />

      <main className="flex-1 flex flex-col items-center px-6 py-8">
        <Logo />
        
        <h2 className="text-2xl font-semibold mt-8 mb-8">Sign up for DropshipUK</h2>

        <p className="text-lg font-medium text-primary mb-8">
          You are already registered.
        </p>

        <div className="flex items-center w-full max-w-sm my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="px-4 text-sm text-muted-foreground">Or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          onClick={() => navigate("/login")}
          className="text-primary font-medium hover:underline"
        >
          Login
        </button>
      </main>

      <div className="flex items-center justify-center py-4 bg-secondary border-t border-border">
        <Home className="w-6 h-6 text-muted-foreground" />
      </div>
    </div>
  );
};

export default AlreadyRegistered;
