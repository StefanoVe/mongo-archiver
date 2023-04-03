//boiler plate for an express post request
import express from 'express';
import { body } from 'express-validator';
import { DATABASE_VALIDATION_MESSAGES } from '../../../models/database.js';
import { testConnection } from '../../../services/connect.js';
import { validateRequest } from '../../../services/validation/service.validate-request.js';

const _validateMongoUri = (value: string) => {
  // MongoDB URL regex pattern
  const pattern =
    /^mongodb(?:\+srv)?:\/\/(?:(?:(?:[\w-]+):(?:[\w-]+)@)?(?:[\w-]+\.)+[\w-]+(?::\d{1,5})?)(?:\/(?:[\w-]+(?:,[\w-]+)*)?(?:\?[\w-]+(?:=[\w-]+(?:&[\w-]+(?:=[\w-]+)*)*)?)?)?$/;

  if (!pattern.test(value)) {
    return false;
  }
  return true;
};

const router = express.Router();

router.post(
  '/',
  body('url').isString().withMessage(DATABASE_VALIDATION_MESSAGES.uri),
  validateRequest,
  async (req, res) => {
    const { url } = req.body;

    const result = await testConnection(url);

    if (!result) {
      return res.status(500).send({ error: 'connection failed' });
    }

    res.send({
      success: true,
    });
  }
);

export { router as testDatabaseConnectionRouter };
