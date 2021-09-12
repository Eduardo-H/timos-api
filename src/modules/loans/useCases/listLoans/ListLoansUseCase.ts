import { Loan } from '@modules/loans/infra/typeorm/entities/Loan';
import { Payment } from '@modules/loans/infra/typeorm/entities/Payment';
import { ILoansRepository } from '@modules/loans/repositories/ILoansRepository';
import { IPaymentsRepository } from '@modules/loans/repositories/IPaymentsRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

@injectable()
class ListLoansUseCase {
  constructor(
    @inject('LoansRepository')
    private loansRepository: ILoansRepository,
    @inject('PaymentsRepository')
    private paymentsRepository: IPaymentsRepository
  ) {}

  async getLoanPayments(loan_id: string): Promise<Payment[]> {
    const payments = await this.paymentsRepository.listByLoanId(loan_id);
    return payments;
  }

  async execute(user_id: string): Promise<Loan[]> {
    const loans = await this.loansRepository.listByUserId(user_id);

    if (loans.length === 0) {
      throw new AppError('No loans found', 204);
    }

    const promises = [];

    loans.forEach((loan) => {
      promises.push(this.getLoanPayments(loan.id));
    });

    const payments = await Promise.all(promises);

    loans.forEach((loan, index) => {
      loan.setPayments(payments[index]);
    });

    return loans;
  }
}

export { ListLoansUseCase };
