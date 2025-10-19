// --- FINAL PRODUCTION server.js ---
console.log('---------------------------------');
console.log('Server process starting...');

const express = require('express');
const cors = require('cors');
console.log('Express and CORS modules loaded.');

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error('FATAL ERROR: STRIPE_SECRET_KEY environment variable not found!');
  process.exit(1);
}
console.log('Stripe secret key found.');

const stripe = require('stripe')(stripeSecretKey);
console.log('Stripe module initialized successfully.');

const app = express();

// --- FINAL, MORE PERMISSIVE CORS SETUP ---
// This configuration is very robust and should resolve any network-level interference.
app.use(cors());

app.use(express.json());
console.log('CORS and express.json middleware configured.');

// --- Test Endpoint ---
app.get('/', (req, res) => {
  console.log('GET /: Test endpoint was hit.');
  res.send('HeroQuest Server is live and running! CORS is configured.');
});

app.post('/create-checkout-session', async (req, res) => {
  console.log('POST /create-checkout-session: Endpoint hit.');
  try {
    const { cart } = req.body;
    console.log('Received cart with', cart.length, 'items.');
    const line_items = cart.map(item => ({
      price_data: { currency: 'eur', product_data: { name: item.name }, unit_amount: Math.round(item.price * 100) },
      quantity: item.quantity,
    }));
    console.log('Creating Stripe session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `https://shadowquest.shop/?payment=success`, 
      cancel_url: `https://shadowquest.shop/?payment=cancelled`, 
    });
    console.log('Stripe session created successfully. ID:', session.id);
    res.json({ id: session.id });
  } catch (error) {
    console.error('--- STRIPE API ERROR ---');
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is now listening on port ${PORT}`);
  console.log('Application started successfully!');
  console.log('---------------------------------');
});
