import { IContactsRepository } from '@modules/contacts/repositories/IContactsRepository';
import { ICreateLoanDTO } from '@modules/loans/dtos/ICreateLoanDTO';
import { Loan } from '@modules/loans/infra/typeorm/entities/Loan';
import { ILoansRepository } from '@modules/loans/repositories/ILoansRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

@injectable()
class CreateLoanUseCase {
  constructor(
    @inject('LoansRepository')
    private loansRepository: ILoansRepository,
    @inject('ContactsRepository')
    private contactsRepository: IContactsRepository
  ) {}

  async execute({
    user_id,
    contact_id,
    value,
    type,
    limit_date
  }: ICreateLoanDTO): Promise<Loan> {
    const contact = await this.contactsRepository.findById(contact_id);

    if (!contact) {
      throw new AppError('Contact not found');
    }

    if (user_id !== contact.user_id) {
      throw new AppError('This contact does not belong to the user', 401);
    }

    if (value < 1) {
      throw new AppError('The minimum loan value is 1');
    }

    const loan = await this.loansRepository.create({
      user_id,
      contact_id: contact.id,
      value,
      type,
      limit_date
    });

    return loan;
  }
}

export { CreateLoanUseCase };
