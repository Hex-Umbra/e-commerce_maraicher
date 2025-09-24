// Quick test to verify environment variables are loaded correctly
import dotenv from 'dotenv';

dotenv.config();

console.log('Environment variables test:');
console.log('SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
console.log('SENDGRID_API_KEY starts with SG:', process.env.SENDGRID_API_KEY?.startsWith('SG.'));
console.log('SENDGRID_API_KEY length:', process.env.SENDGRID_API_KEY?.length);
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

// Test SendGrid initialization
try {
  const sgMail = (await import('@sendgrid/mail')).default;
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized successfully');
} catch (error) {
  console.log('❌ SendGrid initialization failed:', error.message);
}
