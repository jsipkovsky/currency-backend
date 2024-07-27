
import axios from 'axios';
import * as crypto from 'crypto-js';
import * as crypto2 from 'crypto';

// Your API and Secret
const API_KEY = 'Oebnv43tpBmiNrWcpvdIS0SpO0qVy2UAfW4qXg';
const API_SECRET = 'trKzYT26v5Q1mhBTDwJL5lDazbI8vckmuuqtx0ddAACtxItkhJC1u86JdkCZjslDBVCcmA';

// Function to create a signature
function createSignature(queryString: string, apiSecret: string) {
  return crypto.HmacSHA256(queryString, apiSecret).toString();
}

const getSignature = (url: string, payload: string) => {
  return crypto2.createHmac('sha256', API_SECRET).update(API_KEY + url + payload).digest('hex');
};

// Function to make an authenticated request
export async function getAzbitAccount() {
  const endpoint = '/api/currencies';
  const baseUrl = 'https://data.azbit.com';
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = createSignature(queryString, API_SECRET);

  const requestBodyString = '{"side":"buy","currencyPairCode":"ETH_BTC","amount":0.01,"price":0.02}';
  const requestUrl = 'https://data.azbit.com/api/orders';

  let signature2 = crypto.enc.Hex.stringify(crypto.HmacSHA256(API_KEY + requestUrl + requestBodyString, API_SECRET));
  let sig =  crypto2.createHmac('sha256', API_SECRET).update(API_KEY + requestUrl + requestBodyString).digest('hex');
  const data = JSON.parse(requestBodyString);

  const requestConfig: Record<string, any> = {
    timeout: 60000,
    url: 'https://data.azbit.com/api/orders',
    method: 'POST',
    headers: {
      'API-PublicKey': API_KEY,
      'Content-Type': 'application/json'
    }
  };



  const message = API_KEY + 'https://data.azbit.com/api/orders{"isBid":true,"currencyPairCode":"ETH_BTC","amount":0.01,"price":0.02}';
  const signature3 = createSignature(message, API_SECRET);
  // const url = `https://data.azbit.com/api/orders?${requestBodyString}&signature=${signature}`;
  const options = {
    headers: {
      'API-Publickey'	: API_KEY,
      'API-Signature': sig,
      'Content-Type': 'application/json'
    }
  };

  const httpOptions = {
    method: 'post',
    url: 'https://data.azbit.com/api/orders',
    timeout: 10000,
    headers:{
      'API-PublicKey'	: API_KEY,
      'API-Signature': sig.toString().trim(),
      'Content-Type': 'application/json'
    },
    data,
  };
  try {
    const response = await axios(httpOptions);
    // const response = await axios.post(url, {
    //   headers: {
    //     'X-MBX-APIKEY': API_KEY
    //   }
    // });
    console.log(response.data);
  } catch (error) {
    console.error(`Error`);
  }
}

interface OrderParams {
    symbol: string;
    side: 'buy' | 'sell';
    type: 'limit' | 'market';
    quantity: number;
    price?: number; // Optional for market orders
    timestamp: number;
    [key: string]: any; // Add index signature
  }

  function createSignature2(apiKey: string, requestUrl: string, requestBodyString: string, apiSecret: string): string {
    const strToSign = apiKey + requestUrl + requestBodyString;
    return crypto.enc.Hex.stringify(crypto.HmacSHA256(strToSign, apiSecret));
  }

// Function to place an order
export async function placeAzbitOrder(symbol: string, side: 'buy' | 'sell', type: 'limit' | 'market', quantity: number, price?: number) {
  const endpoint = '/api/orders';
  const baseUrl = 'https://data.azbit.com';
  const timestamp = Date.now();
  
  // Create params for the order
  const params: OrderParams = {
    symbol: symbol,
    side: side,
    type: type,
    quantity: quantity,
    ...(price ? { price: price } : {}),
    timestamp: timestamp
  };

  const requestBodyString = '{"isBid":true,"currencyPairCode":"ETH_BTC","amount":0.01,"price":0.02}';

  // Create the full request URL
  const requestUrl = `${baseUrl}${endpoint}`;

  // Create signature
  const signature = createSignature2(API_KEY, requestUrl, requestBodyString, API_SECRET);
  // Create signature
  // const signature = createSignature(queryString, API_SECRET);

  try {
    const response = await axios.post(requestUrl, requestBodyString, {
        headers: {
          'Content-Type': 'application/json',
          'azbit-api-key': API_KEY,
          'azbit-api-sign': signature,
          'azbit-timestamp': params.timestamp.toString()
        }
      });
    console.log(response.data);
  } catch (error) {
    console.error(`Error`);
  }
}

// Example call to place an order
// placeAzbitOrder('BTC/USDT', 'buy', 'limit', 1, 50000);