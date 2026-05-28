import { X, Menu, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
  showMenu?: boolean;
  onMenuClick?: () => void;
  backTo?: string;
}

const Header = ({ title, showLogo, showMenu, onMenuClick, backTo }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-card border-b border-border">
      {showMenu ? (
        <button
          onClick={onMenuClick}
          className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      ) : backTo ? (
        <button
          onClick={() => navigate(backTo)}
          className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      ) : (
        <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full text-primary-foreground text-sm font-bold">
          ⧉
        </div>
      )}

      {showLogo ? (
        <Logo showSubtitle={false} />
      ) : (
        <h1 className="flex-1 text-center text-lg font-semibold mx-3">{title}</h1>
      )}

      <button
        onClick={() => navigate(backTo || "/")}
        className="flex items-center justify-center w-8 h-8 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </header>
  );
};

export default Header;
