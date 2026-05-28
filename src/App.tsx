import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Sandbox from "./pages/Sandbox";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AlreadyRegistered from "./pages/AlreadyRegistered";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import PayForDownline from "./pages/PayForDownline";
import ReferAndEarn from "./pages/ReferAndEarn";
import CustomerCare from "./pages/CustomerCare";
import StartDropshipping from "./pages/StartDropshipping";
import RunningBookings from "./pages/RunningBookings";
import Dropshipping from "./pages/Dropshipping";
import PremiumCodes from "./pages/PremiumCodes";
import MembershipSubscription from "./pages/MembershipSubscription";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import KycAml from "./pages/KycAml";
import ManualPayment from "./pages/ManualPayment";
import AdminDashboard from "./pages/AdminDashboard";
import BuyActivation from "./pages/BuyActivation";
import BuyVerification from "./pages/BuyVerification";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Sandbox />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/already-registered" element={<AlreadyRegistered />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
            <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
            <Route path="/pay-for-downline" element={<ProtectedRoute><PayForDownline /></ProtectedRoute>} />
            <Route path="/refer-and-earn" element={<ProtectedRoute><ReferAndEarn /></ProtectedRoute>} />
            <Route path="/customer-care" element={<ProtectedRoute><CustomerCare /></ProtectedRoute>} />
            <Route path="/start-dropshipping" element={<ProtectedRoute><StartDropshipping /></ProtectedRoute>} />
            <Route path="/running-bookings" element={<ProtectedRoute><RunningBookings /></ProtectedRoute>} />
            <Route path="/dropshipping" element={<ProtectedRoute><Dropshipping /></ProtectedRoute>} />
            <Route path="/premium-codes" element={<ProtectedRoute><PremiumCodes /></ProtectedRoute>} />
            <Route path="/membership" element={<ProtectedRoute><MembershipSubscription /></ProtectedRoute>} />
            <Route path="/membership-subscription" element={<ProtectedRoute><MembershipSubscription /></ProtectedRoute>} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/kyc-aml" element={<KycAml />} />
            <Route path="/manual-payment" element={<ProtectedRoute><ManualPayment /></ProtectedRoute>} />
          <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/buy-activation" element={<ProtectedRoute><BuyActivation /></ProtectedRoute>} />
          <Route path="/buy-verification" element={<ProtectedRoute><BuyVerification /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
