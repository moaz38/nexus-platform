import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Check, Zap, ShieldCheck, Crown } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

// 🔴 Stripe Key (Make sure ye sahi ho)
const stripePromise = loadStripe('pk_test_51SpZSYF6dmwX0f7Sd5dFsPqiznhRLPjg0B3yTbhqshVZ2NaMStkR1XzurpTNfHIFt9RlItXybwanAZwa15nAbJbE00cwY9HXhz');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  
  // ✅ FIX: Ab hum 'updateUserManually' nahi, balkay 'refreshProfile' use karein ge
  // @ts-ignore
  const { user, refreshProfile } = useAuth(); 

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const loadingToast = toast.loading('Securing your upgrade...');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Session expired. Please login again.");

      // 1. Payment Intent
      const response = await fetch('http://localhost:5001/api/payment/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: 50 }),
      });

      if (!response.ok) throw new Error("Payment server unreachable.");
      const paymentData = await response.json(); 

      // 2. Stripe Confirmation
      const result = await stripe.confirmCardPayment(paymentData.clientSecret, {
        payment_method: { card: elements.getElement(CardElement)! },
      });

      if (result.error) throw new Error(result.error.message);
      
      if (result.paymentIntent.status === 'succeeded') {
        
        // 3. Activate Premium (Backend Update)
        const upgradeRes = await fetch('http://localhost:5001/api/activate-premium', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        });

        if (!upgradeRes.ok) throw new Error("Payment successful, but profile update failed.");

        // ✅ MAGIC FIX: Server se fresh data mangwao
        if (refreshProfile) {
            await refreshProfile();
        }

        toast.dismiss(loadingToast);
        toast.success('🎉 Upgrade Successful! Welcome to Elite Club.');
        
        // Safety Refresh
        setTimeout(() => window.location.reload(), 1500);
      }

    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error("Payment Error:", error);
      toast.error(error.message || 'Transaction Failed');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Details</label>
        <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
          <CardElement options={{ 
            style: { 
                base: { fontSize: '16px', color: '#1f2937', '::placeholder': { color: '#9ca3af' }, iconColor: '#4f46e5' },
                invalid: { color: '#ef4444' }
            } 
          }} />
        </div>
      </div>
      
      <button 
        type="submit" 
        disabled={!stripe || loading}
        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? 'Processing...' : (
            <>
                <span>Pay $50 & Upgrade Instantly</span>
                <Zap size={20} className="fill-current" />
            </>
        )}
      </button>
      
      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
        <ShieldCheck size={14} />
        <span>256-bit SSL Encrypted Payment</span>
      </div>
    </form>
  );
};

export const PaymentPage = () => {
  const { user } = useAuth();
  
  // Safe check for premium status
  const isPremium = (user as any)?.isPremium === true || (user as any)?.isPremium === 'true';

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">Membership Plans</h2>
          <h1 className="mt-2 text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Growth Path</span>
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
            Unlock the full potential of your business network with our premium tools.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* FREE PLAN (Left Side) */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col relative opacity-80 hover:opacity-100 transition-opacity">
            <div className="mb-4">
                <span className="inline-block px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold tracking-wide">STARTER</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Basic Access</h3>
            <div className="my-6 flex items-baseline">
              <span className="text-5xl font-extrabold text-gray-900">$0</span>
              <span className="ml-2 text-gray-500">/forever</span>
            </div>
            <p className="text-gray-500 mb-8">Essential tools to get you started on the platform.</p>
            
            <ul className="space-y-4 mb-8 flex-1">
              {['Public Profile', 'Browse Listings', 'Basic Search', 'Receive Messages'].map((feat, i) => (
                <li key={i} className="flex items-center text-gray-600">
                  <Check className="text-green-500 mr-3 flex-shrink-0" size={18} />
                  {feat}
                </li>
              ))}
               {['Unlimited DM', 'Verified Badge', 'Featured Listing'].map((feat, i) => (
                <li key={i} className="flex items-center text-gray-300 line-through">
                  <Check className="text-gray-200 mr-3 flex-shrink-0" size={18} />
                  {feat}
                </li>
              ))}
            </ul>

            <button disabled className="w-full py-4 px-6 rounded-xl border-2 border-gray-200 text-gray-400 font-bold cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* PREMIUM PLAN (Right Side - Highlighted) */}
          <div className={`rounded-3xl shadow-2xl p-8 flex flex-col relative border-2 ${isPremium ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-indigo-600'} transform md:-translate-y-4 transition-transform`}>
            
            {/* Badge for Active Premium */}
            {isPremium && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-2xl shadow-sm flex items-center gap-1">
                    <Check size={12} /> PLAN ACTIVE
                </div>
            )}

            {!isPremium && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-2xl shadow-sm">
                RECOMMENDED
                </div>
            )}

            <div className="mb-4 flex items-center gap-2">
                <span className="inline-block px-4 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold tracking-wide">PRO MEMBER</span>
                <Crown size={20} className="text-yellow-500 fill-current" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900">Premium Upgrade</h3>
            <div className="my-6 flex items-baseline">
              <span className="text-5xl font-extrabold text-gray-900">$50</span>
              <span className="ml-2 text-gray-500">/one-time</span>
            </div>
            <p className="text-gray-500 mb-8">Everything you need to scale your connections.</p>

            <ul className="space-y-4 mb-8 flex-1">
              {[
                'Everything in Basic',
                'Unlimited Direct Messaging 💬',
                'Verified Trust Badge ✅',
                'Top-Ranked Profile Placement 🚀',
                'Priority Support 24/7'
              ].map((feat, i) => (
                <li key={i} className="flex items-center text-gray-800 font-medium">
                  <div className="bg-indigo-100 p-1 rounded-full mr-3">
                    <Check className="text-indigo-600" size={14} />
                  </div>
                  {feat}
                </li>
              ))}
            </ul>

            <div className="border-t border-gray-100 pt-6">
                {isPremium ? (
                    <div className="w-full bg-green-100 text-green-700 font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 border border-green-200">
                        <ShieldCheck size={20} />
                        <span>You are already a Premium Member</span>
                    </div>
                ) : (
                    <Elements stripe={stripePromise}>
                        <CheckoutForm />
                    </Elements>
                )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};