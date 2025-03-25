import { ObjectId } from 'mongodb'
interface RefreshTokenType {
  _id?: ObjectId
  token: string
  userId: ObjectId
  createdAt?: Date
  iat: number
  exp: number
}
export default class RefreshToken {
  _id?: ObjectId
  token: string
  userId: ObjectId
  createdAt: Date
  iat: Date
  exp: Date
  constructor({ _id, token, userId, createdAt, iat, exp }: RefreshTokenType) {
    this._id = _id
    this.token = token
    this.userId = userId
    this.iat = new Date(iat * 1000) // Convert Epoch time to Date
    this.exp = new Date(exp * 1000) // Convert Epoch time to Date
    this.createdAt = createdAt || new Date()
  }
}
