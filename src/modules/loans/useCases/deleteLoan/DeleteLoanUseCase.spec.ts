import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { CreateContactUseCase } from '@modules/contacts/useCases/createContact/CreateContactUseCase';
import { LoanType } from '@modules/loans/infra/typeorm/entities/Loan';
import { LoansRepositoryInMemory } from '@modules/loans/repositories/in-memory/LoansRepositoryInMemory';

import { AppError } from '@shared/errors/AppError';

import { CreateLoanUseCase } from '../createLoan/CreateLoanUseCase';
import { DeleteLoanUseCase } from './DeleteLoanUseCase';

let deleteLoanUseCase: DeleteLoanUseCase;
let createLoanUseCase: CreateLoanUseCase;
let createUserUseCase: CreateUserUseCase;
let createContactUseCase: CreateContactUseCase;
let loansRepositoryInMemory: LoansRepositoryInMemory;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let contactsRepositoryInMemory: ContactsRepositoryInMemory;

async function createUser(email: string) {
  const user = await createUserUseCase.execute({
    email,
    password: '12345'
  });

  return user;
}

async function createContact(user_id: string) {
  const contact = await createContactUseCase.execute({
    name: 'John Doe',
    user_id
  });

  return contact;
}

async function createLoan(user_id: string, contact_id: string) {
  const loan = await createLoanUseCase.execute({
    user_id,
    contact_id,
    value: 50,
    type: LoanType.PAY,
    limit_date: new Date()
  });

  return loan;
}

describe('Delete Loan', () => {
  beforeEach(() => {
    loansRepositoryInMemory = new LoansRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();

    deleteLoanUseCase = new DeleteLoanUseCase(loansRepositoryInMemory);

    createLoanUseCase = new CreateLoanUseCase(
      loansRepositoryInMemory,
      usersRepositoryInMemory,
      contactsRepositoryInMemory
    );

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);

    createContactUseCase = new CreateContactUseCase(contactsRepositoryInMemory);
  });

  it('should be able to delete a loan', async () => {
    const user = await createUser('test@example.com');
    const contact = await createContact(user.id);
    const loan = await createLoan(user.id, contact.id);

    const result = await deleteLoanUseCase.execute({
      id: loan.id,
      user_id: user.id
    });

    expect(result).toBeUndefined();
  });

  it('should not be able to delete a nonexistent loan', async () => {
    const user = await createUser('test@example.com');

    await expect(
      deleteLoanUseCase.execute({
        id: '123',
        user_id: user.id
      })
    ).rejects.toEqual(new AppError('Loan not found'));
  });

  it('should not be able to delete a loan of another user', async () => {
    const user = await createUser('test@example.com');
    const contact = await createContact(user.id);
    const loan = await createLoan(user.id, contact.id);

    const otherUser = await createUser('new@example.com');

    await expect(
      deleteLoanUseCase.execute({
        id: loan.id,
        user_id: otherUser.id
      })
    ).rejects.toEqual(new AppError('Loan does not belong to the user', 401));
  });
});
