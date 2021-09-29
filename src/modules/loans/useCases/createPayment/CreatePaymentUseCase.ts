import { Payment } from '@modules/loans/infra/typeorm/entities/Payment';
import { ILoansRepository } from '@modules/loans/repositories/ILoansRepository';
import { IPaymentsRepository } from '@modules/loans/repositories/IPaymentsRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

interface IPayload {
  user_id: string;
  loan_id: string;
  value: number;
}

@injectable()
class CreatePaymentUseCase {
  constructor(
    @inject('PaymentsRepository')
    private paymentRepository: IPaymentsRepository,
    @inject('LoansRepository')
    private loansRepository: ILoansRepository
  ) {}

  async execute({ user_id, loan_id, value }: IPayload): Promise<Payment> {
    const loan = await this.loansRepository.findById(loan_id);

    if (!loan) {
      throw new AppError('Loan not found');
    }

    if (value < 1) {
      throw new AppError('The minimum payment value is 1');
    }

    if (user_id !== loan.payer_id && user_id !== loan.receiver_id) {
      throw new AppError('The loan does not belong to the user', 401);
    }

    const loanPayments = await this.paymentRepository.listByLoanId(loan_id);

    const payedValue = loanPayments.reduce((acc, payment) => {
      return acc + Number(payment.value);
    }, 0);

    if (value > loan.value - payedValue) {
      throw new AppError(
        'The payment value is greater than the remaining loan value'
      );
    }

    const payment = await this.paymentRepository.create({ loan_id, value });

    return payment;
  }
}

export { CreatePaymentUseCase };
