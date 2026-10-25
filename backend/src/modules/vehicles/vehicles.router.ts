import { Router } from 'express';
import { vehiclesController } from './vehicles.controller';
import { authenticate } from '../../middleware/authenticate';
import { requireAdmin } from '../../middleware/requireAdmin';
import { validateBody, validateQuery } from '../../middleware/validate';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleSearchQuerySchema,
  restockSchema,
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

router.put('/:id', validateBody(updateVehicleSchema), (req, res, next) => {
  // Stock edits require the same authority as restocking. Validate first so
  // malformed quantities cannot bypass the field check.
  if (req.body.quantity !== undefined) return requireAdmin(req, res, next);
  return next();
}, (req, res, next) => vehiclesController.update(req, res, next)
);

router.delete('/:id', requireAdmin, (req, res, next) =>
  vehiclesController.delete(req, res, next)
);

// Inventory endpoints
router.post('/:id/purchase', (req, res, next) =>
  vehiclesController.purchase(req, res, next)
);

router.post('/:id/restock', requireAdmin, validateBody(restockSchema), (req, res, next) =>
  vehiclesController.restock(req, res, next)
);

export default router;
