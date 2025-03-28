import User from './models/schemas/User.schema'
import { Request } from 'express'
interface AuthRequest extends Request {
  userId?: string
  user?: User
}

export type SuccessResponse<T> = {
  message: string
  data: T
}

export type ErrorResponse = {
  code: number
  message: string
  errors?: {
    path: string
    message: string
  }[]
}

export type Response<T> = SuccessResponse<T> | ErrorResponse
