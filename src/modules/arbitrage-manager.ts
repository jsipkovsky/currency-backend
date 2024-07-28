import * as ccxt from 'ccxt';
import * as dotenv from 'dotenv';
dotenv.config();

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
                // verbose: true,
                'options': {
                    'defaultType': 'margin'
                }
            }),
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

    public async executeArbitrage() {
        try {
            // Monitor Prices
            const exchangeAPrice = Number(await this.getCurrentPrice('binance', 'BTC/USDT'));
            const exchangeBPrice = Number(await this.getCurrentPrice('gate', 'BTC/USDT'));

            console.log(`ExchangeA BTC Price: ${exchangeAPrice}`);
            console.log(`ExchangeB BTC Price: ${exchangeBPrice}`);

            if (exchangeAPrice > exchangeBPrice) {
                // Short Sell on Exchange A
                const res = await this.executeShortSell(this.getExchange('binance'), 'BTC/USDT', 0.001, exchangeAPrice);
                console.log(res);

                // Buy on Exchange B
                // await this.executeBuy(this.getExchange('binance'), 'BTC/USDT', 1, exchangeBPrice);

                // // Transfer and Repay (This assumes direct transfer and repay methods are synchronous for simplicity)
                // await this.transferAndRepay('BTC', 1);

                // // Calculate Profit
                // const profit = this.calculateProfit(exchangeAPrice, exchangeBPrice, 100);
                // console.log(`Profit: $${profit}`);
            }

        } catch (error) {
            console.error('Error executing arbitrage:', error);
        }
    }

    async getCurrentPrice(exchange: string, symbol: string): Promise<string> {
        try {
        const ticker = await this.getExchange(exchange).fetchTicker(symbol);
        return ticker.ask?.toString() ?? '0';
        } catch (error: any) {
            console.error(`Error fetching price for ${symbol} on ${exchange}:`, error);
            return error.message ?? '0';
        }
    }

    private async executeShortSell(exchange: ccxt.Exchange, symbol: string, amount: number, price: number) {
        console.log(`Short selling ${amount} ${symbol} at ${price} on ${exchange.name}`);
        // Example: Short sell using createOrder
        await exchange.createOrder(symbol, 'limit', 'sell', amount, price);
    }

    private async executeBuy(exchange: ccxt.Exchange, symbol: string, amount: number, price: number) {
        console.log(`Buying ${amount} ${symbol} at ${price} on ${exchange.name}`);
        // Example: Buy using createOrder
        await exchange.createOrder(symbol, 'limit', 'buy', amount, price);
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
