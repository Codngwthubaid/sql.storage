export interface FileItem {
  _id: string
  originalName: string
  storedName: string
  mimeType: string
  fileType: 'text' | 'image'
  fileSize: number
  storagePath: string
  submissionId: any
  createdAt: string
}

export interface Submission {
  _id: string
  senderName?: string
  description?: string
  files: FileItem[]
  createdAt: string
}