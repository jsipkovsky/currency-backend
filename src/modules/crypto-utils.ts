import axios from "axios";
import path from 'path';
import { CoinCalculation } from "../typeorm/entities/CoinCalculation";
import { AppDataSource } from "./database-access";
import { sendEmail } from "./email-utils";
import { ArbitrageManager } from "./arbitrage-manager";
const csvParse = require('csv-parser');
const fs = require('fs');

// let apiCalls = 0;

const headers = {accept: 'application/json', 'x-cg-pro-api-key': 'CG-ZBiwLSf6bKGWUEBqkBpcGsuF'};

const exchanges: {
    exchange: any; pair: string; price: any; spread: any; depth_plus_2: any; // Example field
    depth_minus_2: any; // Example field
    volume_24h: any; volume_percentage: any; // Example field
    last_updated: any; trust_score: any; // Example field
    is_centralized: any; // Example field
  }[] = [];
  
  let exchangesData = new Map();
  
  type ExchangeMap = Map<string, string>;
  const readAndStoreExchangesData = (): Promise<ExchangeMap> => {
    const filePath = path.resolve('exchanges_data.csv');
    const exchangesMap = new Map<string, string>();
  
    return new Promise((resolve, reject) => {
      const parser = fs.createReadStream(filePath)
        .pipe(csvParse({ columns: true }))
        .on('data', (row: { Name: string; IsCentralized: string; }) => {
          exchangesMap.set(row.Name, row.IsCentralized);
        })
        .on('end', () => {
          console.log('CSV file successfully processed.');
          resolve(exchangesMap);
        })
        .on('error', (error: any) => {
          console.error('Error reading CSV file:', error);
          reject(error);
        });
    });
  };

async function fetchAllTickers(exchange:string, limit:number = 100) {
    let page = 1;
    const allTickers = [];
  
    while (true) {
      const url = `https://pro-api.coingecko.com/api/v3/exchanges/${exchange}/tickers?page=${page}&limit=${limit}&depth=true`;
      try {
        const response = await axios.get(url, { headers });
        const tickers = response.data.tickers;
        // apiCalls += 1;
        if (tickers.length === 0) {
          break; // No more tickers to fetch
        }
        
        allTickers.push(...tickers);
        page++;
      } catch (error) {
        console.error('Error fetching tickers:', error);
        break;
      }
    }
  
    return allTickers;
  }

  function getRandomUniqueElements(arr: {id: string }[], num: number): string[] {
    const result = new Set<string>();
    while(result.size < num && result.size < arr.length) {
      const randomIndex = Math.floor(Math.random() * arr.length);
      result.add(arr[randomIndex].id);
    }
    return Array.from(result);
  }

