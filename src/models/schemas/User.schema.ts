import { z } from 'zod'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'

const objectIdSchema = z.instanceof(ObjectId).optional()

export const User = z.object({
  _id: objectIdSchema,
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email format').trim(),
  birthDate: z.date().default(new Date()),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date()),
  verifyEmailToken: z.string().default(''),
  forgotPasswordToken: z.string().default(''),
  verify: z.nativeEnum(UserVerifyStatus).default(UserVerifyStatus.Unverified),

  isPrivate: z.boolean().default(false),
  bio: z.string().trim().default(''),
  location: z.string().trim().default(''),
  website: z.string().trim().default(''),
  username: z.string().trim().default(''),
  avatar: z.string().default(''),
  coverPhoto: z.string().default(''),

  _destroy: z.boolean().default(false)
})

export type UserType = z.infer<typeof User>
