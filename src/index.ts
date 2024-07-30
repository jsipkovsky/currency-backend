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
dotenv.config();

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const port = process.env.PORT || 8080;

app.listen(port, async () => {
  console.log(`currency-backend application is running on port ${port}.✅`);
  AppDataSource.initialize().then(async () => {

    console.log('database initialized.🗄️');
    const ip = await getPublicIP();
    console.log('Public IP:', ip);
    const host = process.env.PORT;
    console.log('user:', host);

    // Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html


// const secret_name = "testSecret";

// const client = new SecretsManagerClient({
//   region: "eu-central-1",
// });

// let response;

// try {
//   response = await client.send(
//     new GetSecretValueCommand({
//       SecretId: secret_name,
//       VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
//     })
//   );
//   console.log(response);
// } catch (error) {
//   // For a list of exceptions thrown, see
//   // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
//   console.error(error);
// }


    // const arbitrageManager = new ArbitrageManager();
    // const bn = await arbitrageManager.checkTargetBalance('ETH', 0.2);
    // const bn = await arbitrageManager.executeArbitrage('ETH/USDT');
    // const resbalance = await arbitrageManager.getExchange('gate').fetchBalance({ type: 'spot' });

    // arbitrageManager.checkTargetBalance('ETH', 0.2);

    // const bn = await arbitrageManager.executeArbitrage();
    // try {
    //   const response = await axios.get('http://ec2-3-70-92-222.eu-central-1.compute.amazonaws.com:3000/api/test');
    //   return response;
    // } catch (error) {
    //   console.error('Error fetching public IP:', error);
    //   throw error;
    // }

    // const arbitrageManager = new ArbitrageManager();
    // const bn = await arbitrageManager.executeArbitrage();
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