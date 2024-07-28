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
                enableRateLimit: true,
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
            const exchangeBPrice = Math.random(); // Number(await this.getCurrentPrice('gate', 'BTC/USDT'));

            console.log(`ExchangeA BTC Price: ${exchangeAPrice}`);
            console.log(`ExchangeB BTC Price: ${exchangeBPrice}`);

            if (exchangeAPrice != exchangeBPrice) {
                // Short Sell on Exchange A
                const exchangeA = this.getExchange('binance');
                const res = await this.executeShortSell(exchangeA as ccxt.binance, 'ETH/USDT', 0.005, exchangeAPrice);
                console.log(res);
                return res;

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
