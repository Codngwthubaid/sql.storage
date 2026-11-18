import { Request, Response, NextFunction } from 'express'

export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', err?.message || err)
  let status = err?.status || 500
  let message = err?.message || 'Internal server error'
  if (err?.name === 'MulterError') {
    status = 400
    if (err.code === 'LIMIT_FILE_SIZE') message = 'File too large'
    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') message = 'Too many files'
  }
  if (err?.type === 'entity.too.large') {
    status = 413
    message = 'Request entity too large'
  }
  res.status(status).json({ success: false, error: message })
}