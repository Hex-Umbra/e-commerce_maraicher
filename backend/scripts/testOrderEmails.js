import 'dotenv/config';
import emailService from '../services/emailService.js';

// Simple logger wrapper
const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
};

function buildMockData(recipientEmail) {
  const user = {
    name: 'Client Test',
    email: recipientEmail,
  };

  const order = {
    _id: 'MOCK-ORDER-123456',
    createdAt: new Date(),
    status: 'En cours',
    totalAmount: 42.5,
    products: [
      {
        productId: {
          _id: 'prod-1',
          name: 'Panier de légumes bio',
          producteurId: { name: 'Ferme du Soleil' },
        },
        quantity: 2,
        price: 10.0,
        status: 'En cours',
      },
      {
        productId: {
          _id: 'prod-2',
          name: 'Fromage fermier',
          producteurId: { name: 'La Fromagerie du Val' },
        },
        quantity: 1,
        price: 22.5,
        status: 'En cours',
      },
    ],
  };

  const updatedProducts = [
    {
      productId: order.products[0].productId,
      quantity: order.products[0].quantity,
      price: order.products[0].price,
      oldStatus: 'En cours',
      status: 'Prêt',
    },
    {
      productId: order.products[1].productId,
      quantity: order.products[1].quantity,
      price: order.products[1].price,
      oldStatus: 'En cours',
      status: 'Livré',
    },
  ];

  return { user, order, updatedProducts };
}

async function main() {
  const recipient = process.env.TEST_EMAIL || 'plicssy64@gmail.com';

  log.info(`Using recipient: ${recipient}`);
  if (!process.env.SENDGRID_API_KEY) {
    log.error('SENDGRID_API_KEY is not set. Please set it in your environment or .env file.');
    process.exit(1);
  }

  const { user, order, updatedProducts } = buildMockData(recipient);

  try {
    log.info('Sending Order Confirmation email...');
    await emailService.sendOrderConfirmation(user, order);
    log.info('Order Confirmation email sent.');

    // Simulate some status changes on the order for the next email
    const orderWithPartialStatus = {
      ...order,
      status: 'Partiellement complète',
    };

    log.info('Sending Order Status Update email...');
    await emailService.sendOrderStatusUpdate(user, orderWithPartialStatus, updatedProducts);
    log.info('Order Status Update email sent.');

    // Simulate cancellation
    const cancelledOrder = {
      ...order,
      status: 'Annulée',
    };

    log.info('Sending Order Cancellation email...');
    await emailService.sendOrderCancellation(user, cancelledOrder);
    log.info('Order Cancellation email sent.');

    log.info('All test emails have been sent. Check the inbox to verify.');
    process.exit(0);
  } catch (err) {
    log.error(`Error during test email sending: ${err.message}`);
    process.exit(1);
  }
}

main();
