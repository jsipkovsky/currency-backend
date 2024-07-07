import { DataSource } from 'typeorm';
import { CoinCalculation } from '../typeorm/entities/CoinCalculation';

import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.HOST,
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
  entities: [
    CoinCalculation
  ],
  synchronize: false,
  logging: false,
  ...(!process.env.LOCAL && {
    ssl: {
      rejectUnauthorized: false
    }
  })
});
