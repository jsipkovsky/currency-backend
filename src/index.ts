import axios from 'axios';
import app from './app';
import schedule from 'node-schedule';
import { checkPrices } from './modules/crypto-utils';
import { AppDataSource } from './modules/database-access';

const port = process.env.PORT || 8080;

app.listen(port, async () => {
  console.log(`currency-backend application is running on port ${port}.✅`);
  AppDataSource.initialize().then(() => {

    console.log('database initialized.🗄️');
    // checkPrices();

    schedule.scheduleJob('*/5 * * * *', checkPrices);
  }).catch((error: Error) => {
    console.error('Error initializing dB:', error);
  });
});