import axios from 'axios';
import * as ccxt from 'ccxt';
import * as dotenv from 'dotenv';
import { sendEmail } from './email-utils';
dotenv.config();

async function getServerTime() {
    try {
        const res = await axios.get(`https://api.binance.com'/api/v3/time`);
        return res.data.serverTime;
    } catch (error) {
        console.error('Error fetching server time:', error);
        throw error;
    }
}

export class ArbitrageManager {
    // private exchangeA: ccxt.Exchange;
    // private exchangeB: ccxt.Exchange;
    private exchanges: { [key: string]: ccxt.Exchange } = {};
    constructor() {
        this.exchanges = {
            gate: new ccxt.gate({
                apiKey: process.env.GATE_API_KEY,
                secret: process.env.GATE_SECRET,
                enableRateLimit: true
            }),
            // Add other exchanges here
            binance: new ccxt.binance({
                apiKey: process.env.BINANCE_API_KEY,
                secret: process.env.BINANCE_SECRET,
                enableRateLimit: true,
                // verbose: true,
                'options': {
                    'defaultType': 'margin'
                }
            }),
            phemex: new ccxt.phemex({
                apiKey: process.env.PHEMEX_API_KEY,
                secret: process.env.PHEMEX_SECRET
                // enableRateLimit: true
            }),
            coinbase: new ccxt.coinbase({
                apiKey: process.env.COINBASE_API_KEY,
                secret: process.env.COINBASE_SECRET
                // enableRateLimit: true
            }),
            bingx: new ccxt.bingx({
                apiKey: process.env.BINGX_API_KEY,
                secret: process.env.BINGX_SECRET  
                  // verbose: true
            }),
            htx: new ccxt.htx({
                apiKey: process.env.HTX_API_KEY,
                secret: process.env.HTX_SECRET,
                // enableRateLimit: true
                verbose: true,
                'options': {
                    'defaultType': 'future',
                }
            }),
            kraken: new ccxt.kraken({
                apiKey: process.env.KRAKEN_API_KEY,
                secret: process.env.KRAKEN_SECRET
                // enableRateLimit: true
            }),    
            lbank: new ccxt.lbank({
                apiKey: process.env.LBANK_API_KEY,
                secret: process.env.LBANK_SECRET
                // enableRateLimit: true
            }),
            bitfinex: new ccxt.bitfinex({
                apiKey: process.env.BITFINEX_API_KEY,
                secret: process.env.BITFINEX_SECRET
        
                // enableRateLimit: true
            }),  
            kucoin: new ccxt.kucoin({
                apiKey: process.env.KUCOIN_API_KEY,
                secret: process.env.KUCOIN_SECRET
        
                // enableRateLimit: true
            })
            // etc.
        };
        // this.exchangeA = new ccxt.binance({
        //     apiKey: process.env.EXCHANGE_A_API_KEY,
        //     secret: process.env.EXCHANGE_A_SECRET,
        //     'options': {
        //         'defaultType': 'margin',
        //     }
        // });

        // this.exchangeB = new ccxt.gate({
        //     apiKey: process.env.EXCHANGE_B_API_KEY,
        //     secret: process.env.EXCHANGE_B_SECRET,
        //     enableRateLimit: true,
        // });
    }

    getExchange(name: string) {
        return this.exchanges[name];
    }

    async checkTargetBalance(coin: string, amount: number) {
        const startTime = Date.now(); // Record the start time
        const timeoutDuration = 10 * 60 * 1000; // 10 minutes in milliseconds
        let balance;
        do {
            const currentTime = Date.now();

            // Check if the elapsed time exceeds the timeout duration
            if (currentTime - startTime > timeoutDuration) {
                return null; // Return null if the timeout is reached
            }
            const resbalance = await this.getExchange('gate').fetchBalance({ type: 'spot' });
            balance = resbalance[coin].free || 0;
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds before re-checking
        } while (balance < amount);

        return balance; // Return the final balance
    }
    