export async function checkPrices() {
    try {
      const exchangesResponse = await axios.get('https://pro-api.coingecko.com/api/v3/exchanges/list', { headers });
      const exchanges = exchangesResponse.data;
      // const uniqueRandomExchanges = getRandomUniqueElements(exchanges, 10);

        // Add selected exchanges to exchangeList ensuring there are no duplicates
        const exchangeList = ['kraken', 'gdax', 'huobi', 'binance', 'bitfinex', 'kucoin', 'azbit',
          'gemini', 'crypto_com', 'okex', 'bitstamp', 'poloniex', 'gate', 'poloniex', 
          'phemex', 'whitebit', 'bitmax', 'bingx', 'bithumb', 'lbank']
          // 'uniwswap', 'sushiswap', 'balancer', 'curve-base', 'jupiter', 'quickswap']
        // const uniqueExchangeList = new Set([...exchangeListBase, ...uniqueRandomExchanges]);

        // Convert the Set back to an array
        // const exchangeList = Array.from(uniqueExchangeList);


      const allTickersMap: { [key: string]: any[] } = {};
      for (const exchange of exchangeList) {
        const tickers = await fetchAllTickers(exchange, 100);
        console.log(`Fetched ${tickers.length} tickers from ${exchange}`);
  
        tickers.forEach((ticker: any) => {
          const pair = `${ticker.base}/${ticker.target}`;
          if (!allTickersMap[pair]) {
            allTickersMap[pair] = [];
          }
          allTickersMap[pair].push({
            ...ticker,
            exchange,
          });
        });
      }

      // console.log(apiCalls, 'API calls made');

      const exchangesData = await readAndStoreExchangesData();

      const objectsToSave = [];

      const timestamp = new Date().getTime();

      let totalPairs = 0;
      for (const pair in allTickersMap) {
        const tickers = allTickersMap[pair];
        if (tickers.length > 1) {
          totalPairs += tickers.length
          for (let i = 0; i < tickers.length; i++) {
            for (let j = i + 1; j < tickers.length; j++) {
              const ticker1 = tickers[i];
              const ticker2 = tickers[j];
    
              const tickerOneDepth = ticker1.cost_to_move_up_usd || 0;
              const tickerOneDepthMinus = ticker1.cost_to_move_down_usd || 0;
              const spreadOne = ticker1.bid_ask_spread_percentage || 0;
              const volumeDayOne = ticker1.volume || null;
    
              const tickerTwoDepth = ticker2.cost_to_move_up_usd || 0;
              const tickerTwoDepthMinus = ticker2.cost_to_move_down_usd || 0;
              const spreadTwo = ticker2.bid_ask_spread_percentage || 0;
              const volumeDayTwo = ticker2.volume || null;
    
              const isCentralized1 = exchangesData.get(ticker1.market.name) === 'CEX';
              const isCentralized2 = exchangesData.get(ticker2.market.name) === 'CEX';
    
              const depthToCheck1 = isCentralized1 ? 100000 : 500000;
              const volumeToCheck1 = isCentralized1 ? 500000 : 250000;
              const maximumSpread1 = isCentralized1 ? 0.5 : 1;
    
              const depthToCheck2 = isCentralized2 ? 100000 : 500000;
              const volumeToCheck2 = isCentralized2 ? 500000 : 250000;
              const maximumSpread2 = isCentralized2 ? 0.5 : 1;
    
              if (tickerOneDepth > depthToCheck1 && tickerOneDepthMinus > depthToCheck1 && spreadOne < maximumSpread1 && volumeDayOne > volumeToCheck1 &&
                  tickerTwoDepth > depthToCheck2 && tickerTwoDepthMinus > depthToCheck2 && spreadTwo < maximumSpread2 && volumeDayTwo > volumeToCheck2) {
    
                const price1 = ticker1.last;
                const price2 = ticker2.last;
    
                const absolutePriceDifference = Math.abs(price1 - price2);
                const averagePrice = (price1 + price2) / 2;
                const priceDifferencePercent = (absolutePriceDifference / averagePrice) * 100;


                console.log('priceDifferencePercent:', priceDifferencePercent);
  
    
                let percDiffMin = 4.5;
                if (!isCentralized1 && !isCentralized2) {
                  percDiffMin = 4;
                } else if (isCentralized1 && isCentralized2) {
                  percDiffMin = 3;
                }
                const significantPriceDifferences = [];
                if (priceDifferencePercent > percDiffMin && priceDifferencePercent < 50) {

                  const newStrategy = new CoinCalculation();
                  newStrategy.pair = pair;
                  newStrategy.perc_difference =priceDifferencePercent;
                  newStrategy.ticker_one_depth = tickerOneDepth;
                  newStrategy.ticker_two_depth = tickerTwoDepth;
                  newStrategy.ticker_one_depth_minus = tickerOneDepthMinus;
                  newStrategy.ticker_two_depth_minus = tickerTwoDepthMinus;
                  newStrategy.spread_one = spreadOne;
                  newStrategy.spread_two = spreadTwo;
                  newStrategy.volume_day_one = volumeDayOne;
                  newStrategy.volume_day_two = volumeDayTwo;
                  newStrategy.exchange_one = ticker1.exchange;
                  newStrategy.exchange_two = ticker2.exchange;
                  newStrategy.price_one = price1;
                  newStrategy.price_two = price2;
                  newStrategy.timestamp = timestamp.toString();
                  newStrategy.type_one = isCentralized1 ? 'CEX' : 'DEX';
                  newStrategy.type_two = isCentralized2 ? 'CEX' : 'DEX';
                  objectsToSave.push(newStrategy);

                  significantPriceDifferences.push({
                    exchange1: ticker1.exchange,
                    exchange2: ticker2.exchange,
                    pair: ticker1.base + '/' + ticker1.target,
                    priceDifferencePercent: priceDifferencePercent.toFixed(2),
                    exchange1Price: price1,
                    exchange2Price: price2,
                    depth_plus_2_1: tickerOneDepth,
                    depth_minus_2_1: tickerOneDepthMinus,
                    volume_24h_1: volumeDayOne,
                    is_centralized_1: isCentralized1,
                    depth_plus_2_2: tickerTwoDepth,
                    depth_minus_2_2: tickerTwoDepthMinus,
                    volume_24h_2: volumeDayTwo,
                    is_centralized_2: isCentralized2
                  });

                  if(ticker1.exchange == 'binance' && ticker2.exchange == 'gate' ||
                    ticker1.exchange == 'gate' && ticker2.exchange == 'binance') {
                    sendEmail('jansipkovsky2@gmail.com', 'crt test', price1 + ' ' + price2 + ' ' + pair);
                    // const arbitrageManager = new ArbitrageManager();
                    // const bn = await arbitrageManager.executeArbitrage(pair);
                  }
                }
              }
            }
          }
        }
      }
      await AppDataSource.manager.save(objectsToSave);
      console.log('Pairs with significant price differences:', totalPairs);
    } catch (error) {
        console.error('Error fetching Dogecoin tickers:', error);
    }
  }

    // Replace 'your-api-key-here' with your actual API key
  // const headers = {accept: 'application/json', 'x-cg-pro-api-key': 'CG-ZBiwLSf6bKGWUEBqkBpcGsuF'};

  // const exchangesResponse = await axios.get('https://pro-api.coingecko.com/api/v3/exchanges/list', { headers });
  // const exchanges = exchangesResponse.data;
  // const exchangesData = new Map();

  // for (const exchange of exchanges) {
  //     try {
  //     const exchangeDetailsResponse = await axios.get(`https://pro-api.coingecko.com/api/v3/exchanges/${exchange.id}`, { headers });
  //     const exchangeDetails = exchangeDetailsResponse.data;
  //     exchangesData.set(exchange.name, exchangeDetails.centralized ? 'CEX' : 'DEX');
  //   } catch (error) {
  //     console.error(`Error fetching details for ${exchange.name}:`, error);
  //   }
  // }
  // const records = Array.from(exchangesData).map(([name, isCentralized]) => ({ name, isCentralized }));
  // const csvWriterInstance = csvWriter({
  //   path: 'exchanges_data.csv',
  //   header: [
  //     { id: 'name', title: 'Name' },
  //     { id: 'isCentralized', title: 'Is Centralized' }
  //   ]
  // });
  // await csvWriterInstance.writeRecords(records);
  // console.log('CSV file written successfully');

  // const url = 'https://pro-api.coingecko.com/api/v3/coins/dogecoin/tickers?depth=true';
  // const url = 'https://pro-api.coingecko.com/api/v3/exchanges/kraken/tickers?page=1&limit=100';