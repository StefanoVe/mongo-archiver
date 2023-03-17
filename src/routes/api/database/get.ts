//boiler plate for an express post request
import express from 'express';
import { param } from 'express-validator';
import { Types } from 'mongoose';
import { DatabaseModel } from '../../../models/database.js';
import { validateRequest } from '../../../services/validation/service.validate-request.js';

const router = express.Router();

router.get(
  '/:id?',
  param('id').optional().isMongoId().withMessage('id must be a valid mongo id'),
  validateRequest,
  async (req, res) => {
    const { id } = req.params;

    if (!id?.length) {
      const database = await DatabaseModel.find({});

      return res.send(database);
    }

    const _mongoId = new Types.ObjectId(id);
    const databases = await DatabaseModel.findById(_mongoId);

    if (!databases) {
      return res.status(404).send({ error: 'database not found' });
    }

    res.send(databases);
  }
);

export { router as getDatabaseRouter };
