//boiler plate for an express post request
import express from 'express';

const router = express.Router();

router.get('/', async (req, res) => {
  console.log('ehre');
  res.send('ok');
});

export { router as testRouter };
