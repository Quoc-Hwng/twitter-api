import { z } from 'zod'

// ✅ Schema cho password phức tạp
const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(50, 'Password must be at most 50 characters')
  .refine((value) => /[a-z]/.test(value), 'Password must contain at least one lowercase letter')
  .refine((value) => /[A-Z]/.test(value), 'Password must contain at least one uppercase letter')
  .refine((value) => /\d/.test(value), 'Password must contain at least one number')
  .refine((value) => /[!@#$%^&*(),.?":{}|<>]/.test(value), 'Password must contain at least one special character')

export const RegisterBody = z
  .object({
    // ✅ name không được rỗng, có độ dài từ 1 đến 100 ký tự
    name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters').trim(),

    // ✅ email không được rỗng và phải là email hợp lệ
    email: z.string().email('Invalid email format').trim(),

    // ✅ password với các yêu cầu phức tạp
    password: passwordSchema,

    // ✅ confirmPassword phải khớp với password
    confirmPassword: passwordSchema,

    // ✅ date_of_birth phải là định dạng ISO8601
    date_of_birth: z.string().refine((value) => !isNaN(Date.parse(value)), 'Invalid date format (ISO8601 expected)')
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match'
  })

export type RegisterBodyType = z.infer<typeof RegisterBody>

export const RegisterRes = z.object({
  message: z.string(),
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      avatar: z.string().nullable(),
      date_of_birth: z.string()
    })
  })
})

export type RegisterResponse = z.infer<typeof RegisterRes>

export const LoginBody = z
  .object({
    email: z.string().email({ message: 'Invalid email format' }),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' })
      .max(100, { message: 'Password must be at most 100 characters' })
  })
  .strict()

export type LoginBodyType = z.infer<typeof LoginBody>

export const LoginRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      avatar: z.string().nullable(),
      date_of_birth: z.string()
    })
  }),
  message: z.string()
})

export type LoginResType = z.TypeOf<typeof LoginRes>

export const RefreshTokenBody = z
  .object({
    refreshToken: z.string()
  })
  .strict()

export type RefreshTokenBodyType = z.TypeOf<typeof RefreshTokenBody>

export const RefreshTokenRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string()
  }),
  message: z.string()
})

export type RefreshTokenResType = z.TypeOf<typeof RefreshTokenRes>

export const LogoutBody = z
  .object({
    refreshToken: z.string()
  })
  .strict()

export type LogoutBodyType = z.TypeOf<typeof LogoutBody>

export const LoginGoogleQuery = z.object({
  code: z.string()
})

export const VerifyEmailBody = z
  .object({
    verifyToken: z
      .string({
        required_error: 'Token is required',
        invalid_type_error: 'Token must be a string'
      })
      .min(1, 'Token cannot be empty')
  })
  .strict()

export type VerifyEmailBodyType = z.TypeOf<typeof VerifyEmailBody>

export const VerifyEmailRes = z.object({
  message: z.string()
})

export type VerifyEmailResType = z.TypeOf<typeof VerifyEmailRes>

export const ReSendVerifyEmailRes = z.object({
  message: z.string()
})

export type ReSendVerifyEmailResType = z.TypeOf<typeof VerifyEmailRes>

export const PasswordResetTokenBody = z
  .object({
    email: z.string().email('Invalid email format').trim()
  })
  .strict()

export type PasswordResetTokenBodyType = z.TypeOf<typeof PasswordResetTokenBody>

export const PasswordResetTokenRes = z.object({
  message: z.string()
})

export type PasswordResetTokenType = z.TypeOf<typeof PasswordResetTokenRes>

export const VerifyPasswordResetBody = z
  .object({
    verifyToken: z
      .string({
        required_error: 'Token is required',
        invalid_type_error: 'Token must be a string'
      })
      .min(1, 'Token cannot be empty')
  })
  .strict()

export type VerifyPasswordResetBodyType = z.TypeOf<typeof VerifyPasswordResetBody>

export const VerifyPasswordResetRes = z.object({
  message: z.string()
})

export type VerifyPasswordResetResType = z.TypeOf<typeof VerifyPasswordResetRes>
