import { env } from '../config/env'

const ALLOWED_MIME = new Set([
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
])

const EXT_BY_MIME: Record<string, string[]> = {
  'text/plain': ['.txt'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
}

export function isAllowedMime(mime: string): boolean {
  return ALLOWED_MIME.has(mime)
}

export function detectMimeFromBuffer(buf: Buffer): string | null {
  if (buf.length < 4) return null
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png'
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  // GIF
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif'
  // WEBP: RIFF....WEBP
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && buf.length >= 12) {
    if (buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp'
  }
  // Text: check printable
  const sample = buf.slice(0, Math.min(buf.length, 1024))
  let textLike = true
  for (let i = 0; i < sample.length; i++) {
    const b = sample[i]
    if (b === 0) { textLike = false; break }
    if (b < 9 || (b > 13 && b < 32)) { textLike = false; break }
  }
  if (textLike) return 'text/plain'
  return null
}

export function validateFile(buffer: Buffer, clientMime: string, originalName: string): { ok: boolean; mime: string; fileType: 'text' | 'image'; error?: string } {
  const detected = detectMimeFromBuffer(buffer)
  if (!detected) return { ok: false, mime: '', fileType: 'text', error: 'Unrecognized file type' }
  if (!isAllowedMime(detected)) return { ok: false, mime: detected, fileType: 'text', error: 'File type not allowed' }
  // Cross-check client mime loosely
  if (clientMime && clientMime !== detected && !(clientMime === 'image/jpg' && detected === 'image/jpeg')) {
    // allow mismatch only if detected is authoritative; but reject obviously wrong
    // We trust detected; just warn not error. Keep detected.
  }
  const fileType = detected.startsWith('image/') ? 'image' : 'text'
  if (buffer.length > env.MAX_FILE_SIZE) return { ok: false, mime: detected, fileType, error: 'File too large' }
  return { ok: true, mime: detected, fileType }
}

export function safeStoredName(ext: string): string {
  const { v4: uuidv4 } = require('uuid')
  return uuidv4() + ext
}

export function extFromMime(mime: string): string {
  switch (mime) {
    case 'image/png': return '.png'
    case 'image/jpeg': return '.jpg'
    case 'image/webp': return '.webp'
    case 'image/gif': return '.gif'
    default: return '.txt'
  }
}