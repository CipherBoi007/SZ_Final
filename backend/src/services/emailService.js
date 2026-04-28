const nodemailer = require('nodemailer');
const config = require('../config/env');

class EmailService {
  constructor() {
    let authConfig;
    let transportOptions = {
      host: config.EMAIL.HOST || 'smtp.gmail.com',
      port: config.EMAIL.PORT || 587,
      secure: config.EMAIL.PORT === 465,
    };

    if (config.EMAIL.RESEND_API_KEY) {
      // 1. Primary: Resend SMTP
      transportOptions = {
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
      };
      authConfig = {
        user: 'resend',
        pass: config.EMAIL.RESEND_API_KEY,
      };
    } else {
      // 2. Fallback: Standard SMTP (App Password)
      authConfig = {
        user: config.EMAIL.USER,
        pass: config.EMAIL.PASS,
      };
      if (transportOptions.host.includes('gmail')) {
        transportOptions.service = 'gmail';
      }
    }

    this.transporter = nodemailer.createTransport({
      ...transportOptions,
      auth: authConfig,
    });
  }

  async sendEmail(to, subject, html) {
    try {
      const fromEmail = config.EMAIL.RESEND_API_KEY ? 'onboarding@resend.dev' : config.EMAIL.USER;
      
      // Skip sending if no valid sender or key
      if (!config.EMAIL.RESEND_API_KEY && (!config.EMAIL.USER || config.EMAIL.USER === 'your-email@gmail.com')) {
        console.log(`[Email Skipped] To: ${to}, Subject: ${subject}`);
        return { messageId: 'skipped-not-configured' };
      }

      const mailOptions = {
        from: `SouthZone <${fromEmail}>`,
        to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Email sending error:', error.message);
      throw new Error('Failed to send email');
    }
  }

  async sendOrderConfirmation(email, order, name) {
    const subject = `Order Confirmation - ${order.orderNumber}`;
    const html = `
      <h1>Thank you for your order${name ? `, ${name}` : ''}!</h1>
      <p>Your order #${order.orderNumber} has been confirmed.</p>
      <h2>Order Details:</h2>
      <p>Total Amount: ₹${order.finalAmount}</p>
      <p>Status: ${order.status}</p>
      <p>We'll notify you once your order ships.</p>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendPasswordResetEmail(email, resetURL) {
    const subject = 'Password Reset Request';
    const html = `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetURL}">${resetURL}</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendWelcomeEmail(email, name) {
    const subject = 'Welcome to SouthZone!';
    const html = `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for registering with SouthZone.</p>
      <p>Start shopping for the latest fashion trends now!</p>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendOrderShippedEmail(email, order) {
    const subject = `Your Order #${order.orderNumber} Has Shipped!`;
    const html = `
      <h1>Your Order Has Shipped!</h1>
      <p>Your order #${order.orderNumber} is on its way.</p>
      <p>Track your order in your account dashboard.</p>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendPasswordChangeNotification(email, name) {
    const subject = 'Password Changed Successfully';
    const html = `
      <h1>Password Changed</h1>
      <p>Hi ${name},</p>
      <p>Your password has been changed successfully.</p>
      <p>If you didn't make this change, please contact support immediately.</p>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendAccountDeactivationEmail(email, name) {
    const subject = 'Account Deactivated - SouthZone';
    const html = `
      <h1>We're sorry to see you go, ${name}!</h1>
      <p>Your account has been deactivated.</p>
      <p>If you'd like to reactivate your account, please contact our support team.</p>
      <p>Thank you for being a valued customer.</p>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendOrderCancellationEmail(email, order) {
    const subject = `Order #${order.orderNumber} Cancelled`;
    const html = `
      <h1>Order Cancelled</h1>
      <p>Your order #${order.orderNumber} has been cancelled.</p>
      ${order.cancellationReason ? `<p>Reason: ${order.cancellationReason}</p>` : ''}
      <p>If a payment was made, your refund will be processed within 5-7 business days.</p>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendPaymentConfirmation(email, order) {
    const subject = `Payment Confirmed - Order #${order.orderNumber}`;
    const html = `
      <h1>Payment Confirmed!</h1>
      <p>Your payment for order #${order.orderNumber} has been received.</p>
      <p>Amount: ₹${order.finalAmount}</p>
      <p>Your order is now being processed.</p>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendReturnRequestEmail(email, order, returnRequest) {
    const subject = `Return Request - Order #${order.orderNumber}`;
    const html = `
      <h1>Return Request Received</h1>
      <p>We've received your return request for order #${order.orderNumber}.</p>
      <p>Reason: ${returnRequest.reason || 'Not specified'}</p>
      <p>We'll review your request and get back to you within 48 hours.</p>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendWishlistShare(email, userName, shareableLink) {
    const subject = `${userName} shared their wishlist with you!`;
    const html = `
      <h1>Check out this wishlist!</h1>
      <p>${userName} has shared their SouthZone wishlist with you.</p>
      <p><a href="${shareableLink}">View Wishlist</a></p>
    `;

    return this.sendEmail(email, subject, html);
  }

  async sendPriceDropNotification(email, productName, currentPrice, targetPrice) {
    const subject = `Price Drop Alert - ${productName}`;
    const html = `
      <h1>Price Drop Alert! 🎉</h1>
      <p>Great news! The price of <strong>${productName}</strong> has dropped.</p>
      <p>Current Price: ₹${currentPrice}</p>
      <p>Your Target Price: ₹${targetPrice}</p>
      <p>Grab it before the price goes back up!</p>
    `;

    return this.sendEmail(email, subject, html);
  }
}

module.exports = new EmailService();