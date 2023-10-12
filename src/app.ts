import express from 'express';
import cors from 'cors';
import currencyRatesRoute from './routes/currencyRates';

const app = express();

app.use(cors());
app.use('/api', currencyRatesRoute);

export default app;