    public async executeArbitrage(symbol: string, exchange1: string, exchange2: string) {
        try {
            // Monitor Prices
            const exchangeA = this.getExchange('binance');
            const exchangeB = this.getExchange('gate');
            const exchangeAPrice = Number(await this.getCurrentPrice(exchangeA, symbol));
            const exchangeBPrice = Number(await this.getCurrentPrice(exchangeB, symbol));
            sendEmail('jansipkovsky2@gmail.com', 'crt test l2', exchangeAPrice + ' ' + exchangeBPrice);

            console.log(`ExchangeA BTC Price: ${exchangeAPrice}`);
            console.log(`ExchangeB BTC Price: ${exchangeBPrice}`);

            
            const absolutePriceDifference = Math.abs(exchangeAPrice - exchangeBPrice);
            const averagePrice = (exchangeAPrice + exchangeBPrice) / 2;
            const priceDifferencePercent = (absolutePriceDifference / averagePrice) * 100;
            console.log(`priceDifferencePercent: ${priceDifferencePercent}`);
            sendEmail('jansipkovsky2@gmail.com', 'crt test l3', priceDifferencePercent.toString());

            if(exchange1 == 'binance' && exchange2 == 'gate' ||
                exchange2 == 'gate' && exchange1 == 'binance') {

            if (priceDifferencePercent > 3 && exchangeAPrice < exchangeBPrice) {
                // Short Sell on Exchange A
                const exchangeA = this.getExchange('binance');
                const exchangeB = this.getExchange('gate');
                const amount = Number((1000 / exchangeAPrice).toFixed(4));
                const res = await this.executeBuy(exchangeA as ccxt.binance, 'ETH/USDT', amount, exchangeAPrice);
                console.log(res);

                const deposit_address = await exchangeB.fetchDepositAddress('ETH');

                const coin = symbol.split('/')[0];
                const withdrawal_response = await exchangeA.withdraw(
                    coin,
                    amount,
                    deposit_address.address,
                );
                console.log(withdrawal_response);

                console.log(`Checking ${amount} ${symbol}`);

                const transfed = await this.checkTargetBalance(coin, amount); 
                console.log(transfed);

                const resSell = await this.executeSell(exchangeB as ccxt.gate, symbol, amount, exchangeBPrice);
                console.log(resSell);

                sendEmail('jansipkovsky2@gmail.com', 'crt test', JSON.stringify(resSell.info) + JSON.stringify(res.info));
                // console.log(res);
                // return res;

                // const s = await exchange.createOrder(symbol, 'MARKET', 'SELL', 0.1);

                // Buy on Exchange B
                // await this.executeBuy(this.getExchange('binance'), 'BTC/USDT', 1, exchangeBPrice);

                // // Transfer and Repay (This assumes direct transfer and repay methods are synchronous for simplicity)
                // await this.transferAndRepay('BTC', 1);

                // // Calculate Profit
                // const profit = this.calculateProfit(exchangeAPrice, exchangeBPrice, 100);
                // console.log(`Profit: $${profit}`);
            }
        }

        } catch (error) {
            sendEmail('jansipkovsky2@gmail.com', 'crt test e1', error as string);
            console.error('Error executing arbitrage:', error);
        }
    }

    async getCurrentPrice(exchange: ccxt.Exchange, symbol: string): Promise<string> {
        try {
        const ticker = await exchange.fetchTicker(symbol);
        return ticker.ask?.toString() ?? '0';
        } catch (error: any) {
            console.error(`Error fetching price for ${symbol} on ${exchange}:`, error);
            return error.message ?? '0';
        }
    }

    private async executeShortSell(exchange: ccxt.binance, symbol: string, amount: number, price: number) {
        // const borrowsResp = await exchange.sapiPostMarginLoan({
        //     asset: 'BTC',
        //     amount: 0.0001
        // });
        // const borrowRersp = await exchange.sapiPostMarginRepay({
        //     asset: 'BTC',
        //     amount: 0.00100003
        // });
        const balance = await exchange.fetchBalance();
        // const deposit_address = await this.getExchange('gate').fetchDepositAddress('ETH');


        // const withdrawal_response = await exchange.withdraw(
        //     'ETH',
        //     0.1,
        //     deposit_address.address,
        // );
        // const balasnce = await exchange.fetchPosition('18898563575');
        const usdtBalance = balance.info['USDT'] || 0;
        const busdBalance = balance.info['BUSD'] || 0;
        // const bal = await exchange.fetchBalance(); 
        // console.log('Borrow response:', exchange);
        // return borrowResp;
        // console.log(`Short selling ${amount} ${symbol} at ${price} on ${exchange.name}`);
        // // Example: Short sell using createOrder
        // const s = await exchange.createOrder(symbol, 'MARKET', 'SELL', 0.1);
        // const s = await exchange.sapiPostMarginOrder({
        //     symbol: symbol,
        //     side: 'SELL',
        //     type: 'MARKET',
        //     quantity: amount,
        //     // price: price,
        //     // stopPrice: price * 1.01,
        //     // timeInForce: 'GTC'
        // }
        // )
        // console.log(s);
    }

    private async executeBuy(exchange: ccxt.binance, symbol: string, amount: number, price: number) {
        console.log(`Buying ${amount} ${symbol} at ${price} on ${exchange.name}`);
        // Example: Buy using createOrder
        const order = await exchange.createOrder(symbol, 'MARKET', 'BUY', amount);
        console.log(order);
        return order;
    }

    private async executeSell(exchange: ccxt.gate, symbol: string, amount: number, price: number) {
        console.log(`Selling ${amount} ${symbol} at ${price} on ${exchange.name}`);
        // Example: Buy using createOrder
        const order = await exchange.createOrder(symbol, 'market', 'sell', amount, price, { type: 'spot' });
        console.log(order);
        return order;
    }

    private async transferAndRepay(currency: string, amount: number) {
        // This process usually involves several steps which are simplified here
        console.log(`Transferring ${amount} ${currency} and repaying the loan`);

        // Simulate transfer between exchanges (actual implementation will depend on the exchanges and API)
        // This can also include checking transfer completion and addressing exchange-specific requirements
    }

    private calculateProfit(sellPrice: number, buyPrice: number, fees: number): number {
        return sellPrice - buyPrice - fees;
    }
}
