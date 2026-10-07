import { Router } from 'express';
import { getMission, completeMission } from '../controllers/missionController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { completeMissionSchema } from '../validators/schemas.js';

const router = Router();

router.get('/:id', protect, getMission);
router.post('/complete', protect, validate(completeMissionSchema), completeMission);

export default router;
