import { ICreateLoanDTO } from '@modules/loans/dtos/ICreateLoanDTO';
import { IUpdateLoanDTO } from '@modules/loans/dtos/IUpdateLoanDTO';
import { Loan } from '@modules/loans/infra/typeorm/entities/Loan';

import { ILoansRepository } from '../ILoansRepository';

class LoansRepositoryInMemory implements ILoansRepository {
  loans: Loan[] = [];

  async create({
    payer_id,
    receiver_id,
    value,
    type,
    fee,
    limit_date,
    creator_id
  }: ICreateLoanDTO): Promise<Loan> {
    const loan = new Loan();

    Object.assign(loan, {
      payer_id,
      receiver_id,
      value,
      type,
      fee,
      status: 'pendente',
      limit_date,
      created_at: new Date(),
      updated_at: new Date(),
      creator_id
    });

    this.loans.push(loan);

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
    const loan = this.loans.find((loan) => loan.id === id);

    Object.assign(loan, {
      payer_id,
      receiver_id,
      value,
      type,
      limit_date,
      closed_at,
      status
    });

    return loan;
  }

  async listByUserId(user_id: string): Promise<Loan[]> {
    const loans = this.loans.filter(
      (loan) => loan.payer_id === user_id || loan.receiver_id === user_id
    );
    return loans;
  }

  async deleteById(id: string): Promise<void> {
    const index = this.loans.findIndex((loan) => loan.id === id);

    this.loans.splice(index, 1);
  }

  async findById(id: string): Promise<Loan> {
    const loan = this.loans.find((loan) => loan.id === id);
    return loan;
  }

  async changeStatusById(id: string, status: string): Promise<void> {
    const loan = this.loans.find((loan) => loan.id === id);

    loan.status = status;
  }
}

export { LoansRepositoryInMemory };
