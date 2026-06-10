const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const config = require('./config/env');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const adminRoutes = require('./routes/adminRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const addressRoutes = require('./routes/addressRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const configRoutes = require('./routes/configRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const promotionRoutes = require('./routes/promotionRoutes');

const errorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/AppError');
const passport = require('passport');
require('./config/passport');

const app = express();

// Trust reverse proxies (Nginx, Vercel, Cloudflare) for accurate rate limiting
app.set('trust proxy', 1);

const isProduction = config.NODE_ENV === 'production';

// Initialize Passport
app.use(passport.initialize());

// H6: Security middleware with proper CSP (not disabled)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://images.unsplash.com", "https://picsum.photos"],
      connectSrc: ["'self'", "https://api.razorpay.com", config.FRONTEND_URL].filter(Boolean),
      frameSrc: ["'self'", "https://api.razorpay.com"],
    },
  },
}));

// M2: Tighten CORS — no wildcard regex in production
const allowedOrigins = isProduction
  ? [config.FRONTEND_URL].filter(Boolean)
  : [
      config.FRONTEND_URL,
      'https://southzone-new.vercel.app',
    ].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Allow local network IP testing in development
    if (!isProduction) {
      const localNetworkRegex = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/;
      if (localNetworkRegex.test(origin)) {
        return callback(null, true);
      }
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Cookie parser for refresh tokens
app.use(cookieParser());

// Compression
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// M8: Request logging — enabled in ALL environments with custom local timestamps
morgan.token('timestamp', () => {
  return `[${new Date().toLocaleString()}]`;
});

if (isProduction) {
  app.use(morgan(':timestamp :remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));
} else {
  app.use(morgan(':timestamp :method :url :status :response-time ms - :res[content-length]'));
}

const path = require('path');

// C3: Global rate limiting — always ON in production, configurable in dev
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
if (isProduction || process.env.RATE_LIMIT === 'ON') {
  app.use('/api', limiter);
}

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Disable caching for dynamic API routes to prevent stale client state
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/config', configRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/promotions', promotionRoutes);

// M6: Health check with DB/Redis readiness
app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: config.NODE_ENV,
  };

  try {
    const sequelize = require('./config/database');
    await sequelize.authenticate();
    health.database = 'connected';
  } catch (err) {
    health.database = 'disconnected';
    health.status = 'DEGRADED';
  }

  try {
    const { isRedisReady } = require('./config/redis');
    health.redis = isRedisReady() ? 'connected' : 'disconnected';
  } catch (err) {
    health.redis = 'unavailable';
  }

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;