import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import path from 'path'

import { config } from './config/env'
import { generalLimiter } from './middlewares/rateLimiter.middleware'
import { errorMiddleware } from './middlewares/error.middleware'

import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import tournamentRoutes from './routes/tournament.routes'
import paymentRoutes from './routes/payment.routes'
import postRoutes from './routes/post.routes'
import adminRoutes from './routes/admin.routes'
import contactRoutes from './routes/contact.routes'

const app = express()

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

// CORS — allow frontend with credentials
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Cookie parser must come before routes
app.use(cookieParser())

// Razorpay webhook needs raw body — mount BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }))

// Body parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'))
}

// Rate limiting
app.use(generalLimiter)

// Static file serving for uploads
app.use('/uploads', express.static(path.resolve(config.upload.dir)))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: config.nodeEnv })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tournaments', tournamentRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/contact', contactRoutes)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Global error handler
app.use(errorMiddleware)

app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`)
  console.log(`   Environment: ${config.nodeEnv}`)
})

export default app
