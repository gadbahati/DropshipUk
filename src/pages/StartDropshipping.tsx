import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const StartDropshipping = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dropshipping dashboard where all packages are now located
    navigate("/dropshipping", { replace: true });
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirecting to Dropshipping Dashboard...</p>
    </div>
  );
};

export default StartDropshipping;
