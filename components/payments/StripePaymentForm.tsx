"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

interface StripePaymentFormProps {
  amount: number;
  onSuccess: () => Promise<void>;
  isLoading?: boolean;
}

export default function StripePaymentForm({ amount, onSuccess, isLoading: externalLoading }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required", // Important: we handle redirect ourselves if needed, or just proceed on success
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An error occurred.");
        toast.error(error.message || "An error occurred.");
      } else {
        setMessage("An unexpected error occurred.");
        toast.error("An unexpected error occurred.");
      }
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      toast.success("Payment successful!");
      await onSuccess();
      setIsLoading(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
      
      <div className="pt-6 border-t border-gray-800">
        <Button
          disabled={isLoading || !stripe || !elements || externalLoading}
          id="submit"
          className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-[24px] font-black text-lg shadow-lg shadow-blue-900/50"
        >
          <span id="button-text">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              `Pay $${(amount / 100).toFixed(2)}`
            )}
          </span>
        </Button>
      </div>

      {message && (
        <div id="payment-message" className="text-red-400 text-sm font-bold text-center bg-red-400/10 p-4 rounded-xl border border-red-400/20">
          {message}
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
        <ShieldCheck className="h-3 w-3" />
        Encrypted Payment via Stripe
      </div>
    </form>
  );
}
