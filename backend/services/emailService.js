import nodemailer from "nodemailer"; // Changed import
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "./logger.js";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
  constructor({
    fromEmail,
    frontendUrl,
    backendUrl,
    supportEmail,
  } = {}) {
    // For Gmail, the 'from' email usually needs to be the same as the authenticated user
    this.fromEmail = fromEmail || process.env.SMTP_EMAIL || process.env.FROM_EMAIL;
    logger.info(`FROM_EMAIL is set to: ${this.fromEmail}`);
    
    this.frontendUrl = frontendUrl || process.env.FRONTEND_URL || "http://localhost:5173";
    this.backendUrl = backendUrl || process.env.BACKEND_URL || "http://localhost:3000";
    this.supportEmail = supportEmail || process.env.SUPPORT_EMAIL || this.fromEmail;
    
    this.isInitialized = false;
    this.transporter = null; // Replaced 'this.mailersend' with 'this.transporter'
  }

  // Lazy initialization for Nodemailer Transporter
  initializeTransporter() {
    if (!this.isInitialized) {
      const user = process.env.SMTP_EMAIL;
      const pass = process.env.SMTP_PASSWORD;

      if (!user || !pass) {
        throw new Error(
          "SMTP_EMAIL or SMTP_PASSWORD environment variables are not set"
        );
      }

      // Create the Gmail transporter
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: user,
          pass: pass, // This must be the 16-char App Password, not your login password
        },
      });

      this.isInitialized = true;
      logger.info("Nodemailer transporter initialized successfully");
    }
  }

  // Load and compile email template (Unchanged)
  async loadTemplate(templateName, data) {
    try {
      const templatePath = path.join(
        __dirname,
        "..",
        "templates",
        `${templateName}.hbs`
      );
      const templateSource = fs.readFileSync(templatePath, "utf8");
      const template = handlebars.compile(templateSource);
      return template(data);
    } catch (error) {
      logger.error(
        `Error loading email template ${templateName}: ${error.message}`
      );
      throw new Error(`Failed to load email template: ${templateName}`);
    }
  }

  // Send email using Nodemailer (Refactored)
  async sendEmail(to, subject, htmlContent, textContent = null) {
    try {
      this.initializeTransporter(); 

      // Define email options
      const mailOptions = {
        from: `"Marché Frais Fermier" <${this.fromEmail}>`, // Pretty format: Name <email>
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent || htmlContent.replace(/<[^>]*>/g, ""), // Fallback text
        replyTo: this.fromEmail,
        encoding: 'utf-8',
        textEncoding: 'base64',
      };

      // Send the email
      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email sent successfully to ${to} with subject: ${subject}`);
      return result;
    } catch (error) {
      logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  // --- All methods below remain EXACTLY the same logic, they just call sendEmail ---

  // Send email verification email
  async sendEmailVerification(user, token) {
    try {
      const backendUrl = this.backendUrl;
      const verificationUrl = `${backendUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(
        user.email
      )}`;

      const templateData = {
        userName: user.name,
        verificationUrl,
        frontendUrl: this.frontendUrl,
      };

      const htmlContent = await this.loadTemplate(
        "emailVerification",
        templateData
      );

      await this.sendEmail(
        user.email,
        "Vérifiez votre adresse email - Marché Frais Fermier",
        htmlContent
      );

      logger.info(
        `Email verification sent to ${user.email} for user ${user.name}`
      );
    } catch (error) {
      logger.error(
        `Failed to send verification email to ${user.email}: ${error.message}`
      );
      throw error;
    }
  }

  // Resend email verification
  async resendEmailVerification(user) {
    try {
      const token = user.generateEmailVerificationToken();
      await user.save();
      await this.sendEmailVerification(user, token);
      logger.info(`Email verification resent to ${user.email}`);
    } catch (error) {
      logger.error(
        `Failed to resend verification email to ${user.email}: ${error.message}`
      );
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
        orderDate: order.createdAt.toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        products: order.products.map((product) => ({
          name: product.productId.name,
          quantity: product.quantity,
          price: product.price,
          total: (product.price * product.quantity).toFixed(2),
          status: product.status,
        })),
        totalAmount: order.totalAmount.toFixed(2),
        orderStatus: order.status,
        frontendUrl: this.frontendUrl,
      };

      const htmlContent = await this.loadTemplate(
        "orderConfirmation",
        templateData
      );

      await this.sendEmail(
        user.email,
        `Confirmation de commande #${order._id} - Marché Frais Fermier`,
        htmlContent
      );

      logger.info(
        `Order confirmation email sent to ${user.email} for order ${order._id}`
      );
    } catch (error) {
      logger.error(
        `Failed to send order confirmation email to ${user.email}: ${error.message}`
      );
      throw error;
    }
  }

  // Send order status update email
  async sendOrderStatusUpdate(user, order, updatedProducts) {
    try {
      const templateData = {
        userName: user.name,
        orderId: order._id,
        orderDate: order.createdAt.toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        updatedProducts: updatedProducts.map((product) => ({
          name: product.productId.name,
          quantity: product.quantity,
          price: product.price,
          oldStatus: product.oldStatus,
          newStatus: product.status,
          producerName: product.productId.producteurId?.name || "Producteur",
        })),
        orderStatus: order.status,
        totalAmount: order.totalAmount.toFixed(2),
        frontendUrl: this.frontendUrl,
      };

      const htmlContent = await this.loadTemplate(
        "orderStatusUpdate",
        templateData
      );

      await this.sendEmail(
        user.email,
        `Mise à jour de votre commande #${order._id} - Marché Frais Fermier`,
        htmlContent
      );

      logger.info(
        `Order status update email sent to ${user.email} for order ${order._id}`
      );
    } catch (error) {
      logger.error(
        `Failed to send order status update email to ${user.email}: ${error.message}`
      );
      throw error;
    }
  }

  // Send order cancellation email
  async sendOrderCancellation(user, order) {
    try {
      const templateData = {
        userName: user.name,
        orderId: order._id,
        orderDate: order.createdAt.toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        products: order.products.map((product) => ({
          name: product.productId.name,
          quantity: product.quantity,
          price: product.price,
          total: (product.price * product.quantity).toFixed(2),
        })),
        totalAmount: order.totalAmount.toFixed(2),
        cancellationDate: new Date().toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        frontendUrl: this.frontendUrl,
      };

      const htmlContent = await this.loadTemplate(
        "orderCancellation",
        templateData
      );

      await this.sendEmail(
        user.email,
        `Annulation de votre commande #${order._id} - Marché Frais Fermier`,
        htmlContent
      );

      logger.info(
        `Order cancellation email sent to ${user.email} for order ${order._id}`
      );
    } catch (error) {
      logger.error(
        `Failed to send order cancellation email to ${user.email}: ${error.message}`
      );
      throw error;
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(user, token) {
    try {
      // The frontend URL should point to your password reset page
      const resetUrl = `${this.frontendUrl}/reset-password/${token}`;

      const templateData = {
        userName: user.name,
        resetUrl,
      };

      const htmlContent = await this.loadTemplate(
        "passwordReset",
        templateData
      );

      await this.sendEmail(
        user.email,
        "Réinitialisation de votre mot de passe - Marché Frais Fermier",
        htmlContent
      );

      logger.info(`Password reset email sent to ${user.email}`);
    } catch (error) {
      logger.error(
        `Failed to send password reset email to ${user.email}: ${error.message}`
      );
      throw error;
    }
  }

  // Send support contact email
  async sendSupportContact(subject, title, message, userEmail, userName = "Utilisateur anonyme", userId = null) {
    try {
      const supportEmail = process.env.SUPPORT_EMAIL || this.fromEmail;
      const templateData = { 
        subject, 
        title, 
        message,
        userEmail: userEmail || "Non fourni",
        userName: userName && userName.trim() ? userName : "Utilisateur anonyme",
        userId: userId || "Non connecté"
      };
      const htmlContent = await this.loadTemplate(
        "supportContact",
        templateData
      );
      const emailSubject = `[Contact] ${subject} - ${title}`;
      await this.sendEmail(supportEmail, emailSubject, htmlContent);
      logger.info(`Support contact email sent to ${supportEmail} from ${userEmail}`);
    } catch (error) {
      logger.error(`Failed to send support contact email: ${error.message}`);
      throw error;
    }
  }
}

export default new EmailService();