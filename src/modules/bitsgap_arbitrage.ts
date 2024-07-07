import axios from "axios";

// Configuration
const symbol = 'BTCUSDT';
const minTradeAmountUSD = 10000;  // Minimum trade amount in USD
const minPriceDifference = 0.005;  // 0.5% price difference
const maxSpread = 0.1;  // 1% spread
const minVolume = 500;  // Minimum volume for volume-based exit (in BTC)
const maxOpenTime = 600;  // Maximum open time in seconds for time-based exit
const stopLossPercent = 0.995;  // 0.5% stop-loss from the sell price

// API endpoints and keys (replace with your actual API keys)
const binanceApiKey = 'YOUR_BINANCE_API_KEY';
const binanceApiSecret = 'YOUR_BINANCE_API_SECRET';
const bitfinexApiKey = 'YOUR_BITFINEX_API_KEY';
const bitfinexApiSecret = 'YOUR_BITFINEX_API_SECRET';

interface OrderBook {
  bids: [string, string][];
  asks: [string, string][];
}

interface VolumeResponse {
  volume: number;
  [key: string]: any;
}

async function fetchOrderBook(exchange: string, symbol: string): Promise<OrderBook> {
  let url;
  if (exchange === 'binance') {
    url = `https://api.binance.com/api/v3/depth?symbol=${symbol}&limit=100`;
  } else if (exchange === 'bitfinex') {
    url = `https://api-pub.bitfinex.com/v2/book/t${symbol}/P0`;
  } else {
    throw new Error('Unsupported exchange');
  }

  const response = await axios.get(url);
  return response.data;
}

function calculateMarketDepth(orderBook: OrderBook, currentPrice: number, depthPercent = 1) {
  const lowerLimit = currentPrice * (1 - depthPercent / 100);
  const upperLimit = currentPrice * (1 + depthPercent / 100);

  const buyVolume = orderBook.bids.reduce((sum, order) => sum + (parseFloat(order[0]) >= lowerLimit ? parseFloat(order[1]) : 0), 0);
  const sellVolume = orderBook.asks.reduce((sum, order) => sum + (parseFloat(order[0]) <= upperLimit ? parseFloat(order[1]) : 0), 0);

  return { buyVolume, sellVolume };
}

async function fetch24hVolume(exchange: string, symbol: string): Promise<number> {
  let url;
  if (exchange === 'binance') {
    url = `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`;
  } else if (exchange === 'bitfinex') {
    url = `https://api-pub.bitfinex.com/v2/ticker/t${symbol}`;
  } else {
    throw new Error('Unsupported exchange');
  }

  const response = await axios.get(url);
  const data: VolumeResponse = response.data;

  if (exchange === 'binance') {
    return Number(data.volume);
  } else if (exchange === 'bitfinex') {
    return parseFloat(data[7]);
  } else {
    throw new Error('Unsupported exchange response format');
  }
}

async function executeTrade(symbol: string, tradeAmount: number, currentPrice: number) {
  // Step 1: Obtain Margin Trading Amount (Example for Binance)
  const binanceMarginLoan = await axios.post('https://api.binance.com/api/v3/margin/loan', 
    { asset: 'BTC', amount: tradeAmount },
    { headers: { 'X-MBX-APIKEY': binanceApiKey } });
  
  // Step 2: Execute Short Selling on Exchange A (Binance)
  const binanceShortSell = await axios.post('https://api.binance.com/api/v3/order', 
    { symbol: symbol, side: 'SELL', type: 'MARKET', quantity: tradeAmount },
    { headers: { 'X-MBX-APIKEY': binanceApiKey } });

  // Step 3: Buy on Exchange B (Bitfinex)
  const bitfinexBuy = await axios.post('https://api.bitfinex.com/v1/order/new', 
    { symbol: symbol, amount: tradeAmount, price: currentPrice, exchange: 'bitfinex', side: 'buy', type: 'market' },
    { headers: { 'X-BFX-APIKEY': bitfinexApiKey } });

  // Step 4: Repay Margin on Exchange A (Binance)
  const binanceRepayLoan = await axios.post('https://api.binance.com/api/v3/margin/repay', 
    { asset: 'BTC', amount: tradeAmount },
    { headers: { 'X-MBX-APIKEY': binanceApiKey } });

  return { binanceMarginLoan, binanceShortSell, bitfinexBuy, binanceRepayLoan };
}

async function setStopLoss(symbol: string, stopLossPrice: number, tradeAmount: number) {
  const stopLossOrder = await axios.post('https://api.binance.com/api/v3/order', 
    {
      symbol: symbol,
      side: 'SELL',
      type: 'STOP_LOSS_LIMIT',
      quantity: tradeAmount,
      price: stopLossPrice,
      stopPrice: stopLossPrice * 1.01,
      timeInForce: 'GTC'
    },
    { headers: { 'X-MBX-APIKEY': binanceApiKey } });

  return stopLossOrder;
}

async function volumeBasedExit(symbol: string, minVolume: number, tradeAmount: number, currentPrice: number) {
  while (true) {
    const orderBook = await fetchOrderBook('binance', symbol);
    const { buyVolume, sellVolume } = calculateMarketDepth(orderBook, currentPrice);

    if (buyVolume < minVolume || sellVolume < minVolume) {
      await executeTrade(symbol, tradeAmount, currentPrice);
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 60000)); // Sleep for 60 seconds
  }
}

async function timeBasedExit(symbol: string, maxOpenTime: number, tradeAmount: number, currentPrice: number) {
  const startTime = Date.now();
  while (true) {
    if ((Date.now() - startTime) > maxOpenTime * 1000) { // Convert to milliseconds
      await executeTrade(symbol, tradeAmount, currentPrice);
      break;
    }

    await new Promise(resolve => setTimeout(resolve, 10000)); // Sleep for 10 seconds
  }
}

// Main execution
async function main() {
  const currentPrice = 50000; // Replace with actual current price fetching logic

  const binanceOrderBook = await fetchOrderBook('binance', symbol);
  const bitfinexOrderBook = await fetchOrderBook('bitfinex', symbol);
  
  const { buyVolume: binanceBuyVolume, sellVolume: binanceSellVolume } = calculateMarketDepth(binanceOrderBook, currentPrice);
  const { buyVolume: bitfinexBuyVolume, sellVolume: bitfinexSellVolume } = calculateMarketDepth(bitfinexOrderBook, currentPrice);
  
  const binanceVolume = await fetch24hVolume('binance', symbol);
  const bitfinexVolume = await fetch24hVolume('bitfinex', symbol);

  const tradeAmount = Math.min(binanceBuyVolume, binanceSellVolume, binanceVolume, bitfinexVolume);

  if (tradeAmount * currentPrice >= minTradeAmountUSD) {
    await executeTrade(symbol, tradeAmount, currentPrice);
    await setStopLoss(symbol, stopLossPercent * currentPrice, tradeAmount);
    volumeBasedExit(symbol, minVolume, tradeAmount, currentPrice);
    timeBasedExit(symbol, maxOpenTime, tradeAmount, currentPrice);
  } else {
    console.log("Trade amount is less than the minimum required trade amount in USD.");
  }
}
