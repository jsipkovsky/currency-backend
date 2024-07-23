import axios from 'axios';
import * as crypto from 'crypto-js';

// Your API and Secret
const API_KEY = 'XgdSefn0bEp04KKbQptGO4aDHUeGaJWqD0fSKA';
const API_SECRET = '35JQOAlaVab7RF6Wls0nL6mKNaRHbg7G19l77A8ejP8CcuJX-4C9SEmRkUGmzjmynrTIHw';

// Function to create a signature
function createSignature(queryString: string, apiSecret: string) {
  return crypto.HmacSHA256(queryString, apiSecret).toString();
}

// Function to make an authenticated request
export async function getAzbitAccount() {
  const endpoint = '/api/currencies';
  const baseUrl = 'https://data.azbit.com';
  const timestamp = Date.now();
  const queryString = `timestamp=${timestamp}`;
  const signature = createSignature(queryString, API_SECRET);

  const url = `${baseUrl}${endpoint}?${queryString}&signature=${signature}`;

  try {
    const response = await axios.post(url, {
      headers: {
        'X-MBX-APIKEY': API_KEY
      }
    });
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
async function placeAzbitOrder(symbol: string, side: 'buy' | 'sell', type: 'limit' | 'market', quantity: number, price?: number) {
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
placeAzbitOrder('BTC/USDT', 'buy', 'limit', 1, 50000);