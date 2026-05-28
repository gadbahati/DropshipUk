import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  Upload,
  Users,
  Download,
  User,
  Link as LinkIcon,
  Phone,
  Rocket,
  Package,
  FileText,
  Lock,
  IdCard,
  LogOut,
  Award,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <nav
        className={`
          fixed lg:static top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-50
          transform transition-transform duration-300 lg:transform-none overflow-y-auto
          shadow-xl lg:shadow-none
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="text-2xl">🇬🇧</span> Dropship UK
            </h2>
          </div>

          <div className="flex-1 py-4 space-y-8 overflow-y-auto custom-scrollbar">
            <div>
              <div className="px-6 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Main
              </div>
              <SidebarItem 
                icon={<Home className="w-5 h-5" />} 
                label="Dashboard" 
                onClick={() => handleNavigation("/dashboard")}
              />
            </div>

            <div>
              <div className="px-6 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Account & Wallet
              </div>
              <SidebarItem 
                icon={<Upload className="w-5 h-5" />} 
                label="Deposit Funds" 
                onClick={() => handleNavigation("/deposit")}
              />
              <SidebarItem 
                icon={<Users className="w-5 h-5" />} 
                label="Pay For Downline"
                onClick={() => handleNavigation("/pay-for-downline")}
              />
              <SidebarItem 
                icon={<Download className="w-5 h-5" />} 
                label="Withdraw"
                onClick={() => handleNavigation("/withdraw")}
              />
              <SidebarItem 
                icon={<User className="w-5 h-5" />} 
                label="Your Profile"
                onClick={() => handleNavigation("/account")}
              />
              <SidebarItem 
                icon={<LinkIcon className="w-5 h-5" />} 
                label="Refer & Earn"
                onClick={() => handleNavigation("/refer-and-earn")}
              />
              <SidebarItem 
                icon={<Phone className="w-5 h-5" />} 
                label="Support"
                onClick={() => window.open("mailto:dropshipment.ecommerce@gmail.com", "_blank")}
              />
            </div>

            <div>
              <div className="px-6 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Dropshipping 
              </div>
              <SidebarItem 
                icon={<Package className="w-5 h-5" />} 
                label="Inventory"
                onClick={() => handleNavigation("/dropshipping")}
              />
              <SidebarItem 
                icon={<Rocket className="w-5 h-5" />} 
                label="Start Application"
                onClick={() => handleNavigation("/start-dropshipping")}
              />
              <SidebarItem 
                icon={<Package className="w-5 h-5" />} 
                label="Active Bookings"
                onClick={() => handleNavigation("/running-bookings")}
              />
            </div>

            <div>
              <div className="px-6 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Rewards
              </div>
              <SidebarItem 
                icon={<Award className="w-5 h-5" />} 
                label="Premium Codes"
                onClick={() => handleNavigation("/premium-codes")}
              />
            </div>

            <div>
              <div className="px-6 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Legal
              </div>
              <SidebarItem 
                icon={<Lock className="w-5 h-5" />} 
                label="Privacy Policy"
                onClick={() => handleNavigation("/privacy-policy")}
              />
              <SidebarItem 
                icon={<IdCard className="w-5 h-5" />} 
                label="KYC & AML"
                onClick={() => handleNavigation("/kyc-aml")}
              />
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const SidebarItem = ({ icon, label, onClick }: SidebarItemProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center px-6 py-3 text-sm font-medium text-slate-600 hover:text-primary hover:bg-primary/5 transition-all duration-200 group border-l-4 border-transparent hover:border-primary"
    >
      <span className="mr-3 text-slate-400 group-hover:text-primary transition-colors">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
};

export default Sidebar;
