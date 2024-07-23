import axios, { AxiosRequestConfig } from 'axios';
import ccxt, { Num } from 'ccxt';
import crypto from 'crypto';
import { testBB } from './bibox';
import { getAzbitAccount } from './azbit';

interface Params {
    [key: string]: string | number; // Define the possible types of values
}

function generateSign(apiSecret: string, params: Params): string {
    const queryString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
      return '';
    // return crypto.HmacMD5(queryString, apiSecret).toString();
}

async function getBiboxAccount() {
    const endpoint = '/v1/user/info';
    const baseUrl = 'https://api.bibox.com';
  
    const params: Params = {
      apikey: '645b96cddf7a7cad4680e8d5d1942a9a3abb87b4',
      timestamp: Date.now()
    };
  
    const sign = generateSign('8d259ce6fc0dc42aa79e5af8b15aa0f901e6b36e', params);
    const url = `${baseUrl}${endpoint}?${Object.keys(params)
      .map(key => `${key}=${params[key]}`)
      .join('&')}&sign=${sign}`;
  
    try {
      const response = await axios.get(url);
      console.log(response.data);
    } catch (error: Error | any) {
      console.error(`Error: ${error.response ? error.response.data : error.message}`);
    }
  }
  
  // getBiboxAccount();

  const API_KEY = 'YOUR_API_KEY';
const API_SECRET = 'YOUR_SECRET';

// Function to create the signature
const createSignature = (params: any, apiSecret: string) => {
    const queryString = Object.keys(params)
        .sort()
        .map((key) => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

    // return crypto
    //     .HmacSHA256(queryString, apiSecret)
    //     .toString(crypto.enc.Hex);
};

// Function to place a limit buy order
const placeOrder = async (
    symbol: string,
    side: string,
    type: string,
    price: number,
    quantity: number
) => {
    const apiPath = '/v2/private/order';

    // Create the request payload
    const params = {
        api_key: API_KEY,
        nonce: Date.now(),
        symbol,
        side,
        type,
        price,
        quantity,
    };

    // Sign the request
    const signature = createSignature(params, API_SECRET);
    // params['sig'] = signature;
    
    const config: AxiosRequestConfig = {
        method: 'post',
        url: `https://api.crypto.com${apiPath}`,
        headers: {
            'Content-Type': 'application/json',
        },
        data: params,
    };

    try {
        const response = await axios(config);
        console.log('Order placed successfully:', response.data);
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error('Error placing order:', error.response.data);
        } else {
            console.error('Error placing order:', error);
        }
    }
};

import { IncomingHttpHeaders } from 'http';

async function getPublicIP(): Promise<string> {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      return response.data.ip;
    } catch (error) {
      console.error('Error fetching public IP:', error);
      throw error;
    }
  }

  async function makeBingXRequest() {
    const apiKey = '40Po6jWgXYOXRQvYAZwKaDmqhF6yV7awigOZLIvKQCC0EDNn8MkIltIeCMKMxW2io7fU3e6FMZRMMbgaYAw';
    const apiSecret = 'pZNKzT94TaYGl8yjDtvHmRWSnYHNLQbv5DxszBiylOiJZeEbt1Cl2uGnc0BUsOEeFW1I6KzCDhHDpvJ6ZMMKQ';
    const apiUrl = 'https://open-api.bingx.com/openApi/wallets/v1/capital/config/getall';
  
    // Generating a timestamp and signature for the request
    const timestamp = Date.now();
    const payload = `timestamp=${timestamp}`;
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(payload)
      .digest('hex');
      const ip = await getPublicIP();
    // Making the authenticated request with axios
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          'X-BX-APIKEY': apiKey,
          'X-SOURCE-KEY': 'CCXT',
        },
        params: {
          timestamp: timestamp,
          signature: signature,
        },
      });
  
      console.log('API response:', response.data); // Log the API response
      return response.data; // Return the API response data
    } catch (error) {
      console.error('Error making BingX API request:', error);
      throw error; // Propagate the error
    }
  }

