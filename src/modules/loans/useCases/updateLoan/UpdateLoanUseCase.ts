import { IContactsRepository } from '@modules/contacts/repositories/IContactsRepository';
import { IUpdateLoanDTO } from '@modules/loans/dtos/IUpdateLoanDTO';
import { Loan } from '@modules/loans/infra/typeorm/entities/Loan';
import { ILoansRepository } from '@modules/loans/repositories/ILoansRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

@injectable()
class UpdateLoanUseCase {
  constructor(
    @inject('LoansRepository')
    private loansRepository: ILoansRepository,
    @inject('ContactsRepository')
    private contactsRepository: IContactsRepository
  ) {}

  async execute({
    id,
    user_id,
    contact_id,
    value,
    type,
    limit_date,
    closed_at,
    status
  }: IUpdateLoanDTO): Promise<Loan> {
    const loan = await this.loansRepository.findById(id);

    if (!loan) {
      throw new AppError('Loan not found');
    }

    const contact = await this.contactsRepository.findById(contact_id);

    if (!contact) {
      throw new AppError('Contact not found');
    }

    if (user_id !== contact.user_id) {
      throw new AppError('This contact does not belong to the user', 401);
    }

    if (value < 1) {
      throw new AppError('The value must be greater than 0');
    }

    const updatedLoan = await this.loansRepository.update({
      id,
      user_id,
      contact_id: contact.id,
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
