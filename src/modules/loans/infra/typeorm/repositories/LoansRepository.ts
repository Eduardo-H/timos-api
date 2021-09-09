import { ICreateLoanDTO } from '@modules/loans/dtos/ICreateLoanDTO';
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
}

export { LoansRepository };
