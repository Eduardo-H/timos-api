import { ICreateLoanDTO } from '@modules/loans/dtos/ICreateLoanDTO';
import { IUpdateLoanDTO } from '@modules/loans/dtos/IUpdateLoanDTO';
import { ILoansRepository } from '@modules/loans/repositories/ILoansRepository';
import { getRepository, Repository } from 'typeorm';

import { Loan } from '../entities/Loan';

class LoansRepository implements ILoansRepository {
  private repository: Repository<Loan>;

  constructor() {
    this.repository = getRepository(Loan);
  }

  async create({
    payer_id,
    receiver_id,
    value,
    type,
    fee,
    limit_date,
    creator_id
  }: ICreateLoanDTO): Promise<Loan> {
    const loan = this.repository.create({
      payer_id,
      receiver_id,
      value,
      fee,
      status: 'pendente',
      type,
      limit_date,
      creator_id
    });

    await this.repository.save(loan);

    return loan;
  }

  async update({
    id,
    payer_id,
    receiver_id,
    value,
    type,
    limit_date,
    closed_at,
    status
  }: IUpdateLoanDTO): Promise<Loan> {
    const loan = this.repository.create({
      id,
      payer_id,
      receiver_id,
      value,
      type,
      limit_date,
      closed_at,
      status
    });

    await this.repository.save(loan);

    return loan;
  }

  async listByUserId(user_id: string): Promise<Loan[]> {
    const loans = await this.repository.find({
      where: [{ payer_id: user_id }, { receiver_id: user_id }]
    });
    return loans;
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findById(id: string): Promise<Loan> {
    const loan = await this.repository.findOne({ id });
    return loan;
  }

  async changeStatusById(id: string, status: string): Promise<void> {
    const loan = await this.repository.findOne({ id });

    loan.status = status;

    this.repository.save(loan);
  }
}

export { LoansRepository };
