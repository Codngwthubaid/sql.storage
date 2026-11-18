import { Request, Response } from 'express'
import crypto from 'crypto'
import { FileModel } from '../models/File'
import { Submission } from '../models/Submission'
import { storage } from '../services/storageService'
import { validateFile, extFromMime, safeStoredName } from '../utils/fileValidation'
import { HttpError } from '../middleware/errorHandler'
import { env } from '../config/env'

export async function uploadFiles(req: Request, res: Response) {
  const files = (req.files as Express.Multer.File[]) || []
  if (!files.length) throw new HttpError(400, 'No files provided')

  const senderName = (req.body?.senderName || '').toString().trim().slice(0, 100)
  const description = (req.body?.description || '').toString().trim().slice(0, 1000)

  const ip = req.ip || req.socket.remoteAddress || ''
  const ipHash = crypto.createHash('sha256').update(ip + (process.env.JWT_SECRET || '')).digest('hex')

  const submission = await Submission.create({
    senderName: senderName || undefined,
    description: description || undefined,
    files: [],
    ipHash,
  })

  const fileDocs: any[] = []
  try {
    for (const f of files) {
      const result = validateFile(f.buffer, f.mimetype, f.originalname)
      if (!result.ok) throw new HttpError(400, result.error || 'Invalid file')
      const ext = extFromMime(result.mime)
      const storedName = safeStoredName(ext)
      const storagePath = await storage.save(f.buffer, storedName, result.mime)
      const doc = await FileModel.create({
        originalName: f.originalname.slice(0, 255),
        storedName,
        mimeType: result.mime,
        fileType: result.fileType,
        fileSize: f.buffer.length,
        storagePath,
        submissionId: submission._id,
      })
      fileDocs.push(doc)
    }
    submission.files = fileDocs.map((d) => d._id) as any
    await submission.save()
  } catch (e) {
    // cleanup
    for (const d of fileDocs) {
      await storage.delete(d.storagePath).catch(() => {})
      await FileModel.deleteOne({ _id: d._id }).catch(() => {})
    }
    await Submission.deleteOne({ _id: submission._id }).catch(() => {})
    throw e
  }

  res.status(201).json({
    success: true,
    data: {
      submissionId: submission._id,
      fileCount: fileDocs.length,
    },
  })
}

export async function getSubmissionStatus(req: Request, res: Response) {
  const { id } = req.params
  const sub = await Submission.findById(id).populate('files')
  if (!sub) throw new HttpError(404, 'Submission not found')
  res.json({ success: true, data: sub })
}