// CREATED BY THE GREAT MR SMILE 
// CONTACT 254107065646 FOR MORE SCRIPTS 
//DO NOT BUY OR SELL THIS SCRIPT 
//DEVELOPER © mr smile tech

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 4000;
const JWT_SECRET = 'your_jwt_secret_here'; // change this

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/phone_tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schemas
const UserSchema = new mongoose.Schema({
  phone: { type: String, unique: true },
  email: { type: String, unique: true },
  passwordHash: String,
});

const LocationSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  lat: Number,
  lng: Number,
  timestamp: Date,
});

const User = mongoose.model('User', UserSchema);
const Location = mongoose.model('Location', LocationSchema);

// Register
app.post('/api/register', async (req, res) => {
  const { phone, email, password } = req.body;
  if (!phone || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  try {
    const user = new User({ phone, email, passwordHash });
    await user.save();
    res.json({ message: 'User registered' });
  } catch (e) {
    res.status(400).json({ error: 'User exists or other error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone });
  if (!user) return res.status(400).json({ error: 'User not found' });
  
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return res.status(400).json({ error: 'Invalid password' });
  
  const token = jwt.sign({ userId: user._id }, JWT_SECRET);
  res.json({ token });
});

// Auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Save location
app.post('/api/location', authMiddleware, async (req, res) => {
  const { lat, lng } = req.body;
  if (typeof lat !== 'number' || typeof lng !== 'number')
    return res.status(400).json({ error: 'Invalid location' });

  const location = new Location({
    userId: req.userId,
    lat,
    lng,
    timestamp: new Date(),
  });
  await location.save();
  res.json({ message: 'Location saved' });
});

// Get last location by phone
app.get('/api/location/:phone', async (req, res) => {
  const { phone } = req.params;
  const user = await User.findOne({ phone });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const lastLoc = await Location.findOne({ userId: user._id }).sort({ timestamp: -1 });
  if (!lastLoc) return res.status(404).json({ error: 'No location data' });

  res.json({
    lat: lastLoc.lat,
    lng: lastLoc.lng,
    timestamp: lastLoc.timestamp,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
