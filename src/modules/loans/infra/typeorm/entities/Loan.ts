import { User } from '@modules/accounts/infra/typeorm/entities/User';
import { Contact } from '@modules/contacts/infra/typeorm/entities/Contact';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn
} from 'typeorm';
import { v4 as uuid } from 'uuid';

export enum LoanType {
  PAY = 'pagar',
  RECEIVE = 'receber'
}

export enum Status {
  OPEN = 'aberto',
  PAYED = 'pago'
}

@Entity('loans')
class Loan {
  @PrimaryColumn()
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  contact_id: string;

  @ManyToOne(() => Contact)
  @JoinColumn({ name: 'contact_id' })
  contact: Contact;

  @Column()
  value: number;

  @Column()
  type: LoanType;

  @Column()
  status: Status;

  @Column()
  limit_date: Date;

  @Column()
  closed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  updated_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export { Loan };
