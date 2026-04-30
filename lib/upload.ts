import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880', 10)
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

export async function saveUploadedFile(
  formData: FormData,
  fieldName = 'image'
): Promise<string | null> {
  const file = formData.get(fieldName) as File | null
  if (!file || file.size === 0) return null

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 5MB limit')
  }

  const ext = path.extname(file.name).toLowerCase() || '.jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
  const filepath = path.join(UPLOAD_DIR, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  fs.writeFileSync(filepath, buffer)

  return `/uploads/${filename}`
}
