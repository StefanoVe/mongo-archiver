//boiler plate for an express post request
import express from 'express';

const router = express.Router();

router.post('/add', (req, res) => {
  res.send('Hello World!');
});

export { router as addDatabaseRouter };
