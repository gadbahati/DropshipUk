import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Users,
  DollarSign,
  ShieldCheck,
  Wallet,
  UserPlus,
  LogOut,
  LayoutDashboard,
  Settings,
  Bell,
  Activity,
  Package,
  FileText,
  Search,
  ChevronRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const handleNavigation = (section: string) => {
    // If we're not on the admin dashboard, navigate there first
    if (window.location.pathname !== "/admin-dashboard") {
      navigate("/admin-dashboard");
      // Wait for navigation then scroll
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
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
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <nav
        className={cn(
          "fixed lg:static top-0 left-0 h-full w-64 bg-[#1e1e2d] text-[#a2a3b7] z-50 transform transition-transform duration-300 lg:transform-none shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-16 flex items-center px-6 bg-[#1b1b28] border-b border-[#2b2b40]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                UK
              </div>
              <span className="font-bold text-white tracking-tight text-lg">Admin Panel</span>
            </div>
          </div>

          <ScrollArea className="flex-1 py-4">
            <div className="px-4 space-y-6">
              {/* Dashboard Group */}
              <div>
                <div className="px-4 mb-2 text-[10px] font-bold text-[#565674] uppercase tracking-[0.1em]">
                  Dashboard
                </div>
                <AdminSidebarItem 
                  icon={<LayoutDashboard className="w-4 h-4" />} 
                  label="Overview" 
                  onClick={() => { navigate("/admin-dashboard"); onClose(); }}
                  active={location.pathname === "/admin-dashboard"}
                />
              </div>

              {/* User Management Group */}
              <div>
                <div className="px-4 mb-2 text-[10px] font-bold text-[#565674] uppercase tracking-[0.1em]">
                  User Control
                </div>
                <AdminSidebarItem 
                  icon={<Users className="w-4 h-4" />} 
                  label="All Clients" 
                  onClick={() => handleNavigation("new-signups")}
                />
                <AdminSidebarItem 
                  icon={<UserPlus className="w-4 h-4" />} 
                  label="New Signups" 
                  onClick={() => handleNavigation("new-signups")}
                />
                <AdminSidebarItem 
                  icon={<Activity className="w-4 h-4" />} 
                  label="User Roles" 
                  onClick={() => handleNavigation("new-signups")}
                />
              </div>

              {/* Financial Control Group */}
              <div>
                <div className="px-4 mb-2 text-[10px] font-bold text-[#565674] uppercase tracking-[0.1em]">
                  Financials
                </div>
                <AdminSidebarItem 
                  icon={<DollarSign className="w-4 h-4" />} 
                  label="All Payments" 
                  onClick={() => handleNavigation("all-payments")}
                />
                <AdminSidebarItem 
                  icon={<Wallet className="w-4 h-4" />} 
                  label="Deposits" 
                  onClick={() => handleNavigation("deposits")}
                />
                <AdminSidebarItem 
                  icon={<ShieldCheck className="w-4 h-4" />} 
                  label="Activations" 
                  onClick={() => handleNavigation("activation-payments")}
                />
                <AdminSidebarItem 
                  icon={<ShieldCheck className="w-4 h-4" />} 
                  label="Verifications" 
                  onClick={() => handleNavigation("verification-payments")}
                />
                <AdminSidebarItem 
                  icon={<Wallet className="w-4 h-4" />} 
                  label="Withdrawals" 
                  onClick={() => handleNavigation("withdrawals")}
                />
              </div>

              {/* System Group */}
              <div>
                <div className="px-4 mb-2 text-[10px] font-bold text-[#565674] uppercase tracking-[0.1em]">
                  System
                </div>
                <AdminSidebarItem 
                  icon={<Package className="w-4 h-4" />} 
                  label="Bookings" 
                  onClick={() => handleNavigation("all-payments")}
                />
                <AdminSidebarItem 
                  icon={<Bell className="w-4 h-4" />} 
                  label="Notifications" 
                  onClick={() => handleNavigation("all-payments")}
                />
                <AdminSidebarItem 
                  icon={<Settings className="w-4 h-4" />} 
                  label="Settings" 
                  onClick={() => {}}
                />
              </div>
            </div>
          </ScrollArea>

          {/* Footer Section */}
          <div className="p-4 bg-[#1b1b28] border-t border-[#2b2b40]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-[#f1416c] hover:bg-[#3a2434] rounded-lg transition-all duration-200 group"
            >
              <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};



interface AdminSidebarItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

const AdminSidebarItem = ({ icon, label, onClick, active }: AdminSidebarItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center px-4 py-2.5 my-0.5 text-sm font-medium rounded-lg transition-all duration-200 group relative",
        active 
          ? "bg-[#2b2b40] text-white shadow-lg" 
          : "text-[#a2a3b7] hover:bg-[#2b2b40] hover:text-white"
      )}
    >
      <span className={cn(
        "mr-3 transition-colors duration-200",
        active ? "text-primary" : "text-[#494b74] group-hover:text-primary"
      )}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {active && (
        <span className="absolute right-2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
      )}
      {!active && (
        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-40 group-hover:translate-x-0.5 transition-all duration-200" />
      )}
    </button>
  );
};

export default AdminSidebar;
