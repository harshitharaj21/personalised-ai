import { Router } from 'express';
import { getTutorResponse } from '../controllers/aiController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { aiTutorSchema } from '../validators/schemas.js';

const router = Router();

router.post('/tutor', protect, validate(aiTutorSchema), getTutorResponse);

export default router;
