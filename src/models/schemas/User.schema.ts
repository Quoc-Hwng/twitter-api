import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'

interface UserType {
  _id?: ObjectId
  name: string
  email: string
  birthDate: Date
  password: string
  createdAt?: Date
  updatedAt?: Date
  verifyEmailToken?: string
  forgotPasswordToken?: string
  verify?: UserVerifyStatus

  bio?: string
  location?: string
  website?: string
  username?: string
  avatar?: string
  coverPhoto?: string

  _destroy: boolean
}

export default class User {
  _id?: ObjectId
  name: string
  email: string
  birthDate: Date
  password: string
  createdAt: Date
  updatedAt: Date
  verifyEmailToken: string
  forgotPasswordToken: string
  verify: UserVerifyStatus

  bio: string
  location: string
  website: string
  username: string
  avatar: string
  coverPhoto: string

  _destroy: boolean

  constructor(user: UserType) {
    this._id = user._id
    this.name = user.name || ''
    this.email = user.email
    this.birthDate = user.birthDate || new Date()
    this.password = user.password
    this.createdAt = user.createdAt || new Date()
    this.updatedAt = user.updatedAt || new Date()
    this.verifyEmailToken = user.verifyEmailToken || ''
    this.forgotPasswordToken = user.forgotPasswordToken || ''
    this.verify = user.verify || UserVerifyStatus.Unverified

    this.bio = user.bio || ''
    this.location = user.location || ''
    this.website = user.website || ''
    this.username = user.username || ''
    this.avatar = user.avatar || ''
    this.coverPhoto = user.coverPhoto || ''

    this._destroy = user._destroy || false
  }
}
