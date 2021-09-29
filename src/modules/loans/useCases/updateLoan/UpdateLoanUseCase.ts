import { Loan } from '@modules/loans/infra/typeorm/entities/Loan';
import { ILoansRepository } from '@modules/loans/repositories/ILoansRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

interface IPayload {
  id: string;
  user_id: string;
  value: number;
  type: string;
  limit_date: Date;
  closed_at: Date | null;
  status: string;
}

@injectable()
class UpdateLoanUseCase {
  constructor(
    @inject('LoansRepository')
    private loansRepository: ILoansRepository
  ) {}

  async execute({
    id,
    user_id,
    value,
    type,
    limit_date,
    closed_at,
    status
  }: IPayload): Promise<Loan> {
    const loan = await this.loansRepository.findById(id);

    if (!loan) {
      throw new AppError('Loan not found');
    }

    if (user_id !== loan.payer_id && user_id !== loan.receiver_id) {
      throw new AppError('This loan does not belong to the user', 401);
    }

    if (value < 1) {
      throw new AppError('The value must be greater than 0');
    }

    let payer_id: string;
    let receiver_id: string;

    if (type !== loan.type) {
      payer_id = loan.receiver_id;
      receiver_id = loan.payer_id;
    } else {
      payer_id = loan.payer_id;
      receiver_id = loan.receiver_id;
    }

    const updatedLoan = await this.loansRepository.update({
      id,
      payer_id,
      receiver_id,
      value,
      type,
      limit_date,
      closed_at,
      status
    });

    return updatedLoan;
  }
}

export { UpdateLoanUseCase };
