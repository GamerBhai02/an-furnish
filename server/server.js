require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Category = require('./models/Category');
const Product = require('./models/Product');
const DesignRequest = require('./models/DesignRequest');
const User = require('./models/User');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-change-this';

app.use(cors());
app.use(express.json());

// --- MongoDB Connection for Serverless ---
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI environment variable");
    return;
  }

  try {
    // Prepare mongoose options for serverless
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // Fail fast if no connection
    });
    isConnected = true;
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    throw err; // Let the request fail if DB is down
  }
};

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// --- Middleware: Verify JWT Token ---
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- Auth Routes ---

app.post('/api/auth/setup', async (req, res) => {
  try {
    // Allow creation if no users exist
    const count = await User.countDocuments();
    if (count > 0) {
      return res.status(403).json({ error: 'Admin already exists' });
    }

    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({ username, passwordHash });
    await user.save();
    
    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (err) {
    console.error('Setup Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Public Routes ---

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) res.json(product);
    else res.status(404).json({ message: 'Not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const now = new Date();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `AN-${now.getFullYear()}-${randomSuffix}`;
    
    const order = new DesignRequest({ ...req.body, orderId });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/track/:orderId', async (req, res) => {
  try {
    const order = await DesignRequest.findOne({ orderId: req.params.orderId });
    if (order) res.json(order);
    else res.status(404).json({ message: 'Order not found' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Protected Routes (Admin Only) ---

app.post('/api/categories', authenticate, async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', authenticate, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', authenticate, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', authenticate, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', authenticate, async (req, res) => {
  try {
    const orders = await DesignRequest.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', authenticate, async (req, res) => {
  try {
    const { status, note } = req.body;
    const update = { status };
    if (note) {
      update.$push = { notes: `${new Date().toLocaleString()}: ${note}` };
    }
    
    const order = await DesignRequest.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health Check
app.get('/api', (req, res) => {
  res.send(`AN Furnish API Running. DB Connected: ${isConnected}`);
});

// Export for Vercel
module.exports = app;

// Local Dev Support
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}