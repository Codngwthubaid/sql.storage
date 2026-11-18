import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { Admin } from '../models/Admin'
import { HttpError } from '../middleware/errorHandler'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body || {}
  if (!username || !password) throw new HttpError(400, 'Username and password required')
  const admin = await Admin.findOne({ username: String(username).toLowerCase().trim() })
  if (!admin) throw new HttpError(401, 'Invalid credentials')
  const ok = await bcrypt.compare(String(password), admin.passwordHash)
  if (!ok) throw new HttpError(401, 'Invalid credentials')
  const token = jwt.sign({ id: admin._id.toString(), username: admin.username }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any })
  res.cookie('token', token, COOKIE_OPTS)
  res.json({ success: true, data: { username: admin.username } })
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('token', { path: '/' })
  res.json({ success: true })
}

export async function me(req: Request, res: Response) {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' })
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { id: string; username: string }
    res.json({ success: true, data: { id: payload.id, username: payload.username } })
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' })
  }
}