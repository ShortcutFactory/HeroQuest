// --- FINAL server.js ---
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 
const cors = require('cors');

const app = express();

// --- More Robust CORS Configuration ---
// This explicitly lists the domains that are allowed to make requests.
const allowedOrigins = [
    'https://shortcutfactory.github.io', 
    'https://shadowquest.shop'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from the allowed origins
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());

// --- New Test Endpoint ---
// You can now visit https://heroquest-2wvl.onrender.com/ to see if the server is live.
app.get('/', (req, res) => {
  res.send('HeroQuest Server is live and running!');
});


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
      // --- CORRECTED URLs ---
      // This now correctly redirects users back to your live domain.
      success_url: `https://shadowquest.shop/?payment=success`, 
      cancel_url: `https://shadowquest.shop/?payment=cancelled`, 
    });
    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe API Error:', error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
