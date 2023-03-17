//boiler plate for an express post request
import express from 'express';
import { param } from 'express-validator';
import {
  DatabaseModel,
  DATABASE_VALIDATION_MESSAGES,
} from '../../../models/database.js';
import { testConnection } from '../../../services/connect.js';
import { validateRequest } from '../../../services/validation/service.validate-request.js';

const router = express.Router();

router.get(
  '/:id',
  param('id').isMongoId().withMessage(DATABASE_VALIDATION_MESSAGES._id),
  validateRequest,
  async (req, res) => {
    const { id } = req.params;

    const _db = await DatabaseModel.findById(id);

    if (!_db) {
      return res.status(404).send({ error: 'database not found' });
    }

    const result = await testConnection(_db.uri);

    if (!result) {
      return res.status(500).send({ error: 'connection failed' });
    }

    res.send({
      success: true,
    });
  }
);

export { router as testDatabaseConnectionRouter };
