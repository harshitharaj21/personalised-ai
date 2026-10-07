import { Router } from 'express';
import { syncUser, completeOnboarding } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { syncUserSchema, onboardingSchema } from '../validators/schemas.js';

const router = Router();

router.post('/sync-user', protect, validate(syncUserSchema), syncUser);
router.post('/onboarding', protect, validate(onboardingSchema), completeOnboarding);

export default router;
