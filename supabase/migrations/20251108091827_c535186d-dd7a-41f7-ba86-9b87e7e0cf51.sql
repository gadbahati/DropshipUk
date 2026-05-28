-- Add constraint to ensure only the specific admin email can have admin role
CREATE OR REPLACE FUNCTION public.validate_admin_email()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    -- Check if user email matches the allowed admin email
    IF NOT EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = NEW.user_id 
      AND email = 'dropshiment.ecommerce@gmail.com'
    ) THEN
      RAISE EXCEPTION 'Only the designated admin email can have admin role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to validate admin email before insert or update
DROP TRIGGER IF EXISTS validate_admin_email_trigger ON public.user_roles;
CREATE TRIGGER validate_admin_email_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_admin_email();

-- Add activation and verification status to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS activation_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS activation_paid_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS verification_paid_at timestamp with time zone;

-- Create activation payments table
CREATE TABLE IF NOT EXISTS public.activation_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_usd numeric NOT NULL DEFAULT 100,
  amount_kes numeric NOT NULL DEFAULT 12500,
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  transaction_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.activation_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activation payments"
  ON public.activation_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activation payments"
  ON public.activation_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all activation payments"
  ON public.activation_payments FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update activation payments"
  ON public.activation_payments FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create verification payments table
CREATE TABLE IF NOT EXISTS public.verification_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_usd numeric NOT NULL DEFAULT 50,
  amount_kes numeric NOT NULL DEFAULT 6250,
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  transaction_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.verification_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own verification payments"
  ON public.verification_payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verification payments"
  ON public.verification_payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification payments"
  ON public.verification_payments FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update verification payments"
  ON public.verification_payments FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create withdrawal requests table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  withdraw_code text,
  client_note text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawal requests"
  ON public.withdrawal_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawal requests"
  ON public.withdrawal_requests FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update withdrawal requests"
  ON public.withdrawal_requests FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Update admin_notifications to support more event types
ALTER TABLE public.admin_notifications 
ALTER COLUMN event_type TYPE text;

-- Create index for faster admin queries
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON public.admin_notifications(is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activation_payments_status ON public.activation_payments(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_payments_status ON public.verification_payments(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status, created_at DESC);