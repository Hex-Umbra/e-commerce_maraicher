import sgMail from '@sendgrid/mail';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@ecommerce-maraicher.com';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
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
      const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;
      
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
}

export default new EmailService();
