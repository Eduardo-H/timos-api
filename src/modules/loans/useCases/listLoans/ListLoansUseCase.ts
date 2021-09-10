import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { Loan } from '@modules/loans/infra/typeorm/entities/Loan';
import { ILoansRepository } from '@modules/loans/repositories/ILoansRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

@injectable()
class ListLoansUseCase {
  constructor(
    @inject('LoansRepository')
    private loansRepository: ILoansRepository,
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  async execute(user_id: string): Promise<Loan[]> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('User not found');
    }

    const loans = await this.loansRepository.listByUserId(user_id);

    if (loans.length === 0) {
      throw new AppError('No loans found', 204);
    }

    return loans;
  }
}

export { ListLoansUseCase };
