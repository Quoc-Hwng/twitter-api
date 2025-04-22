import { handleUploadImage } from '~/utils/file'
import { Request } from 'express'
class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result = files.map((file) => {
      return {
        url: file.filepath,
        name: file.originalFilename,
        type: file.mimetype,
        size: file.size
      }
    })
    return result
  }
}

const mediasService = new MediasService()

export default mediasService
