import { Router } from 'express'
import { uploadFiles, getSubmissionStatus } from '../controllers/uploadController'
import { uploadMiddleware } from '../middleware/upload'
import { uploadLimiter } from '../middleware/rateLimiter'

const router = Router()
router.post('/', uploadLimiter, uploadMiddleware, uploadFiles)
router.get('/:id/status', getSubmissionStatus)
export default router