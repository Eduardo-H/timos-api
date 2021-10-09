import { User } from '@modules/accounts/infra/typeorm/entities/User';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from 'typeorm';
import { v4 as uuid } from 'uuid';

import { Payment } from './Payment';

@Entity('loans')
class Loan {
  @PrimaryColumn()
  id: string;

  @Column()
  payer_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'payer_id' })
  payer: User;

  @Column()
  receiver_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column()
  value: number;

  @Column()
  type: string;

  @Column()
  fee?: number;

  @Column()
  status: string;

  @Column()
  limit_date: Date;

  @Column()
  creator_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column()
  closed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  updated_at: Date;

  payments?: Payment[];

  setPayments(payments: Payment[]): void {
    this.payments = payments;
  }

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export { Loan };
