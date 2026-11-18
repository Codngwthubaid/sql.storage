import express from 'express'
import 'express-async-errors'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { env, validateEnv } from './config/env'
import { connectDB } from './config/db'
import { errorHandler } from './middleware/errorHandler'
import { apiLimiter } from './middleware/rateLimiter'
import authRoutes from './routes/authRoutes'
import uploadRoutes from './routes/uploadRoutes'
import adminRoutes from './routes/adminRoutes'

validateEnv()

const app = express()

app.use(helmet())
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(apiLimiter)

app.get('/health', (_req, res) => res.json({ success: true, status: 'ok' }))

app.use('/api/admin', authRoutes) // /api/admin/login etc? Wait paths

// Fix routing: auth at /api/admin, uploads at /api/uploads, admin files at /api/admin
app.use('/api/uploads', uploadRoutes)

// remount auth correctly: /api/admin/login, /api/admin/logout, /api/admin/me
// already above under /api/admin? authRoutes defines /login /logout /me -> /api/admin/login OK
// admin dashboard/files need /api/admin prefix too
app.use('/api/admin', adminRoutes)

app.use(errorHandler)

async function start() {
  await connectDB()
  // seed admin
  await seedAdmin()
  app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`))
}

import { seedAdmin } from './utils/seed'
start().catch((e) => { console.error(e); process.exit(1) })

export default app