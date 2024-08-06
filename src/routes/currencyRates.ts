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
    const bn = await arbitrageManager.executeArbitrage('BTC/USDT', 'binance', 'gate');
    // const bn = await arbitrageManager.getCurrentPrice('binance', 'BTC/USDT');
    // const gt = await arbitrageManager.getCurrentPrice('gate', 'BTC/USDT');
    console.log('BN:', bn);
    res.send(bn);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.get('/bidasks/:coin/:exch', async (req: Request, res: Response) => {
  try {
    const coin = req.params.coin;
    const exch = req.params.exch;
    const arbitrageManager = new ArbitrageManager();
    const exchangeA = arbitrageManager.getExchange(exch);
    const deposit_address = await exchangeA.fetchDepositAddress(coin);
    // const arbitrageManager = new ArbitrageManager();
    // const ba = await arbitrageManager.fetchBidsAsks(arbitrageManager.getExchange('binance'));
    // console.log('BN:', ba);
    res.send(deposit_address);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.get('/sell', async (_: Request, res: Response) => {
  try {
    const arbitrageManager = new ArbitrageManager();
    const price = await (arbitrageManager.getExchange('binance')).fetchTicker('MINA/USDT');
    const order = await (arbitrageManager.getExchange('binance')).createOrder('MINA/USDT', 'market', 'sell', 6000, price.ask, { type: 'spot' });
    console.log(order);
    res.send(order);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.get('/send', async (_: Request, res: Response) => {
  try {
    const arbitrageManager = new ArbitrageManager();
    const deposit_address = await arbitrageManager.withdraw(50, 'binance', 'gate');
    console.log(deposit_address);
    res.send(deposit_address);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.get('/address', async (_: Request, res: Response) => {
  try {
    const arbitrageManager = new ArbitrageManager();
    const deposit_address = await arbitrageManager.getExchange('okex').fetchDepositAddress('ELF');
    console.log(deposit_address);
    res.send(deposit_address);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});


router.get('/balance/:exchange', async (req: Request, res: Response) => {
  try {
    const exchange = req.params.exchange;
    const arbitrageManager = new ArbitrageManager();
    const deposit_address = await arbitrageManager.getExchange(exchange).fetchBalance({ type: 'spot' });
    console.log(deposit_address);
    res.send(deposit_address);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.get('/withdrwal/:exchange/:coin/:amount', async (req: Request, res: Response) => {
  try {
    const exchange = req.params.exchange;
    const coin = req.params.coin;
    const amount = parseFloat(req.params.amount);
    const arbitrageManager = new ArbitrageManager();
    const exchangeA = arbitrageManager.getExchange(exchange);
    const withdrawal_response = await exchangeA.withdraw(
        coin,
        amount,
        '0x20452121E27B343472AC3f8e751848856d19265b',
    );
    console.log(JSON.stringify(withdrawal_response, null, 2));
    res.send(withdrawal_response);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});


  // const withdrawal_response = await exchangeA.withdraw(
                    //     coin,
                    //     amount,
                    //     deposit_address.address,
                    // );
                    // console.log(JSON.stringify(withdrawal_response, null, 2));

export default router;
