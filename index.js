const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 5000;

// Middleware setup
app.use(express.json({ limit: '25mb' })); // For handling JSON payloads
app.use(express.urlencoded({ limit: '25mb', extended: true })); // For handling URL-encoded data
app.use(cookieParser()); // For parsing cookies

// CORS setup (allowing requests from a specific origin and enabling credentials)
app.use(cors({
  origin: 'http://localhost:5173', // No trailing slash here
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"], 
}));

//image upload
const uploadImage = require("./src/utils/uploadImage")

// All routes
const authRoutes = require('./src/users/user.route');
const productRoutes = require('./src/products/products.route');
const reviewRoutes = require('./src/reviews/reviews.router');
const orderRoutes = require('./src/orders/orders.route');
const statsRoutes = require('./src/stats/stats.route');


app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes)
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stats', statsRoutes)

// MongoDB connection
main().then(() => console.log('MongoDB is successfully connected')).catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.DB_URL);
  // Example home route
  app.get('/', (req, res) => {
    res.send('Hello World!');
  });
}

app.post("/uploadImage", (req, res) => {
  uploadImage(req.body.image).then((url) => res.send(url)).catch((err) => res.status(500).send(err));
})

// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
