import bcrypt from 'bcryptjs'
import { Admin } from '../models/Admin'
import { env } from '../config/env'

export async function seedAdmin() {
  if (!env.ADMIN_PASSWORD) return
  const username = env.ADMIN_USERNAME.toLowerCase().trim()
  const existing = await Admin.findOne({ username })
  if (existing) return
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12)
  await Admin.create({ username, passwordHash })
  console.log(`Seeded admin user: ${username}`)
}