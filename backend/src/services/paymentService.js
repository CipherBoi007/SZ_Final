const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config/env');

const razorpay = new Razorpay({
  key_id: config.RAZORPAY.KEY_ID,
  key_secret: config.RAZORPAY.KEY_SECRET,
});

class PaymentService {
  async createOrder({ amount, currency, receipt }) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt,
        payment_capture: 1,
      };

      const order = await razorpay.orders.create(options);
      return order;
    } catch (error) {
      console.error('Payment order creation error:', error);
      throw new Error('Failed to create payment order');
    }
  }

  verifyPayment({ orderId, paymentId, signature }) {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', config.RAZORPAY.KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  }

  async getPaymentDetails(paymentId) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Payment details fetch error:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  async refundPayment(paymentId, amount) {
    try {
      // ─── Simulation Logic ──────────────────────────────────────────
      // If using a test key and a simulated payment ID, return success
      const isTestKey = config.RAZORPAY.KEY_ID.startsWith('rzp_test_');
      const isSimulatedId = paymentId.startsWith('pay_') && !paymentId.includes('sim_real'); // seeded IDs
      
      if (isTestKey && isSimulatedId) {
        console.log(`[SIMULATION] Processing mock refund for Test ID: ${paymentId}`);
        return {
          id: `rfnd_sim_${Math.random().toString(36).substr(2, 9)}`,
          entity: 'refund',
          amount: Math.round(amount * 100),
          currency: 'INR',
          payment_id: paymentId,
          status: 'processed',
          created_at: Math.floor(Date.now() / 1000)
        };
      }
      // ───────────────────────────────────────────────────────────────

      const refund = await razorpay.payments.refund(paymentId, {
        amount: amount ? Math.round(amount * 100) : undefined,
      });
      return refund;
    } catch (error) {
      console.error('Payment refund error:', error);
      throw new Error(error.description || 'Failed to process refund');
    }
  }
}

module.exports = new PaymentService();