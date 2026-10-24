import { Router } from 'express';
import { vehiclesController } from './vehicles.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/requireAdmin';
import { validateBody, validateQuery } from '../../middleware/validate';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleSearchQuerySchema,
} from './vehicles.schema';

const router = Router();

// All vehicle endpoints require authentication
router.use(authenticate);

// Search endpoint (before /:id)
router.get('/search', validateQuery(vehicleSearchQuerySchema), (req, res, next) =>
  vehiclesController.search(req, res, next)
);

// Standard CRUD endpoints
router.post('/', validateBody(createVehicleSchema), (req, res, next) =>
  vehiclesController.create(req, res, next)
);

router.get('/', (req, res, next) =>
  vehiclesController.getAll(req, res, next)
);

router.get('/:id', (req, res, next) =>
  vehiclesController.getById(req, res, next)
);

router.put('/:id', validateBody(updateVehicleSchema), (req, res, next) =>
  vehiclesController.update(req, res, next)
);

router.delete('/:id', requireAdmin, (req, res, next) =>
  vehiclesController.delete(req, res, next)
);

export default router;
