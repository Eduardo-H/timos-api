import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { CreateContactUseCase } from '@modules/contacts/useCases/createContact/CreateContactUseCase';
import { LoansRepositoryInMemory } from '@modules/loans/repositories/in-memory/LoansRepositoryInMemory';
import { createContact, createLoan, createUser } from '@utils/seed';

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

let user_id: string;
let loan_id: string;

describe('Delete Loan', () => {
  beforeEach(async () => {
    loansRepositoryInMemory = new LoansRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();

    deleteLoanUseCase = new DeleteLoanUseCase(loansRepositoryInMemory);

    createLoanUseCase = new CreateLoanUseCase(
      loansRepositoryInMemory,
      contactsRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createContactUseCase = new CreateContactUseCase(contactsRepositoryInMemory);

    const user = await createUser(createUserUseCase, 'test@example.com');
    const contact = await createContact(
      createContactUseCase,
      'John Doe',
      user.id
    );
    const loan = await createLoan(createLoanUseCase, user.id, contact.id);

    user_id = user.id;
    loan_id = loan.id;
  });

  it('should be able to delete a loan', async () => {
    const result = await deleteLoanUseCase.execute({
      id: loan_id,
      user_id
    });

    expect(result).toBeUndefined();
  });

  it('should not be able to delete a nonexistent loan', async () => {
    await expect(
      deleteLoanUseCase.execute({
        id: '123',
        user_id
      })
    ).rejects.toEqual(new AppError('Loan not found'));
  });

  it('should not be able to delete a loan of another user', async () => {
    const newUser = await createUser(createUserUseCase, 'new@example.com');

    await expect(
      deleteLoanUseCase.execute({
        id: loan_id,
        user_id: newUser.id
      })
    ).rejects.toEqual(new AppError('Loan does not belong to the user', 401));
  });
});
