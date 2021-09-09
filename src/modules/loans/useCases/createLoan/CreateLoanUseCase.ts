import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
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
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
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
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('User not found');
    }

    const contact = await this.contactsRepository.findById(contact_id);

    if (!contact) {
      throw new AppError('Contact not found');
    }

    if (user.id !== contact.user_id) {
      throw new AppError('This contact does not belong to the user', 401);
    }

    if (value < 1) {
      throw new AppError('The value must be greater than 0');
    }

    const loan = await this.loansRepository.create({
      user_id: user.id,
      contact_id: contact.id,
      value,
      type,
      limit_date
    });

    return loan;
  }
}

export { CreateLoanUseCase };
