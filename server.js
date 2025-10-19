// --- Paste this code into server.js ---
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 
const path = require('path');
const cors = require('cors');

const app = express();

// Allow your GitHub Pages site to talk to this server
app.use(cors({ origin: ['https://shortcutfactory.github.io', 'https://shadowquest.shop'] }));
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { cart } = req.body;
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ error: 'Cart is empty or invalid.' });
    }
    const line_items = cart.map(item => ({
      price_data: { currency: 'eur', product_data: { name: item.name }, unit_amount: Math.round(item.price * 100) },
      quantity: item.quantity,
    }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      // Make sure this URL is correct for your GitHub pages site
      success_url: `https://shortcutfactory.github.io/HeroQuest/?payment=success`, 
      cancel_url: `https://shortcutfactory.github.io/HeroQuest/?payment=cancelled`, 
    });
    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe API Error:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
