import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  MAX_FILES_PER_SUBMISSION: parseInt(process.env.MAX_FILES_PER_SUBMISSION || '10', 10),
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
}

export function validateEnv() {
  if (!env.MONGODB_URI) throw new Error('MONGODB_URI is required')
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 16) throw new Error('JWT_SECRET must be at least 16 chars')
  if (!env.ADMIN_PASSWORD) console.warn('ADMIN_PASSWORD not set; admin seed may be skipped')
}