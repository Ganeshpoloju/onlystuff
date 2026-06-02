require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('./jobs/cron');

const { initSocket } = require('./config/socket');
require('./config/passport');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const communityRoutes = require('./routes/communities');
const listingRoutes = require('./routes/listings');
const orderRoutes = require('./routes/orders');
const bookingRoutes = require('./routes/bookings');
const groupBuyRoutes = require('./routes/groupBuys');
const chatRoutes = require('./routes/chat');
const deliveryRoutes = require('./routes/delivery');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

initSocket(server);

app.use(helmet());
app.use(cors({
  origin: [process.env.CLIENT_URL, process.env.LANDING_URL],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/communities', communityRoutes);
app.use('/listings', listingRoutes);
app.use('/orders', orderRoutes);
app.use('/bookings', bookingRoutes);
app.use('/group-buys', groupBuyRoutes);
app.use('/chat', chatRoutes);
app.use('/delivery', deliveryRoutes);
app.use('/admin', adminRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`onlyStuff API running on port ${PORT}`));
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Run: npx kill-port ${PORT}`);
    process.exit(1);
  } else {
    throw err;
  }
});
