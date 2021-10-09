import { IContactsRepository } from '@modules/contacts/repositories/IContactsRepository';
import { Loan } from '@modules/loans/infra/typeorm/entities/Loan';
import { ILoansRepository } from '@modules/loans/repositories/ILoansRepository';
import { inject, injectable } from 'tsyringe';

import { IDateProvider } from '@shared/container/providers/DateProvider/IDateProvider';
import { AppError } from '@shared/errors/AppError';

interface IPayload {
  user_id: string;
  contact_id: string;
  value: number;
  type: string;
  fee?: number;
  limit_date: Date;
}

@injectable()
class CreateLoanUseCase {
  constructor(
    @inject('LoansRepository')
    private loansRepository: ILoansRepository,
    @inject('ContactsRepository')
    private contactsRepository: IContactsRepository,
    @inject('DayjsDateProvider')
    private dateProvider: IDateProvider
  ) {}

  async execute({
    user_id,
    contact_id,
    value,
    type,
    fee,
    limit_date
  }: IPayload): Promise<Loan> {
    const connection = await this.contactsRepository.findConnection(
      user_id,
      contact_id
    );

    if (!connection) {
      throw new AppError("You're not connected to this user");
    }

    if (value < 1) {
      throw new AppError('The minimum loan value is 1');
    }

    let finalValue = value;

    if (fee && fee > 0) {
      const monthlyFeeValue = value / (fee * 100);

      const loanDurationInMonths = this.dateProvider.compareInMonths(
        new Date(),
        limit_date
      );

      finalValue += monthlyFeeValue * loanDurationInMonths;
    }

    let payer_id: string;
    let receiver_id: string;

    if (type === 'pagar') {
      payer_id = user_id;
      receiver_id = contact_id;
    } else {
      payer_id = contact_id;
      receiver_id = user_id;
    }

    const loan = await this.loansRepository.create({
      payer_id,
      receiver_id,
      value: finalValue,
      type,
      fee,
      limit_date,
      creator_id: user_id
    });

    return loan;
  }
}

export { CreateLoanUseCase };
