import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { api } from "../services/api";

// Get Stripe public key from environment
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Initialize Stripe only if key exists
const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : Promise.reject(new Error("Stripe public key not configured"));

export function StripePaymentWrapper({ children }) {
  if (!STRIPE_PUBLIC_KEY) {
    return (
      <div style={{
        padding: "16px",
        background: "rgba(244,67,54,0.1)",
        border: "1px solid rgba(244,67,54,0.3)",
        borderRadius: "6px",
        color: "#ff8a80",
        fontSize: "0.9rem"
      }}>
        ⚠️ Stripe is not configured. Please set VITE_STRIPE_PUBLIC_KEY in your .env file.
      </div>
    );
  }

  return <Elements stripe={stripePromise}>{children}</Elements>;
}

export function StripeCheckoutButton({ userId, amount, description, membershipType, onSuccess, onError, variant = "primary" }) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await api.post("/stripe/payment/checkout-session", {
        userId,
        amount,
        description,
        membershipType
      });

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const result = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId
      });

      if (result.error) {
        onError?.(result.error.message);
      } else if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Payment failed";
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={`stripe-btn stripe-btn-${variant}`}
    >
      {loading ? "Processing..." : `Pay LKR ${amount.toFixed(2)} with Stripe`}
    </button>
  );
}

export function StripeCardPayment({ userId, amount, description, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create payment intent
      const intentResponse = await api.post("/stripe/payment/intent", {
        userId,
        amount,
        description
      });

      // Confirm payment with card
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        intentResponse.data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        onError?.(stripeError.message);
      } else if (paymentIntent.status === "succeeded") {
        // Verify payment in backend
        await api.post("/stripe/payment/verify", {
          paymentIntentId: paymentIntent.id,
          userId,
          amount,
          description
        });

        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Payment failed";
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="stripe-card-form">
      <div className="stripe-card-element">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4"
                }
              },
              invalid: {
                color: "#9e2146"
              }
            }
          }}
        />
      </div>
      {error && <div className="stripe-error">{error}</div>}
      <button type="submit" disabled={loading || !stripe} className="stripe-btn stripe-btn-primary">
        {loading ? "Processing..." : `Pay LKR ${amount.toFixed(2)}`}
      </button>
    </form>
  );
}

export function StripeReceipt({ receiptUrl }) {
  if (!receiptUrl) return null;

  return (
    <div className="stripe-receipt">
      <p>Receipt available:</p>
      <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="stripe-receipt-link">
        View Receipt
      </a>
    </div>
  );
}
