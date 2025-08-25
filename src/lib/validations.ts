import { z } from 'zod';

// Email validation schema
export const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email is too long'),
});

// User signup validation schema (for Tally form integration)
export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email is too long'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long')
    .optional(),
  company: z
    .string()
    .max(100, 'Company name is too long')
    .optional(),
  useCase: z
    .string()
    .max(500, 'Use case description is too long')
    .optional(),
});

// Text enhancement validation schema
export const textEnhancementSchema = z.object({
  text: z
    .string()
    .min(1, 'Text is required')
    .max(8000, 'Text must be less than 8000 characters'),
  enhancementType: z
    .enum(['general', 'professional', 'academic', 'creative', 'technical'])
    .default('general'),
  tone: z
    .enum(['formal', 'casual', 'friendly', 'professional', 'academic'])
    .optional(),
  targetAudience: z
    .enum(['general', 'business', 'academic', 'technical', 'marketing'])
    .optional(),
});

// API settings validation schema
export const apiSettingsSchema = z.object({
  apiKey: z
    .string()
    .min(1, 'API key is required')
    .max(200, 'API key is too long'),
  model: z
    .string()
    .min(1, 'Model selection is required')
    .default('moonshotai/kimi-k2:free'),
  temperature: z
    .number()
    .min(0, 'Temperature must be between 0 and 2')
    .max(2, 'Temperature must be between 0 and 2')
    .default(0.7)
    .optional(),
  maxTokens: z
    .number()
    .min(1, 'Max tokens must be at least 1')
    .max(4000, 'Max tokens cannot exceed 4000')
    .default(2000)
    .optional(),
});

// Contact form validation schema
export const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email is too long'),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject is too long'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message is too long'),
});

// Feedback form validation schema
export const feedbackSchema = z.object({
  rating: z
    .number()
    .min(1, 'Please provide a rating')
    .max(5, 'Rating must be between 1 and 5'),
  feedback: z
    .string()
    .min(10, 'Feedback must be at least 10 characters')
    .max(500, 'Feedback is too long'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional(),
  category: z
    .enum(['bug', 'feature', 'improvement', 'general'])
    .default('general'),
});

// Newsletter subscription validation schema
export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email is too long'),
  preferences: z
    .array(z.enum(['updates', 'features', 'tips', 'news']))
    .optional(),
});

// Authentication validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name is too long'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Type exports for TypeScript
export type EmailFormData = z.infer<typeof emailSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type TextEnhancementFormData = z.infer<typeof textEnhancementSchema>;
export type ApiSettingsFormData = z.infer<typeof apiSettingsSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type FeedbackFormData = z.infer<typeof feedbackSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Validation helper functions
export const validateEmail = (email: string): boolean => {
  try {
    emailSchema.parse({ email });
    return true;
  } catch {
    return false;
  }
};

export const validateTextLength = (text: string, maxLength: number = 8000): boolean => {
  return text.length > 0 && text.length <= maxLength;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ');
};

// Form validation utilities
export const getFieldError = (errors: any, fieldName: string): string | undefined => {
  return errors?.[fieldName]?.message;
};

export const hasFieldError = (errors: any, fieldName: string): boolean => {
  return !!errors?.[fieldName];
};