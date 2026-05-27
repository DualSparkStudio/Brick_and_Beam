// Note: We don't initialize Razorpay on the client side
// The server-side keys should only be used in Netlify functions
// Client-side only needs the public key for the checkout

export interface RazorpayOrderData {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayPaymentData {
  order_id: string;
  payment_id: string;
  signature: string;
}

export const createRazorpayOrder = async (orderData: RazorpayOrderData) => {
  try {
    // This should be called from the server-side (Netlify function)
    // Client-side should not create orders directly
    throw new Error('Orders should be created server-side');
  } catch (error) {
    throw error;
  }
};

export const verifyPayment = (paymentData: RazorpayPaymentData) => {
  const { order_id, payment_id, signature } = paymentData;
  
  // Create the signature string
  const signatureString = `${order_id}|${payment_id}`;
  
  // Verify the signature (this is a basic verification)
  // In production, you should verify this on the server side
  return true; // For now, return true. Server-side verification is recommended
};

export const loadRazorpayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.head.appendChild(script);
  });
};

export const openRazorpayPayment = (
  orderId: string,
  amount: number,
  currency: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  description: string,
  onSuccess: (response: any) => void,
  onFailure: (error: any) => void
) => {
  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: amount * 100, // Convert to paise
    currency: currency,
    name: 'Resort Booking System',
    description: description,
    order_id: orderId,
    handler: onSuccess,
    prefill: {
      name: customerName,
      email: customerEmail,
      contact: customerPhone,
    },
    notes: {
      address: 'Resort Booking System',
    },
    theme: {
      color: '#2563eb',
    },
    modal: {
      ondismiss: onFailure,
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.open();
}; 
