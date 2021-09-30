import { ILoansRepository } from '@modules/loans/repositories/ILoansRepository';
import { IPaymentsRepository } from '@modules/loans/repositories/IPaymentsRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

@injectable()
class ApprovePaymentUseCase {
  constructor(
    @inject('PaymentsRepository')
    private paymentsRepository: IPaymentsRepository,
    @inject('LoansRepository')
    private loansRepository: ILoansRepository
  ) {}

  async execute(id: string, user_id: string): Promise<void> {
    const payment = await this.paymentsRepository.findById(id);

    if (!payment) {
      throw new AppError('Payment not found');
    }

    const loan = await this.loansRepository.findById(payment.loan_id);

    if (user_id !== loan.receiver_id) {
      throw new AppError('Only the receiver can approve the payment', 401);
    }

    await this.paymentsRepository.updateStatusById(payment.id, 'aprovado');
  }
}

export { ApprovePaymentUseCase };
