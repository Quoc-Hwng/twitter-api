import { ObjectId } from 'mongodb'
interface RefreshTokenType {
  _id?: ObjectId
  token: string
  userId: ObjectId
  createdAt?: Date
}
export default class RefreshToken {
  _id?: ObjectId
  token: string
  userId: ObjectId
  createdAt: Date
  constructor({ _id, token, userId, createdAt }: RefreshTokenType) {
    this._id = _id
    this.token = token
    this.userId = userId
    this.createdAt = createdAt || new Date()
  }
}
