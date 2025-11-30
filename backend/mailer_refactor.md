# MailerSend Refactor: Step-by-Step Guide

This document outlines the steps required to replace SendGrid with MailerSend in your project.

### Step 1: Sign up for MailerSend and Obtain API Key

1.  **Go to MailerSend:** Visit [mailersend.com](https://www.mailersend.com/) and sign up for an account.
2.  **Verify your domain:** Follow MailerSend's instructions to verify your sending domain (e.g., `example.com`). This is crucial for sending emails.
3.  **Create an API Token:**
    *   Navigate to "Settings" -> "API Tokens".
    *   Click "Create new token".
    *   Give it a descriptive name (e.g., "Ecommerce Backend").
    *   Ensure it has the necessary permissions to send emails (typically "Send emails" is sufficient).
    *   Copy the generated API token – you will need this for your `.env` file.

### Step 2: Install MailerSend SDK

You'll need to install the official MailerSend Node.js SDK.

1.  **Navigate to your backend directory:**
    ```bash
    cd backend
    ```
2.  **Install the package:**
    ```bash
    npm install mailersend
    ```

### Step 3: Update Environment Variables

You need to replace your SendGrid API key with your MailerSend API token in your `.env` file (located in `backend/.env`).

1.  **Open your `backend/.env` file.**
2.  **Replace (or add) the following:**
    ```dotenv
    # Remove or comment out SENDGRID_API_KEY
    # SENDGRID_API_KEY=YOUR_SENDGRID_API_KEY

    # Add your MailerSend API Token
    MAILERSEND_API_TOKEN=YOUR_MAILERSEND_API_TOKEN
    # Your sending domain, e.g., "mg.yourdomain.com" or just "yourdomain.com"
    MAILERSEND_DOMAIN=your_verified_mailersend_domain.com
    ```
    *Make sure to replace `YOUR_MAILERSEND_API_TOKEN` and `your_verified_mailersend_domain.com` with your actual values.*

### Step 4: Modify `backend/services/emailService.js`

This is where the main code changes will happen to switch from SendGrid to MailerSend.

1.  **Open `backend/services/emailService.js`.**

2.  **Update Imports and Initialization:**
    *   **Remove:**
        ```javascript
        import sgMail from "@sendgrid/mail";
        // ...
        // inside initializeSendGrid()
        sgMail.setApiKey(apiKey);
        ```
    *   **Add/Modify:**
        ```javascript
        import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
        // ...
        class EmailService {
          constructor({
            fromEmail,
            frontendUrl,
            backendUrl,
            supportEmail,
          } = {}) {
            // ... existing constructor code ...
            this.mailersend = null; // Add this line
          }

          // Lazy initialization for MailerSend
          initializeMailerSend() {
            if (!this.isInitialized) {
              const apiToken = process.env.MAILERSEND_API_TOKEN;
              const domain = process.env.MAILERSEND_DOMAIN;

              if (!apiToken) {
                throw new Error("MAILERSEND_API_TOKEN environment variable is not set");
              }
              if (!domain) {
                throw new Error("MAILERSEND_DOMAIN environment variable is not set");
              }

              this.mailersend = new MailerSend({
                apiKey: apiToken,
              });
              this.mailersendDomain = domain; // Store domain for use in Sender
              this.isInitialized = true;
              logger.info("MailerSend initialized successfully");
            }
          }
        }
        ```

3.  **Update the `sendEmail` Method:**
    *   **Replace the content of your existing `sendEmail` method.**
    *   **Old `sendEmail` (content only):**
        ```javascript
        async sendEmail(to, subject, htmlContent, textContent = null) {
          try {
            // Ensure SendGrid is initialized
            this.initializeSendGrid(); // This call will change

            const msg = {
              to,
              from: {
                email: this.fromEmail,
                name: "Marché Frais Fermier",
              },
              subject,
              html: htmlContent,
              text: textContent || htmlContent.replace(/<[^>]*>/g, ""), // Strip HTML for text version
            };

            const result = await sgMail.send(msg); // This call will change
            logger.info(`Email sent successfully to ${to} with subject: ${subject}`);
            return result;
          } catch (error) {
            logger.error(`Failed to send email to ${to}: ${error.message}`);
            throw new Error(`Email sending failed: ${error.message}`);
          }
        }
        ```
    *   **New `sendEmail` (content only):**
        ```javascript
        async sendEmail(to, subject, htmlContent, textContent = null) {
          try {
            this.initializeMailerSend(); // Use MailerSend initialization

            const sender = new Sender(this.fromEmail, "Marché Frais Fermier");
            const recipients = [new Recipient(to)];

            const emailParams = new EmailParams()
              .setFrom(sender)
              .setTo(recipients)
              .setReplyTo(sender) // Optional: set a reply-to address
              .setSubject(subject)
              .setHtml(htmlContent)
              .setText(textContent || htmlContent.replace(/<[^>]*>/g, ""));

            const result = await this.mailersend.email.send(emailParams);
            logger.info(`Email sent successfully to ${to} with subject: ${subject}`);
            return result;
          } catch (error) {
            logger.error(`Failed to send email to ${to}: ${error.message}`);
            throw new Error(`Email sending failed: ${error.message}`);
          }
        }
        ```

### Step 5: Clean Up and Verify

1.  **Remove the old `initializeSendGrid` method:** Delete the entire `initializeSendGrid()` function from the `EmailService` class.
2.  **Rename `initializeSendGrid` calls:** Ensure any code that previously called `this.initializeSendGrid()` (e.g., in `sendEmail`) is updated to call `this.initializeMailerSend()`. (I already included this in Step 4 for `sendEmail`).
3.  **Restart your backend server.**
4.  **Test all email functionalities:**
    *   User registration (email verification).
    *   Password reset (if implemented).
    *   Order confirmation.
    *   Order status updates.
    *   Order cancellation.
    *   Support contact form.
    *   Check your MailerSend dashboard for sent email logs and delivery status.
