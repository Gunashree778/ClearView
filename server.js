// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
//mongoose.connect('mongodb://localhost:27017/myWebsiteDB', {
mongoose.connect('mongodb+srv://gunashreevil77:T3znUczRDS2FRDbC@project1o.omjnhv3.mongodb.net/myWebSiteDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Multer setup for image uploads with file type validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpg, .jpeg and .png files are allowed'));
  }
};
const upload = multer({ storage, fileFilter });

// User schema & model
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: String,
  password: String,
});
const User = mongoose.model('User', userSchema, 'register');

// Feedback schema & model with rating and imageUrl
const feedbackSchema = new mongoose.Schema({
  username: String,
  product: String,
  brand: String,
  app: String,
  rating: Number,
  opinion: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});
const Feedback = mongoose.model('Feedback', feedbackSchema, 'feedback');

// Contact schema & model
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});
const Contact = mongoose.model('Contact', contactSchema, 'contactMessages');

// Register API
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please fill all required fields.' });
  }
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken.' });
    }
    const user = new User({ username, email, password });
    await user.save();
    res.status(201).json({ message: 'Registration successful.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login API
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Please fill all required fields.' });
  }
  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ message: 'User not found. Please register.' });
    }
    res.status(200).json({ message: 'Login successful.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Feedback API with image upload and rating
app.post('/api/feedback', upload.single('image'), async (req, res) => {
  const { username, product, brand, app, rating, opinion } = req.body;
  if (!username || !product || !brand || !app || !opinion || !rating) {
    return res.status(400).json({ message: 'Please provide all feedback fields including rating.' });
  }

  let imageUrl = null;
  if (req.file) {
    imageUrl = `/uploads/${req.file.filename}`;
  }

  try {
    const feedback = new Feedback({
      username,
      product,
      brand,
      app,
      rating: Number(rating),
      opinion,
      imageUrl,
    });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search API returns feedback with rating and imageUrl
app.get('/api/search', async (req, res) => {
  const { product } = req.query;
  if (!product) {
    return res.status(400).json({ message: 'Please provide product to search.' });
  }
  try {
    const results = await Feedback.find({ product: { $regex: new RegExp(product, 'i') } });
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Contact API
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please fill all required fields.' });
  }
  try {
    const contactMessage = new Contact({ name, email, message });
    await contactMessage.save();
    res.status(201).json({ message: 'Your message has been received. Thank you!' });
  } catch (err) {
    console.error('Contact message save error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));