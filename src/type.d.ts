import User from './models/schemas/User.schema'
declare module 'express' {
  interface Request {
    user?: User
  }
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
