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

@Entity('users_contacts')
class Contact {
  @PrimaryColumn()
  id: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  contact_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'contact_id' })
  contact: User;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export { Contact };
