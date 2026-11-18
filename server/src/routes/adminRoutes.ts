import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { dashboardStats, listSubmissions, listFiles, getFile, downloadFile, deleteFile, bulkDelete } from '../controllers/adminController'

const router = Router()
router.use(requireAuth)
router.get('/dashboard/stats', dashboardStats)
router.get('/submissions', listSubmissions)
router.get('/files', listFiles)
router.get('/files/:id', getFile)
router.get('/files/:id/download', downloadFile)
router.delete('/files/:id', deleteFile)
router.delete('/files/bulk', bulkDelete)
export default router