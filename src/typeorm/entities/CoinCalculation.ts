import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CoinCalculation {
    @PrimaryGeneratedColumn('uuid')
        coin_calculation_id!: string;

    @Column('varchar', { nullable: false, length: 60 })
        pair!: string;

    @Column('varchar', { nullable: false, length: 60 })
        exchange_one!: string;

    @Column('varchar', { nullable: false, length: 60 })
        exchange_two!: string;

    @Column({ type: 'bigint' })
        timestamp?: string;

    @Column('decimal', { precision: 20, scale: 4, default: 0 })
        perc_difference!: number;

    @Column('decimal', { precision: 20, scale: 4, default: 0 })
        ticker_one_depth!: number;

    @Column('decimal', { precision: 20, scale: 4, default: 0 })
        ticker_two_depth!: number;

    @Column('decimal', { precision: 20, scale: 4, default: 0 })
        ticker_one_depth_minus!: number;
   
    @Column('decimal', { precision: 20, scale: 4, default: 0 })
        ticker_two_depth_minus!: number;

    @Column('decimal', { precision: 20, scale: 4, default: 0 })
        spread_one!: number;
   
    @Column('decimal', { precision: 20, scale: 4, default: 0 })
        spread_two!: number;

    @Column('decimal', { precision: 20, scale: 4, default: 0 })
        volume_day_one!: number;
   
    @Column('decimal', { precision: 20, scale: 4, default: 0 })
        volume_day_two!: number;
}
