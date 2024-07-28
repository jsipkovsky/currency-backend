import { Request, Response, Router } from 'express';
import axios from 'axios';
import { API_URL } from './../config/currencyConfig';
import { getPublicIP } from '../modules/common';
import { ArbitrageManager } from '../modules/arbitrage-manager';

const router: Router = Router();

router.get('/currency-rates', async (_: Request, res: Response) => {
  try {
    const response = await getPublicIP();
    res.send(response);
  } catch (error) {
    res.status(500).send('Failed to fetch currency rates');
  }
});

router.get('/test', async (_: Request, res: Response) => {
  try {
    const arbitrageManager = new ArbitrageManager();
    const bn = await arbitrageManager.executeArbitrage();
    // const bn = await arbitrageManager.getCurrentPrice('binance', 'BTC/USDT');
    // const gt = await arbitrageManager.getCurrentPrice('gate', 'BTC/USDT');
    console.log('BN:', bn);
    res.send(bn);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

export default router;
