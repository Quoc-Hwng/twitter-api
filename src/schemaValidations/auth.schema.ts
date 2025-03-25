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

export const registerSchema = z
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

export type RegisterBodyType = z.infer<typeof registerSchema>

export const registerResponseSchema = z.object({
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

export type RegisterResponse = z.infer<typeof registerResponseSchema>

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .max(100, { message: 'Password must be at most 100 characters' })
})

export type LoginBodyType = z.infer<typeof loginSchema>

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
