import { getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import { Request } from 'express'
import sharp from 'sharp'
import { MediaType } from '~/constants/enum'
import path from 'path'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { environment, isProduction } from '~/config/env.config'
import { Media } from '~/models/schemas/Tweet.schema'

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newFullFilename = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFilename)
        await sharp(file.filepath).jpeg().toFile(newPath)
        // return {
        //   url: file.filepath,
        //   type: MediaType.Image
        // }
        return {
          url: isProduction
            ? `${environment.APP_HOST}/static/image/${newFullFilename}`
            : `http://localhost:${environment.APP_HOST}/static/image/${newFullFilename}`,
          type: MediaType.Image
        }
      })
    )
    return result
  }
  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        // const s3Result = await uploadFileToS3({
        //   filename: 'videos/' + file.newFilename,
        //   contentType: mime.getType(file.filepath) as string,
        //   filepath: file.filepath
        // })
        // fsPromise.unlink(file.filepath)
        // return {
        //   url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
        //   type: MediaType.Video
        // }
        return {
          url: isProduction
            ? `${environment.APP_HOST}/static/video/${file.newFilename}`
            : `http://localhost:${environment.APP_PORT}/static/video/${file.newFilename}`,
          type: MediaType.Video
        }
      })
    )
    return result
  }
}

const mediasService = new MediasService()

export default mediasService
