import { Request, Response } from 'express'
import { FileModel } from '../models/File'
import { Submission } from '../models/Submission'
import { storage } from '../services/storageService'
import { HttpError } from '../middleware/errorHandler'
import { AuthRequest } from '../middleware/auth'
import mongoose from 'mongoose'

export async function dashboardStats(_req: Request, res: Response) {
  const [totalSubmissions, totalFiles, images, texts] = await Promise.all([
    Submission.countDocuments(),
    FileModel.countDocuments(),
    FileModel.countDocuments({ fileType: 'image' }),
    FileModel.countDocuments({ fileType: 'text' }),
  ])
  const agg = await FileModel.aggregate([{ $group: { _id: null, total: { $sum: '$fileSize' } } }])
  const storageUsed = agg[0]?.total || 0
  const recent = await Submission.find().sort({ createdAt: -1 }).limit(5).populate('files')
  res.json({
    success: true,
    data: { totalSubmissions, totalFiles, images, texts, storageUsed, recent },
  })
}

export async function listSubmissions(req: Request, res: Response) {
  const page = Math.max(1, parseInt((req.query.page as string) || '1', 10))
  const limit = Math.min(50, parseInt((req.query.limit as string) || '20', 10))
  const search = (req.query.search as string) || ''
  const sort = (req.query.sort as string) === 'oldest' ? 1 : -1
  const filter: any = {}
  if (search) {
    filter.$or = [
      { senderName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ]
  }
  const [items, total] = await Promise.all([
    Submission.find(filter).sort({ createdAt: sort }).skip((page - 1) * limit).limit(limit).populate('files'),
    Submission.countDocuments(filter),
  ])
  res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) } })
}

export async function listFiles(req: Request, res: Response) {
  const page = Math.max(1, parseInt((req.query.page as string) || '1', 10))
  const limit = Math.min(50, parseInt((req.query.limit as string) || '20', 10))
  const search = (req.query.search as string) || ''
  const type = (req.query.type as string) || ''
  const sort = (req.query.sort as string) === 'oldest' ? 1 : -1
  const filter: any = {}
  if (search) filter.originalName = { $regex: search, $options: 'i' }
  if (type && type !== 'all') filter.fileType = type
  // date filter
  const from = req.query.from as string
  const to = req.query.to as string
  if (from || to) {
    filter.createdAt = {}
    if (from) filter.createdAt.$gte = new Date(from)
    if (to) filter.createdAt.$lte = new Date(to)
  }
  const [items, total] = await Promise.all([
    FileModel.find(filter).sort({ createdAt: sort }).skip((page - 1) * limit).limit(limit).populate('submissionId'),
    FileModel.countDocuments(filter),
  ])
  res.json({ success: true, data: { items, total, page, pages: Math.ceil(total / limit) } })
}

export async function getFile(req: Request, res: Response) {
  const { id } = req.params
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid id')
  const file = await FileModel.findById(id).populate('submissionId')
  if (!file) throw new HttpError(404, 'File not found')
  // read text content if txt
  let content: string | null = null
  if (file.fileType === 'text') {
    const stream = storage.getStream(file.storagePath)
    if (stream) {
      const chunks: Buffer[] = []
      for await (const c of stream) chunks.push(Buffer.from(c))
      content = Buffer.concat(chunks).toString('utf8')
    }
  }
  res.json({ success: true, data: { file, content } })
}

export async function downloadFile(req: Request, res: Response) {
  const { id } = req.params
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid id')
  const file = await FileModel.findById(id)
  if (!file) throw new HttpError(404, 'File not found')
  const stream = storage.getStream(file.storagePath)
  if (!stream) throw new HttpError(404, 'File data missing')
  res.setHeader('Content-Type', file.mimeType)
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`)
  stream.pipe(res)
}

export async function deleteFile(req: Request, res: Response) {
  const { id } = req.params
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid id')
  const file = await FileModel.findById(id)
  if (!file) throw new HttpError(404, 'File not found')
  await storage.delete(file.storagePath)
  await FileModel.deleteOne({ _id: id })
  // remove ref from submission
  await Submission.updateOne({ _id: file.submissionId }, { $pull: { files: file._id } })
  res.json({ success: true })
}

export async function bulkDelete(req: Request, res: Response) {
  const ids: string[] = req.body?.ids || []
  if (!Array.isArray(ids) || !ids.length) throw new HttpError(400, 'ids required')
  const files = await FileModel.find({ _id: { $in: ids } })
  for (const f of files) {
    await storage.delete(f.storagePath)
  }
  await FileModel.deleteMany({ _id: { $in: ids } })
  // update submissions
  await Submission.updateMany({}, { $pull: { files: { $in: ids.map((i) => new mongoose.Types.ObjectId(i)) } } })
  res.json({ success: true, data: { deleted: files.length } })
}