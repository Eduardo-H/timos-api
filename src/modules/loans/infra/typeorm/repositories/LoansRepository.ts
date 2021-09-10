import { ICreateLoanDTO } from '@modules/loans/dtos/ICreateLoanDTO';
import { IUpdateLoanDTO } from '@modules/loans/dtos/IUpdateLoanDTO';
import { ILoansRepository } from '@modules/loans/repositories/ILoansRepository';
import { getRepository, Repository } from 'typeorm';

import { Loan, Status } from '../entities/Loan';

class LoansRepository implements ILoansRepository {
  private repository: Repository<Loan>;

  constructor() {
    this.repository = getRepository(Loan);
  }

  async create({
    user_id,
    contact_id,
    value,
    type,
    limit_date
  }: ICreateLoanDTO): Promise<Loan> {
    const loan = this.repository.create({
      user_id,
      contact_id,
      value,
      status: Status.OPEN,
      type,
      limit_date
    });

    await this.repository.save(loan);

    return loan;
  }

  async update({
    id,
    user_id,
    contact_id,
    value,
    type,
    limit_date,
    closed_at,
    status
  }: IUpdateLoanDTO): Promise<Loan> {
    const loan = this.repository.create({
      id,
      user_id,
      contact_id,
      value,
      type,
      limit_date,
      closed_at,
      status
    });

    await this.repository.save(loan);

    return loan;
  }

  async findById(id: string): Promise<Loan> {
    const loan = await this.repository.findOne({ id });
    return loan;
  }
}

export { LoansRepository };