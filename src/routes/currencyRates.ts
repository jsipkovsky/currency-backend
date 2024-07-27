import { Request, Response, Router } from 'express';
import axios from 'axios';
import { API_URL } from './../config/currencyConfig';
import { getPublicIP } from '../modules/common';

const router: Router = Router();

router.get('/currency-rates', async (_: Request, res: Response) => {
  try {
    const response = await getPublicIP();
    res.send(response);
  } catch (error) {
    res.status(500).send('Failed to fetch currency rates');
  }
});

export default router;