export async function executeTrade(symbol: string, tradeAmount: number, currentPrice: Num) {
    // const ss = await getAzbitAccount();
    const phemex = new ccxt.phemex({
        apiKey: 'c1caa1d2-ab40-48a7-a7c0-3e77b79abd93', // '6a34679e-2488-4c9e-8d52-54e84f53b90c',
        secret: 'pD3_Q2l7QCnvacvMlooner_aKLwhaBqEdhPpe00TZRZkN2Y5YmMzNi04N2U1LTQ5MzktOTEzNC01NDM3OWE1YzZhNTI', // '6KahdUg6pc76g5zEYBY0xgDenNTiofTL6mbV5vgCicE4ZTkzMmZkOC1lZjc0LTQxYTktYWJjMi01ZTc5Y2QwNmRiZDA',
        // enableRateLimit: true
    });

    const binance = new ccxt.binance({
        apiKey: 'dA3YbSbnTWDAL34I9Q1tbU5TjdmPykZAGqIZ3es4tYn31QSaNmeYKKHcCfbBiWYD', // 'ceC9HiMaZ6IeNW3wfiNpaspTx2RQxFAyMiqmc8uOQfZ105jq1EbWl2UbFsewkYX6',
        secret: 'YBrTBpQhFxn83mufYirzfop9GXVcQfjmmaCiauKB6pnw8G72THD6Vx82s6doIVDh', // '1WfIGyoJfzpW0J97NnU8Fpj84iNYc1HEvSgrHp80jDgyjee0KuY2XYDRJz52DE9W',
        'options': {
            'defaultType': 'margin',
        },
        verbose: true
    });

    const coinbase = new ccxt.coinbase({
        apiKey: '8a4b4c48-be34-423f-8448-61748c62aabb',
        secret: 'MHcCAQEEIJwnbCm0itDk2quTjbUcDUIhzBDVysdDVxj5x2aL4Bh7oAoGCCqGSM49\nAwEHoUQDQgAESZgNqBDhjfpnL14aGyrwzbIvh0M7GUoSGA9Eg4oguXavgdtrjWAX\n4IIdq+cxFet8lwO//wcYjZhZvnbYO27FSg==',

        // enableRateLimit: true
    });

    const bitfinex = new ccxt.bitfinex({
        apiKey: 'cf9efc760aef298194c8d31bcdfd718cab473edea04',
        secret: 'ef67af8a2e1920efe501689896efa0a357f6db67cd8',

        // enableRateLimit: true
    });

    const kucoin = new ccxt.kucoin({
        apiKey: 'cf9efc760aef298194c8d31bcdfd718cab473edea04',
        password: 'ef67af8a2e1920efe501689896efa0a357f6db67cd8',

        // enableRateLimit: true
    });

    // await bitfinex.loadMarkets();
    // try {
    //     await phemex.loadMarkets();
    //     const symbol = 'BTC/USDT';
    //     const amount = 0.001;
    //     const price = 30000; // Example price
    //     const order = await phemex.createLimitBuyOrder(symbol, amount, price);
    //     console.log(order);
    // } catch (error) {
    //     console.error('Error:', error);
    // }

    // // Fetch open trades
    // const openTrades = await binance.fetchOpenOrders(symbol);

    const gate = new ccxt.gate({
        apiKey: '50a1bf7798040ca225934e2db2dc8ec8',
        secret: '7b5e2bdf6ce089069e64152578f788c0795c8104906173a3b9d175664a006e32',
        enableRateLimit: true
    });

    const cryptoCom = new ccxt.cryptocom({
        apiKey: 'ineiTgWphV5BHVKM6tbjFL', // 's1yNaB4DSRkixhwFDqp5kn',
        secret: 'cxakp_FSwimSVuRyUYuQRrvWqezN', // 'cxakp_M3rM944ct4Jd2hHz7dU5pF',
        timeout: 30000,
        enableRateLimit: true,
        verbose: true
    });

    const kraken = new ccxt.kraken({
        apiKey: '57bQjw4E2lf4fmtxquxUw+nXqlZW4DfZy8TYHkJnaTQTuvEEfrDR4UWo',
        secret: 'tJ1obZnerdfI9Oanbw5tyISmICV+X4TWmahlOiOE/9t0wMtbb2HWoaIpc70sQlErnxSyz1iinL2WjMADTDR9pw==',
        // enableRateLimit: true
    });

    const lbank = new ccxt.lbank({
        apiKey: '899e4d1c-6244-4c54-a679-b239c96dc32a',
        secret: 'D86737552558AC4FC4CF2BA36FE59DDF',
        // enableRateLimit: true
    });

    const htx = new ccxt.htx({
        apiKey: '75760044-e07b6510-bgbfh5tv3f-95c36',
        secret: '39be0d43-9e19ab74-d995f985-f5753',
        // enableRateLimit: true
        verbose: true,
        'options': {
       'defaultType': 'future',
   },
    });

    // await gate.loadMarkets();
    try {
        const bingx = new ccxt.bingx({
          apiKey: '40Po6jWgXYOXRQvYAZwKaDmqhF6yV7awigOZLIvKQCC0EDNn8MkIltIeCMKMxW2io7fU3e6FMZRMMbgaYAw',
          secret: 'pZNKzT94TaYGl8yjDtvHmRWSnYHNLQbv5DxszBiylOiJZeEbt1Cl2uGnc0BUsOEeFW1I6KzCDhHDpvJ6ZMMKQ',
            // apiKey: 'HK3RcfkTX5dgQuuZLe3JWKdOA1LJl6SDzuyLyXZeWYf6nqdKEmvWQVYgNtZzgfYOWyuei04d7IoiQ1XYAow',
            // secret: 'LRTkwMgaF047cTxKK48TFU2iP2W5o739tyDlzid3euIMCDsPiuXvAFSXEsl57CbRKSNthbh9ZwZfkbhCg',
    
            verbose: true
        });
        // await makeBingXRequest();
        await phemex.loadMarkets();
        const symbol = 'BTC/USDT'
        const type = 'STOP_LOSS_LIMIT'
        const side = 'buy'
        const amount = 1
        const price = 1
        const params = {
            'stopPrice': 1,
            'timeInForce': 'GTC',
        }
        // const sss = await cryptoCom.fetchDeposits ('USDT', Date.now(), undefined, {
        //     'endTime': Date.now(),
        // })
        // try {
        //     const order = await cryptoCom.transfer ('USDT', 1, 'spot', 'future')
        //     console.log (order)
        // } catch (error) {
        //     console.log (error)
        // }

       const balance = await phemex.fetchBalance()

  const currency = 'ETH';
  const amount2 = 0.006;

const deposit_address = await htx.fetchDepositAddress(currency)


const withdrawal_response = await binance.withdraw(
    currency,
    amount2,
    '0x811DCfeb6dC0b9ed825808B6B060Ca469b83fB81',
);
         const sss = await binance.fetchBalance();
        // const symbol = 'BTC/USDT';
        // const amount = 0.001;
        // const price = 30000;

        await binance.createMarketBuyOrder(symbol, amount);
        console.log('Order placed:');
    } catch (error) {
        console.error('Error:', error);
        console.error("Full error: ", error);
    }

    // Fetch open trades
    const sss = await gate.fetchOpenOrders(symbol);

    // Step 1: Obtain Margin Trading Amount on Binance (Loan)
    const loan = null;

    console.log('Margin Loan:', loan);

    // Step 2: Execute Short Selling on Binance
    const shortSell = await gate.createOrder(symbol, 'market', 'sell', tradeAmount);

    console.log('Short Sell:', shortSell);

    // Step 3: Buy on Bitfinex
    const buyOrder = await gate.createOrder(symbol, 'market', 'buy', tradeAmount, currentPrice);

    console.log('Buy Order:', buyOrder);

    // // Step 4: Repay Margin on Binance
    // const repayLoan = await gate.sapiPostMarginRepay({
    //     asset: 'BTC',
    //     amount: tradeAmount
    // });

    // console.log('Repay Loan:', repayLoan);

    return { loan, shortSell, buyOrder, repayLoan: null };
}