//boiler plate for an express post request
import express from 'express';
import { param } from 'express-validator';
import { validateRequest } from '../../../services/validation/validate-request.js';

const router = express.Router();

router.get(
  '/:id?',
  param('id').isMongoId().withMessage('id must be a valid mongo id'),
  validateRequest,
  (req, res) => {
    res.send('Hello World!');
  }
);

export { router as getDatabaseRouter };
