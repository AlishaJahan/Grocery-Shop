import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

interface StripePaymentProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
  address: {
    houseNumber: string;
    area: string;
    city: string;
    pincode: string;
  };
}

const StripePayment: React.FC<StripePaymentProps> = ({ clientSecret, onSuccess, onCancel, address }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/history',
          payment_method_data: {
            billing_details: {
              address: {
                line1: address.houseNumber,
                line2: address.area,
                city: address.city,
                postal_code: address.pincode,
                country: 'US', // Defaulting to US for testing, ideally should be dynamic
              }
            }
          }
        },
        redirect: 'if_required',
      });

      console.log('Stripe response:', { error, paymentIntent });

      if (error) {
        setMessage(error.message || 'An unexpected error occurred.');
        toast.error(error.message || 'Payment failed');
        setIsProcessing(false);
      } else if (paymentIntent) {
        setMessage(`Payment status: ${paymentIntent.status}`);
        if (paymentIntent.status === 'succeeded') {
          console.log('Payment succeeded, calling onSuccess...');
          try {
            await onSuccess();
            console.log('onSuccess completed successfully');
          } catch (err: any) {
            console.error('onSuccess failed:', err);
            toast.error('Payment succeeded but order confirmation failed. Please contact support.');
            setIsProcessing(false);
          }
        } else {
          console.log('Payment not succeeded yet:', paymentIntent.status);
          if (paymentIntent.status !== 'processing') {
            setIsProcessing(false);
          }
        }
      } else {
        setMessage('Unexpected response from Stripe.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('Fatal error in handleSubmit:', err);
      toast.error(`Fatal Error: ${err.message || 'Unknown error'}`);
      setIsProcessing(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" options={{
        layout: 'accordion'
      }} />

      <div className="flex space-x-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-xl bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] text-[var(--color-text)] font-bold transition-all"
        >
          Cancel
        </button>
        <button
          disabled={isProcessing || !stripe || !elements}
          id="submit"
          className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white font-bold transition-all shadow-lg shadow-emerald-600/20"
        >
          <span id="button-text">
            {isProcessing ? "Processing..." : "Pay Now"}
          </span>
        </button>
      </div>

      {message && <div id="payment-message" className="text-rose-400 text-sm text-center font-medium mt-4">{message}</div>}
    </form>
  );
}

export default StripePayment;
