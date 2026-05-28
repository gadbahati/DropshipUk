
-- Migration: 20251104143244

-- Migration: 20251101013618

-- Migration: 20251101010538

-- Migration: 20251031181554
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  country TEXT DEFAULT 'UK',
  is_active BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create enum for booking levels
CREATE TYPE public.booking_level AS ENUM ('beginner', 'standard', 'expert');

-- Create enum for shipment status
CREATE TYPE public.shipment_status AS ENUM ('pending', 'in_transit', 'delivered', 'cancelled');

-- Create dropship applications table
CREATE TABLE public.dropship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  is_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.dropship_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
  ON public.dropship_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON public.dropship_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON public.dropship_applications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  level booking_level NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  outcome_amount DECIMAL(10, 2) NOT NULL,
  booking_percentage INTEGER DEFAULT 0 CHECK (booking_percentage >= 0 AND booking_percentage <= 100),
  status shipment_status DEFAULT 'pending',
  payment_method TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create membership subscriptions table
CREATE TABLE public.membership_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  amount_paid DECIMAL(10, 2) DEFAULT 5000,
  is_active BOOLEAN DEFAULT FALSE,
  is_refundable BOOLEAN DEFAULT TRUE,
  payment_method TEXT,
  subscribed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.membership_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.membership_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON public.membership_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.membership_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'booking', 'membership', 'payout')),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'declined')),
  payment_method TEXT,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create wallet/balance table
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance DECIMAL(10, 2) DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet"
  ON public.wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
  ON public.wallets FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update profile updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dropship_applications_updated_at
  BEFORE UPDATE ON public.dropship_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Migration: 20251101004548
-- Enable realtime for bookings table
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- Migration: 20251101010335
-- Update booking levels enum to match new requirements
ALTER TYPE booking_level RENAME TO booking_level_old;

CREATE TYPE booking_level AS ENUM ('beginner', 'standard', 'expert');

-- Update bookings table to use new enum
ALTER TABLE bookings 
  ALTER COLUMN level TYPE booking_level 
  USING level::text::booking_level;

-- Drop old enum
DROP TYPE booking_level_old;

-- Add payment verification fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT FALSE;

-- Update wallets to track pending withdrawals
ALTER TABLE wallets
  ADD COLUMN IF NOT EXISTS pending_withdrawal NUMERIC DEFAULT 0;

-- Create payment_transactions table for real payment tracking
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  membership_id UUID REFERENCES membership_subscriptions(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'KES',
  payment_method TEXT NOT NULL,
  payment_provider TEXT NOT NULL, -- 'mpesa', 'airtel', 'stripe', 'paypal'
  provider_transaction_id TEXT, -- External transaction ID
  provider_reference TEXT, -- External reference number
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed, refunded
  metadata JSONB, -- Store additional payment details
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own payment transactions"
  ON payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment transactions"
  ON payment_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only system can update payment transactions (through Edge Functions)
CREATE POLICY "System can update payment transactions"
  ON payment_transactions FOR UPDATE
  USING (false); -- Prevent client updates, only Edge Functions with service role

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider_tx_id ON payment_transactions(provider_transaction_id);

-- Add trigger for updated_at
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Migration: 20251101011145
-- Trigger types regeneration
-- Add a comment to the profiles table to force schema update
COMMENT ON TABLE public.profiles IS 'User profile information for Dropship UK';
COMMENT ON TABLE public.wallets IS 'User wallet balances';
COMMENT ON TABLE public.bookings IS 'Dropshipping bookings and orders';
COMMENT ON TABLE public.dropship_applications IS 'Dropshipping application forms';
COMMENT ON TABLE public.membership_subscriptions IS 'User membership subscriptions';
COMMENT ON TABLE public.transactions IS 'Financial transactions history';



-- Migration: 20251104143628
-- Create manual_payments table to store payment confirmations
CREATE TABLE IF NOT EXISTS public.manual_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  package_level TEXT NOT NULL CHECK (package_level IN ('beginner', 'standard', 'expert')),
  transaction_code TEXT NOT NULL,
  amount_paid NUMERIC NOT NULL,
  account_identifier TEXT NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(transaction_code)
);

-- Enable RLS
ALTER TABLE public.manual_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for manual_payments
CREATE POLICY "Users can view own manual payments"
  ON public.manual_payments
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own manual payments"
  ON public.manual_payments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_manual_payments_updated_at
  BEFORE UPDATE ON public.manual_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add payment_verified_at column to profiles for tracking when payment was verified
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP WITH TIME ZONE;

-- Migration: 20251104143643
-- Fix security warning: Update function to set search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Migration: 20251106162427
-- Create pending_verifications table to track payments awaiting verification
CREATE TABLE IF NOT EXISTS public.pending_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_code TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_reason TEXT NOT NULL,
  payment_type TEXT NOT NULL, -- 'activation', 'deposit', 'booking'
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  verification_due_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.pending_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own verifications"
  ON public.pending_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verifications"
  ON public.pending_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_pending_verifications_user_id ON public.pending_verifications(user_id);
CREATE INDEX idx_pending_verifications_due_at ON public.pending_verifications(verification_due_at) WHERE is_verified = false;

-- Add verification_pending field to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS verification_pending BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_due_at TIMESTAMP WITH TIME ZONE;
