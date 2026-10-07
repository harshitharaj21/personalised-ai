import { Router } from 'express';
import { previewAdaptation, acceptAdaptation } from '../controllers/adaptController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { adaptScheduleSchema } from '../validators/schemas.js';

const router = Router();

router.post('/preview', protect, validate(adaptScheduleSchema), previewAdaptation);
router.post('/accept', protect, validate(adaptScheduleSchema), acceptAdaptation);

export default router;
