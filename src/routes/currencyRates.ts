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

router.get('/sell/:exchange/:coin/:amount', async (req: Request, res: Response) => {
  try {
    const arbitrageManager = new ArbitrageManager();
    const exchange = req.params.exchange;
    const coin = req.params.coin;
    const amount = parseFloat(req.params.amount);
    const price = await (arbitrageManager.getExchange(exchange)).fetchTicker(coin + '/USDT');
    const order = await (arbitrageManager.getExchange(exchange)).createOrder(coin + '/USDT', 'market', 'sell', amount, price.ask, { type: 'spot' });
    console.log(order);
    res.send(order);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

router.get('/buy/:exchange/:coin', async (req: Request, res: Response) => {
  try {
    const arbitrageManager = new ArbitrageManager();
    const exchange = req.params.exchange;
    const coin = req.params.coin;
    const exchangeB = arbitrageManager.getExchange(exchange);
    const exchangeAPrice = await exchangeB.fetchTicker(coin + '/USDT');
    const price = exchangeAPrice.ask ?? 1;
    const amount = Number((20 / price).toFixed(4));
    const order = await arbitrageManager.executeBuy(exchangeB, coin + '/USDT', amount, price);
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

router.get('/address/:exchange/:coin/:network', async (req: Request, res: Response) => {
  try {
    const arbitrageManager = new ArbitrageManager();
    const exchange = req.params.exchange;
    const coin = req.params.coin;
    const network = req.params.network;
    // const deposit_address = await arbitrageManager.getExchange(exchange).fetchDepositAddress(coin, { network});
    const deposit_address = await arbitrageManager.getExchange(exchange).fetchDepositAddress(coin);
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

router.get('/currencies/:exchange', async (req: Request, res: Response) => {
  try {
    const exchange = req.params.exchange;
    const arbitrageManager = new ArbitrageManager();
    const currencies = await arbitrageManager.getExchange(exchange).fetchCurrencies();
    console.log(currencies);
    res.send(currencies);
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
        '0x94c56b606f202f45d4d5a85ea2102474a7f9c8c2', undefined
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
