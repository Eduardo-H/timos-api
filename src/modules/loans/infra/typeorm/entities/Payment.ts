import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from 'typeorm';
import { v4 as uuid } from 'uuid';

import { Loan } from './Loan';

@Entity('payments')
class Payment {
  @PrimaryColumn()
  id: string;

  @Column()
  loan_id: string;

  @ManyToOne(() => Loan)
  @JoinColumn({ name: 'loan_id' })
  loan: Loan;

  @Column()
  value: number;

  @Column()
  status: string;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export { Payment };
