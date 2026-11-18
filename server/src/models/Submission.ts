import mongoose, { Schema, Document } from 'mongoose'

export interface ISubmission extends Document {
  senderName?: string
  description?: string
  files: mongoose.Types.ObjectId[]
  ipHash?: string
  createdAt: Date
  updatedAt: Date
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    senderName: { type: String, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 1000 },
    files: [{ type: Schema.Types.ObjectId, ref: 'File' }],
    ipHash: { type: String },
  },
  { timestamps: true }
)

SubmissionSchema.index({ createdAt: -1 })

export const Submission = mongoose.model<ISubmission>('Submission', SubmissionSchema)