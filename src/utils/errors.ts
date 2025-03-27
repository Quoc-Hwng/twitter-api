import { HTTP_STATUS } from '~/config/http.config'

interface ErrorDetail {
  path: string
  message: string
}

export class HttpError extends Error {
  statusCode: number
  errors?: ErrorDetail[]

  constructor(message: string, statusCode: number, errors?: ErrorDetail[]) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    Object.setPrototypeOf(this, HttpError.prototype)
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, errors: ErrorDetail[]) {
    super(message, HTTP_STATUS.BAD_REQUEST, errors)
    this.name = 'ValidationError'
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Conflict') {
    super(message, HTTP_STATUS.CONFLICT)
    this.name = 'ConflictError'
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(message, HTTP_STATUS.UNAUTHORIZED)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN)
    this.name = 'ForbiddenError'
  }
}

export class NotAcceptableError extends HttpError {
  constructor(message = 'Not Acceptable') {
    super(message, HTTP_STATUS.NOT_ACCEPTABLE)
    this.name = 'NotAcceptableError'
  }
}

export class GoneError extends HttpError {
  constructor(message = 'Gone') {
    super(message, HTTP_STATUS.GONE)
    this.name = 'GoneError'
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not Found') {
    super(message, HTTP_STATUS.NOT_FOUND)
    this.name = 'NotFoundError'
  }
}

export class InternalServerError extends HttpError {
  constructor(message = 'Internal Server Error') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR)
    this.name = 'InternalServerError'
  }
}
