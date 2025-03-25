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
    super(message, 400, errors)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not Found') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export class InternalServerError extends HttpError {
  constructor(message = 'Internal Server Error') {
    super(message, 500)
    this.name = 'InternalServerError'
  }
}
