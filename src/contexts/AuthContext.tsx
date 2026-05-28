import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect after auth when landing on login/register/home
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    const path = location.pathname;
    const shouldRedirect = path === "/login" || path === "/register" || path === "/auth" || path === "/";
    if (!shouldRedirect) return;

    // Defer role check to avoid blocking the auth callback
    setTimeout(async () => {
      try {
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        const isAdmin = roles?.some(r => r.role === 'admin' || r.role === 'super_admin');
        if (isAdmin) {
          await supabase
            .from('profiles')
            .update({
              is_active: true,
              is_verified: true,
              activation_status: 'approved',
              verification_status: 'approved'
            })
            .eq('id', user.id);
          navigate('/admin-dashboard');
        } else {
          navigate('/dashboard');
        }
      } catch (e) {
        // fallback
        navigate('/dashboard');
      }
    }, 0);
  }, [user, loading, location.pathname, navigate]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });

    // Create admin notification for new signup (clients only, not admin)
    if (!error && data.user && email !== 'dropshiment.ecommerce@gmail.com') {
      await supabase
        .from('admin_notifications')
        .insert({
          user_id: data.user.id,
          event_type: 'new_signup',
          message: `New user signup: ${fullName} (${email})`,
        });
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error && data.user) {
      // Check if user is admin or super admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id);
      
      const isAdmin = roles?.some(r => r.role === 'admin' || r.role === 'super_admin');
      
      if (isAdmin) {
        // Ensure admin account flags are always active/verified
        await supabase
          .from('profiles')
          .update({
            is_active: true,
            is_verified: true,
            activation_status: 'approved',
            verification_status: 'approved'
          })
          .eq('id', data.user.id);
        
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    }
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
