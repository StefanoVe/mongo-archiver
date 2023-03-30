//boiler plate for an express post request
import express from 'express';
import { body } from 'express-validator';
import { DATABASE_VALIDATION_MESSAGES } from '../../../models/database.js';
import { testConnection } from '../../../services/connect.js';
import { validateRequest } from '../../../services/validation/service.validate-request.js';

const _validateMongoUri = (uri: string) => {
  //validate the uri with a regex and return true if it's valid
  const url =
    /^mongodb:\/\/[a-zA-Z0-9]+:[a-zA-Z0-9]+@([a-zA-Z0-9]+\.){1,}[a-zA-Z0-9]+(:[0-9]+)?\/[a-zA-Z0-9]+$/;

  const ipAddress =
    /^([01]?\d?\d|2[0-4]\d|25[0-5])(\.([01]?\d?\d|2[0-4]\d|25[0-5])){3}$/;

  //localhost with port
  const localhost = /^mongodb:\/\/localhost:\d+\/\w+/;

  return uri.match(url) || uri.match(ipAddress) || uri.match(localhost)
    ? true
    : false;
};

const router = express.Router();

router.post(
  '/',
  body('uri')
    .custom(_validateMongoUri)
    .withMessage(DATABASE_VALIDATION_MESSAGES.uri),
  validateRequest,
  async (req, res) => {
    const { uri } = req.body;

    const result = await testConnection(uri);

    if (!result) {
      return res.status(500).send({ error: 'connection failed' });
    }

    res.send({
      success: true,
    });
  }
);

export { router as testDatabaseConnectionRouter };
