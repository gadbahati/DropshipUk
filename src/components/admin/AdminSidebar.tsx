import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  DollarSign,
  ShieldCheck,
  Wallet,
  UserPlus,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleNavigation = (section: string) => {
    // Scroll to section on the same page
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      onClose();
    }
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
          fixed lg:static top-0 left-0 h-full w-72 bg-sidebar-background border-r border-sidebar-border z-50
          transform transition-transform duration-300 lg:transform-none
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <ScrollArea className="h-full">
          <div className="py-5">
            <div className="mb-6">
              <button
                onClick={() => {
                  navigate("/admin-dashboard");
                  onClose();
                }}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-sidebar-primary hover:bg-sidebar-accent transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 mr-3" />
                Admin Dashboard
              </button>
            </div>

            <div className="mb-6">
              <div className="px-4 pb-2 text-sm font-semibold text-sidebar-foreground border-b border-sidebar-border">
                Client Management
              </div>
              
              <AdminSidebarItem 
                icon={<UserPlus />} 
                label="New Signups" 
                onClick={() => handleNavigation("new-signups")}
              />
              
              <AdminSidebarItem 
                icon={<DollarSign />} 
                label="All Payments" 
                onClick={() => handleNavigation("all-payments")}
              />
              
              <AdminSidebarItem 
                icon={<Wallet />} 
                label="Deposits" 
                onClick={() => handleNavigation("deposits")}
              />
              
              <AdminSidebarItem 
                icon={<ShieldCheck />} 
                label="Activation Payments" 
                onClick={() => handleNavigation("activation-payments")}
              />
              
              <AdminSidebarItem 
                icon={<ShieldCheck />} 
                label="Verification Payments" 
                onClick={() => handleNavigation("verification-payments")}
              />
              
              <AdminSidebarItem 
                icon={<Wallet />} 
                label="Withdrawals" 
                onClick={() => handleNavigation("withdrawals")}
              />
              
              <AdminSidebarItem 
                icon={<Users />} 
                label="Referrals" 
                onClick={() => handleNavigation("referrals")}
              />
            </div>

            <div className="mb-6">
              <div className="px-4 pb-2 text-sm font-semibold text-sidebar-foreground border-b border-sidebar-border">
                Account
              </div>
              <AdminSidebarItem
                icon={<LogOut />}
                label="Log Out"
                onClick={handleLogout}
              />
            </div>
          </div>
        </ScrollArea>
      </nav>
    </>
  );
};

interface AdminSidebarItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const AdminSidebarItem = ({ icon, label, onClick }: AdminSidebarItemProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center px-4 py-3 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
    >
      <span className="w-4 h-4 mr-3">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
};

export default AdminSidebar;
