import axios from 'axios';
import app from './app';
import schedule from 'node-schedule';
import { checkPrices } from './modules/crypto-utils';
import { AppDataSource } from './modules/database-access';
import { getAzbitAccount } from './modules/azbit';
import { getPublicIP } from './modules/common';
import { ArbitrageManager } from './modules/arbitrage-manager';
const logger = require('../src/logger');
import * as dotenv from 'dotenv';
import { checkPricesCopy } from './modules/crypto-utils-copy';
dotenv.config();

const port = process.env.PORT || 8080;

app.listen(port, async () => {
  console.log(`currency-backend application is running on port ${port}.✅`);
  AppDataSource.initialize().then(async () => {

    console.log('database initialized.🗄️');
    const ip = await getPublicIP();
    console.log('Public IP:', ip);

    // const arbitrageManager = new ArbitrageManager();
    // const bn = await arbitrageManager.fetchBidsAsks(arbitrageManager.getExchange('binance'));
    // const bn = await arbitrageManager.executeArbitrage('ETH/USDT');
    // const resbalance = await arbitrageManager.getExchange('gate').fetchBalance({ type: 'spot' });

    //arbitrageManager.checkTargetBalance('ETH', 0.2);

    // const bn = await arbitrageManager.withdraw(50, 'binance', 'bingx');
    // try {
    //   const response = await axios.get('http://ec2-3-70-92-222.eu-central-1.compute.amazonaws.com:3000/api/send');
    //   return response;
    // } catch (error) {
    //   console.error('Error fetching public IP:', error);
    //   throw error;
    // }
    // const arbitrageManager = new ArbitrageManager();
    // const exchangeA = arbitrageManager.executeArbitrage('MINA/USDT', 'binance', 'htx');
    // const deposit_address = await exchangeA.fetchDepositAddress('RDNT');

    // const withdrawal_response = await exchangeA.withdraw(
    //     'MINA',
    //     10,
    //     deposit_address.address,
    // );
    // console.log(JSON.stringify(withdrawal_response, null, 2));

    // const arbitrageManager = new ArbitrageManager();
    // const bn = await arbitrageManager.executeArbitrage();
    // checkPricesCopy();
    // Call the function (example):
    // getAzbitAccount();
    // testBB();
    // executeTrade('BTC/USDT', 0.01, 1000).then(result => {
    //   console.log('Trade execution result:', result);
    // }).catch(err => {
    //   console.error('Error executing trade:', err);
    // });

    schedule.scheduleJob('*/5 * * * *', checkPricesCopy);
  }).catch((error: Error) => {
    console.error('Error initializing dB:', error);
  });
});