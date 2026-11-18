import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'
import { env } from '../config/env'
import { v2 as cloudinary } from 'cloudinary'

export interface StorageProvider {
  save(buffer: Buffer, storedName: string, mimeType?: string): Promise<string>
  getStream(storagePath: string): NodeJS.ReadableStream | null
  delete(storagePath: string): Promise<void>
  getUrl?(storagePath: string): string
}

class LocalStorageProvider implements StorageProvider {
  private baseDir: string
  constructor() {
    this.baseDir = path.resolve(process.cwd(), env.UPLOAD_DIR)
    if (!fs.existsSync(this.baseDir)) fs.mkdirSync(this.baseDir, { recursive: true })
  }
  async save(buffer: Buffer, storedName: string): Promise<string> {
    const filePath = path.join(this.baseDir, storedName)
    await fs.promises.writeFile(filePath, buffer)
    return storedName
  }
  getStream(storagePath: string): NodeJS.ReadableStream | null {
    const filePath = path.join(this.baseDir, storagePath)
    if (!fs.existsSync(filePath)) return null
    return fs.createReadStream(filePath)
  }
  async delete(storagePath: string): Promise<void> {
    const filePath = path.join(this.baseDir, storagePath)
    if (fs.existsSync(filePath)) await fs.promises.unlink(filePath)
  }
  getUrl(storagePath: string): string {
    return `/uploads/${storagePath}`
  }
}

class CloudinaryStorageProvider implements StorageProvider {
  constructor() {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    })
  }
  private resourceType(mime?: string): 'image' | 'raw' {
    if (mime && mime.startsWith('image/')) return 'image'
    return 'raw'
  }
  private parse(storagePath: string): { rt: 'image' | 'raw'; publicId: string } {
    const idx = storagePath.indexOf(':')
    if (idx > 0) {
      return { rt: storagePath.slice(0, idx) as 'image' | 'raw', publicId: storagePath.slice(idx + 1) }
    }
    return { rt: 'raw', publicId: storagePath }
  }
  async save(buffer: Buffer, storedName: string, mimeType?: string): Promise<string> {
    const rt = this.resourceType(mimeType)
    const dataUri = `data:${mimeType || 'application/octet-stream'};base64,${buffer.toString('base64')}`
    const res = await cloudinary.uploader.upload(dataUri, {
      resource_type: rt,
      public_id: storedName,
      overwrite: true,
      use_filename: false,
      unique_filename: false,
    })
    return `${rt}:${res.public_id}`
  }
  getStream(storagePath: string): NodeJS.ReadableStream | null {
    const { rt, publicId } = this.parse(storagePath)
    const url = cloudinary.url(publicId, { resource_type: rt, secure: true })
    const client = url.startsWith('https') ? https : http
    let stream: NodeJS.ReadableStream | null = null
    // synchronous return impossible; fetch lazily via a readable wrapper
    const { Readable } = require('stream')
    const readable = new Readable({ read() {} })
    client.get(url, (res) => {
      res.on('data', (c) => readable.push(c))
      res.on('end', () => readable.push(null))
      res.on('error', (e) => readable.destroy(e))
    }).on('error', (e) => readable.destroy(e))
    return readable
  }
  async delete(storagePath: string): Promise<void> {
    const { rt, publicId } = this.parse(storagePath)
    await cloudinary.uploader.destroy(publicId, { resource_type: rt })
  }
  getUrl(storagePath: string): string {
    const { rt, publicId } = this.parse(storagePath)
    return cloudinary.url(publicId, { resource_type: rt, secure: true })
  }
}

export function getStorage(): StorageProvider {
  if (env.STORAGE_PROVIDER === 'cloudinary') return new CloudinaryStorageProvider()
  return new LocalStorageProvider()
}

export const storage = getStorage()