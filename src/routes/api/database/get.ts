//boiler plate for an express post request
import express from 'express';
import { param } from 'express-validator';
import { validateRequest } from '../../../services/validation/service.validate-request.js';

const router = express.Router();

router.get(
  '/:id?',
  param('id').optional().isMongoId().withMessage('id must be a valid mongo id'),
  validateRequest,
  (req, res) => {
    const { id } = req.params;

    res.send(`db id: ${id}`);
  }
);

export { router as getDatabaseRouter };
