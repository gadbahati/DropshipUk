import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";

const Sandbox = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Sandbox Environment Notice" backTo="/" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="max-w-md space-y-6">
          <p className="text-lg font-semibold">
            This website is hosted in a sandbox environment.
          </p>
          <p className="text-base text-muted-foreground">
            Sandboxes are typically used for development and testing purposes.
          </p>
          <p className="text-base text-muted-foreground">
            Be cautious before entering any personal or financial information.
          </p>
          <Button
            variant="accent"
            size="lg"
            onClick={() => navigate("/landing")}
            className="mt-8"
          >
            Continue
          </Button>
        </div>
      </main>

      <nav className="flex justify-around items-center px-4 py-3 bg-secondary border-t border-border text-2xl">
        <span className="nav-item text-muted-foreground">⟵</span>
        <span className="nav-item text-foreground">⟷</span>
        <span className="nav-item text-muted-foreground">≡</span>
        <span className="nav-item text-muted-foreground">3</span>
        <span className="nav-item text-muted-foreground">⌂</span>
      </nav>
    </div>
  );
};

export default Sandbox;
