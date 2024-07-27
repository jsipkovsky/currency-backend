import axios from 'axios';
import app from './app';
import schedule from 'node-schedule';
import { checkPrices } from './modules/crypto-utils';
import { AppDataSource } from './modules/database-access';
import { getAzbitAccount } from './modules/azbit';

const port = process.env.PORT || 8080;

app.listen(port, async () => {
  console.log(`currency-backend application is running on port ${port}.✅`);
  AppDataSource.initialize().then(() => {

    console.log('database initialized.🗄️');
    // checkPrices();
    // Call the function (example):
    // getAzbitAccount();
    // testBB();
    // executeTrade('BTC/USDT', 0.01, 1000).then(result => {
    //   console.log('Trade execution result:', result);
    // }).catch(err => {
    //   console.error('Error executing trade:', err);
    // });

    schedule.scheduleJob('*/10 * * * *', checkPrices);
  }).catch((error: Error) => {
    console.error('Error initializing dB:', error);
  });
});