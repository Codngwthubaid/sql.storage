import mongoose, { Schema, Document } from 'mongoose'

export type FileType = 'text' | 'image'

export interface IFile extends Document {
  originalName: string
  storedName: string
  mimeType: string
  fileType: FileType
  fileSize: number
  storagePath: string
  submissionId: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const FileSchema = new Schema<IFile>(
  {
    originalName: { type: String, required: true },
    storedName: { type: String, required: true, unique: true },
    mimeType: { type: String, required: true },
    fileType: { type: String, enum: ['text', 'image'], required: true },
    fileSize: { type: Number, required: true },
    storagePath: { type: String, required: true },
    submissionId: { type: Schema.Types.ObjectId, ref: 'Submission', required: true, index: true },
  },
  { timestamps: true }
)

FileSchema.index({ fileType: 1, createdAt: -1 })
FileSchema.index({ originalName: 'text' })

export const FileModel = mongoose.model<IFile>('File', FileSchema)