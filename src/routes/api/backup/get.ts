//boiler plate for an express post request
import express from 'express';
import { param } from 'express-validator';
import { Types } from 'mongoose';
import { BackupModel } from '../../../models/backup.js';
import { validateRequest } from '../../../services/validation/service.validate-request.js';

const router = express.Router();

router.get(
  '/:id?',
  param('id').optional().isMongoId().withMessage('id must be a valid mongo id'),
  validateRequest,
  async (req, res) => {
    const { id } = req.params;

    if (!id?.length) {
      const database = await BackupModel.find({}).select('-data');

      return res.send(database);
    }

    const _mongoId = new Types.ObjectId(id);
    const databases = await BackupModel.findById(_mongoId);

    if (!databases) {
      return res.status(404).send('database not found');
    }

    res.send(databases);
  }
);

export { router as getBackupRouter };
