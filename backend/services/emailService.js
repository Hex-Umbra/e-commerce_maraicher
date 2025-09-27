import sgMail from '@sendgrid/mail';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'g.p.dacosta@hotmail.com';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    this.isInitialized = false;
  }

  // Lazy initialization of SendGrid
  initializeSendGrid() {
    if (!this.isInitialized) {
      const apiKey = process.env.SENDGRID_API_KEY;
      if (!apiKey) {
        throw new Error('SENDGRID_API_KEY environment variable is not set');
      }
      if (!apiKey.startsWith('SG.')) {
        throw new Error('SENDGRID_API_KEY must start with "SG."');
      }
      sgMail.setApiKey(apiKey);
      this.isInitialized = true;
      logger.info('SendGrid initialized successfully');
    }
  }

  // Load and compile email template
  async loadTemplate(templateName, data) {
    try {
      const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.hbs`);
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);
      return template(data);
    } catch (error) {
      logger.error(`Error loading email template ${templateName}: ${error.message}`);
      throw new Error(`Failed to load email template: ${templateName}`);
    }
  }

  // Send email using SendGrid
  async sendEmail(to, subject, htmlContent, textContent = null) {
    try {
      // Ensure SendGrid is initialized
      this.initializeSendGrid();

      const msg = {
        to,
        from: {
          email: this.fromEmail,
          name: 'Marché Frais Fermier'
        },
        subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
      };

      const result = await sgMail.send(msg);
      logger.info(`Email sent successfully to ${to} with subject: ${subject}`);
      return result;
    } catch (error) {
      logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  // Send email verification email
  async sendEmailVerification(user, token) {
    try {
      // Point directly to backend API endpoint for verification
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
      const verificationUrl = `${backendUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;

      const templateData = {
        userName: user.name,
        verificationUrl,
        frontendUrl: this.frontendUrl
      };

      const htmlContent = await this.loadTemplate('emailVerification', templateData);

      await this.sendEmail(
        user.email,
        'Vérifiez votre adresse email - Marché Frais Fermier',
        htmlContent
      );

      logger.info(`Email verification sent to ${user.email} for user ${user.name}`);
    } catch (error) {
      logger.error(`Failed to send verification email to ${user.email}: ${error.message}`);
      throw error;
    }
  }

  // Resend email verification
  async resendEmailVerification(user) {
    try {
      // Generate new token
      const token = user.generateEmailVerificationToken();
      await user.save();

      // Send verification email
      await this.sendEmailVerification(user, token);

      logger.info(`Email verification resent to ${user.email}`);
    } catch (error) {
      logger.error(`Failed to resend verification email to ${user.email}: ${error.message}`);
      throw error;
    }
  }

  // Send order confirmation email
  async sendOrderConfirmation(user, order) {
    try {
      const templateData = {
        userName: user.name,
        userEmail: user.email,
        orderId: order._id,
        orderDate: order.createdAt.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        products: order.products.map(product => ({
          name: product.productId.name,
          quantity: product.quantity,
          price: product.price,
          total: (product.price * product.quantity).toFixed(2),
          status: product.status
        })),
        totalAmount: order.totalAmount.toFixed(2),
        orderStatus: order.status,
        frontendUrl: this.frontendUrl
      };

      const htmlContent = await this.loadTemplate('orderConfirmation', templateData);

      await this.sendEmail(
        user.email,
        `Confirmation de commande #${order._id} - Marché Frais Fermier`,
        htmlContent
      );

      logger.info(`Order confirmation email sent to ${user.email} for order ${order._id}`);
    } catch (error) {
      logger.error(`Failed to send order confirmation email to ${user.email}: ${error.message}`);
      throw error;
    }
  }

  // Send order status update email
  async sendOrderStatusUpdate(user, order, updatedProducts) {
    try {
      const templateData = {
        userName: user.name,
        orderId: order._id,
        orderDate: order.createdAt.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        updatedProducts: updatedProducts.map(product => ({
          name: product.productId.name,
          quantity: product.quantity,
          price: product.price,
          oldStatus: product.oldStatus,
          newStatus: product.status,
          producerName: product.productId.producteurId?.name || 'Producteur'
        })),
        orderStatus: order.status,
        totalAmount: order.totalAmount.toFixed(2),
        frontendUrl: this.frontendUrl
      };

      const htmlContent = await this.loadTemplate('orderStatusUpdate', templateData);

      await this.sendEmail(
        user.email,
        `Mise à jour de votre commande #${order._id} - Marché Frais Fermier`,
        htmlContent
      );

      logger.info(`Order status update email sent to ${user.email} for order ${order._id}`);
    } catch (error) {
      logger.error(`Failed to send order status update email to ${user.email}: ${error.message}`);
      throw error;
    }
  }

  // Send order cancellation email
  async sendOrderCancellation(user, order) {
    try {
      const templateData = {
        userName: user.name,
        orderId: order._id,
        orderDate: order.createdAt.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        products: order.products.map(product => ({
          name: product.productId.name,
          quantity: product.quantity,
          price: product.price,
          total: (product.price * product.quantity).toFixed(2)
        })),
        totalAmount: order.totalAmount.toFixed(2),
        cancellationDate: new Date().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        frontendUrl: this.frontendUrl
      };

      const htmlContent = await this.loadTemplate('orderCancellation', templateData);

      await this.sendEmail(
        user.email,
        `Annulation de votre commande #${order._id} - Marché Frais Fermier`,
        htmlContent
      );

      logger.info(`Order cancellation email sent to ${user.email} for order ${order._id}`);
    } catch (error) {
      logger.error(`Failed to send order cancellation email to ${user.email}: ${error.message}`);
      throw error;
    }
  }
}

export default new EmailService();
