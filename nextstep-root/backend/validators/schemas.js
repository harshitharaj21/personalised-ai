import { z } from 'zod';

export const completeMissionSchema = z.object({
  missionId: z.string().uuid('Invalid mission ID format'),
  difficultyRating: z.enum(['EASY', 'MODERATE', 'HARD'], {
    errorMap: () => ({ message: 'difficultyRating must be EASY, MODERATE, or HARD' }),
  }),
  userNotes: z.string().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});

export const adaptScheduleSchema = z.object({
  reasonCode: z.enum(['EXAMS', 'BURNOUT', 'BUSY_WORK', 'ILLNESS', 'CUSTOM'], {
    errorMap: () => ({ message: 'reasonCode must be one of EXAMS, BURNOUT, BUSY_WORK, ILLNESS, or CUSTOM' }),
  }),
  newCapacityMinutes: z
    .number({ invalid_type_error: 'newCapacityMinutes must be a number' })
    .min(15, 'Minimum 15 minutes per day')
    .max(180, 'Maximum 180 minutes per day'),
});

export const aiTutorSchema = z.object({
  missionId: z.string().uuid('Invalid mission ID format'),
  userQuestion: z
    .string()
    .min(3, 'Question must be at least 3 characters')
    .max(500, 'Question cannot exceed 500 characters'),
});

export const syncUserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Invalid email address'),
});

export const onboardingSchema = z.object({
  dailyCapacityMinutes: z.number().min(15).max(180),
  trackSlug: z.string().min(1),
});
