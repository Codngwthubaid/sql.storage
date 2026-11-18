import { Router } from 'express'
import { login, logout, me } from '../controllers/authController'
import { loginLimiter } from '../middleware/rateLimiter'

const router = Router()
router.post('/login', loginLimiter, login)
router.post('/logout', logout)
router.get('/me', me)
export default router