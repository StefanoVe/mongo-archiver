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
      const backups = await BackupModel.find({})
        .sort({ createdAt: -1 })
        .lean()
        .populate('cronJob databases');

      const mapped = backups.map((b) => ({
        ...b,
        size: _size(b.data?.toString()) || 'N/A',
        data: undefined,
      }));

      return res.send(mapped);
    }

    const _mongoId = new Types.ObjectId(id);
    const backup = await BackupModel.findById(_mongoId).populate(
      'cronJob databases'
    );

    if (!backup) {
      return res.status(404).send({ error: 'database not found' });
    }

    res.send(backup);
  }
);

export { router as getBackupRouter };

const _size = (str: string) => {
  const sizeInBytes = new TextEncoder().encode(str).byteLength;
  return (sizeInBytes / (1024 * 1024)).toFixed(2);
};
