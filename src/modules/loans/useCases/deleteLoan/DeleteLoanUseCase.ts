import { ILoansRepository } from '@modules/loans/repositories/ILoansRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

interface IPayload {
  id: string;
  user_id: string;
}

@injectable()
class DeleteLoanUseCase {
  constructor(
    @inject('LoansRepository')
    private loansRepository: ILoansRepository
  ) {}

  async execute({ id, user_id }: IPayload): Promise<void> {
    const loan = await this.loansRepository.findById(id);

    if (!loan) {
      throw new AppError('Loan not found');
    }

    if (user_id !== loan.payer_id && user_id !== loan.receiver_id) {
      throw new AppError('Loan does not belong to the user', 401);
    }

    await this.loansRepository.deleteById(id);
  }
}

export { DeleteLoanUseCase };
