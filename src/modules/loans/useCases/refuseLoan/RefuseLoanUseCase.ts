import { ILoansRepository } from '@modules/loans/repositories/ILoansRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

interface IPayload {
  id: string;
  user_id: string;
}

@injectable()
class RefuseLoanUseCase {
  constructor(
    @inject('LoansRepository')
    private loansRepository: ILoansRepository
  ) {}

  async execute({ id, user_id }: IPayload): Promise<void> {
    const loan = await this.loansRepository.findById(id);

    if (!loan) {
      throw new AppError('Loan not found');
    }

    if (loan.creator_id === user_id) {
      throw new AppError('This user is not allowed to refuse this loan', 401);
    }

    await this.loansRepository.deleteById(id);
  }
}

export { RefuseLoanUseCase };
