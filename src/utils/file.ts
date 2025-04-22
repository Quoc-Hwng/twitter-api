import { Request } from 'express'
import formidable, { File } from 'formidable'
import path from 'path'
import fs from 'fs'
import { UPLOAD_IMAGE_DIR, UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir'
import { ValidationError } from './errors'
import { USERS_MESSAGES } from '~/constants/messages'

export const initFolder = () => {
  ;[UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true // mục đích là để tạo folder nested
      })
    }
  })
}

export const handleUploadImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.resolve(UPLOAD_IMAGE_DIR),
    maxFiles: 1,
    keepExtensions: true,
    maxFileSize: 300 * 1024,
    maxTotalFileSize: 300 * 1024 * 4,
    filter: function ({ name, originalFilename, mimetype }) {
      console.log('filter', { name, originalFilename, mimetype })
      const valid = name === 'image' && Boolean(mimetype?.startsWith('image/'))
      console.log('valid', valid)
      return valid
    }
  })
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(
          new ValidationError(USERS_MESSAGES.VALIDATION_FAILED, [{ path: 'Invalid file upload', message: err.message }])
        )
      }
      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        return reject(
          new ValidationError(USERS_MESSAGES.VALIDATION_FAILED, [
            { path: 'File', message: 'Missing image field or invalid file type' }
          ])
        )
      }
      resolve(files.image as File[])
    })
  })
}
