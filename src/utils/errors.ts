export class HttpError extends Error {
  statusCode: number
  data?: Record<string, unknown>

  constructor(message: string, statusCode: number, data?: Record<string, unknown>) {
    super(message)
    this.statusCode = statusCode
    this.data = data
    Object.setPrototypeOf(this, HttpError.prototype)
  }
}

export class ValidationError extends HttpError {
  constructor(message: string, data?: Record<string, unknown>) {
    super(message, 400, data)
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
