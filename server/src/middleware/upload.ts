import multer from 'multer'
import { env } from '../config/env'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_FILE_SIZE,
    files: env.MAX_FILES_PER_SUBMISSION,
  },
})

export const uploadMiddleware = upload.array('files', env.MAX_FILES_PER_SUBMISSION)