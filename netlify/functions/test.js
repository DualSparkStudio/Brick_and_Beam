exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Function works!',
      env: {
        hasRazorpayId: !!process.env.RAZORPAY_KEY_ID,
        hasRazorpaySecret: !!process.env.RAZORPAY_KEY_SECRET,
        razorpayIdPrefix: process.env.RAZORPAY_KEY_ID?.substring(0, 10)
      }
    })
  };
};
