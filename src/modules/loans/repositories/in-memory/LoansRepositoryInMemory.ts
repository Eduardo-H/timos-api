import { ICreateLoanDTO } from '@modules/loans/dtos/ICreateLoanDTO';
import { Loan, Status } from '@modules/loans/infra/typeorm/entities/Loan';

import { ILoansRepository } from '../ILoansRepository';

class LoansRepositoryInMemory implements ILoansRepository {
  loans: Loan[] = [];

  async create({
    user_id,
    contact_id,
    value,
    type,
    limit_date
  }: ICreateLoanDTO): Promise<Loan> {
    const loan = new Loan();

    Object.assign(loan, {
      user_id,
      contact_id,
      value,
      type,
      status: Status.OPEN,
      limit_date,
      created_at: new Date(),
      updated_at: new Date()
    });

    this.loans.push(loan);

    return loan;
  }
}

export { LoansRepositoryInMemory };
