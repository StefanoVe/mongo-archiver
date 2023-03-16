//boiler plate for an express post request
import express from 'express';
import { body } from 'express-validator';
import {
  DatabaseModel,
  DATABASE_VALIDATION_MESSAGES,
} from '../../../models/database.js';
import { validateRequest } from '../../../services/validation/service.validate-request.js';

const router = express.Router();

router.post(
  '/add',
  body('alias').isString().withMessage(DATABASE_VALIDATION_MESSAGES.alias),
  body('uri').isString().withMessage(DATABASE_VALIDATION_MESSAGES.uri),
  body('enabled').isBoolean().withMessage(DATABASE_VALIDATION_MESSAGES.enabled),
  validateRequest,
  async (req, res) => {
    const { alias, uri, enabled } = req.body;

    const _lowerCaseAlias = alias.toLowerCase();
    const _lowerCaseUri = uri.toLowerCase();

    const existingDb = await DatabaseModel.findOne({
      $or: [{ alias: _lowerCaseAlias }, { uri: _lowerCaseUri }],
    });

    if (existingDb) {
      res.status(400).send({
        error: 'Database with alias or uri already exists',
      });
      return;
    }

    const database = DatabaseModel.build({
      alias: _lowerCaseAlias,
      uri: _lowerCaseUri,
      enabled,
    });

    await database.save();

    res.send(database);
  }
);

export { router as addDatabaseRouter };
