-- Create enum for required item types
CREATE TYPE required_item_type AS ENUM ('refund', 'verification_code', 'processing_fee', 'membership_fee');

-- Create enum for payment status
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'waived', 'rejected');

-- Create enum for app roles
CREATE TYPE app_role AS ENUM ('user', 'admin', 'super_admin');

-- Required items (static list)
CREATE TABLE public.required_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_index INTEGER NOT NULL UNIQUE,
  key TEXT NOT NULL UNIQUE,
  type required_item_type NOT NULL,
  amount_usd NUMERIC(10, 2) NOT NULL DEFAULT 0,
  amount_kes NUMERIC(10, 2) NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User required item status
CREATE TABLE public.user_required_item_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  required_item_id UUID NOT NULL REFERENCES public.required_items(id) ON DELETE CASCADE,
  status payment_status NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, required_item_id)
);

-- Payments for required items
CREATE TABLE public.required_item_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  required_item_id UUID NOT NULL REFERENCES public.required_items(id) ON DELETE CASCADE,
  gateway_id TEXT,
  amount_usd NUMERIC(10, 2) NOT NULL,
  amount_kes NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Admin actions audit
CREATE TABLE public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin notifications
CREATE TABLE public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.required_item_payments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.required_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_required_item_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.required_item_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for required_items (read-only for all authenticated users)
CREATE POLICY "Anyone can view required items"
  ON public.required_items FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_required_item_status
CREATE POLICY "Users can view own status"
  ON public.user_required_item_status FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own status"
  ON public.user_required_item_status FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own status"
  ON public.user_required_item_status FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all status"
  ON public.user_required_item_status FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update all status"
  ON public.user_required_item_status FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for required_item_payments
CREATE POLICY "Users can view own payments"
  ON public.required_item_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON public.required_item_payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
  ON public.required_item_payments FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for admin_actions
CREATE POLICY "Admins can view all actions"
  ON public.admin_actions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can insert actions"
  ON public.admin_actions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for admin_notifications
CREATE POLICY "Admins can view all notifications"
  ON public.admin_notifications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update notifications"
  ON public.admin_notifications FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Insert static required items in order
INSERT INTO public.required_items (order_index, key, type, amount_usd, amount_kes, description) VALUES
  (1, 'refund', 'refund', 0, 0, 'Please refund'),
  (2, 'verification_code', 'verification_code', 20, 2500, 'Verification code required'),
  (3, 'processing_fee', 'processing_fee', 13, 1625, 'Processing fee'),
  (4, 'membership_fee', 'membership_fee', 40, 5000, 'Membership fee');

-- Create trigger to update timestamps
CREATE TRIGGER update_user_required_item_status_updated_at
  BEFORE UPDATE ON public.user_required_item_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();