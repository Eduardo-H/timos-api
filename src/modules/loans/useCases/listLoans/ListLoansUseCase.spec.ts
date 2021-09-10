import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { CreateContactUseCase } from '@modules/contacts/useCases/createContact/CreateContactUseCase';
import { LoansRepositoryInMemory } from '@modules/loans/repositories/in-memory/LoansRepositoryInMemory';

import { AppError } from '@shared/errors/AppError';

import { CreateLoanUseCase } from '../createLoan/CreateLoanUseCase';
import { ListLoansUseCase } from './ListLoansUseCase';

let listLoansUseCase: ListLoansUseCase;
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

async function createLoans() {
  const user = await createUser('test@example.com');
  const contact = await createContact(user.id);

  await createLoanUseCase.execute({
    user_id: user.id,
    contact_id: contact.id,
    value: 50,
    type: 'pagar',
    limit_date: new Date()
  });

  await createLoanUseCase.execute({
    user_id: user.id,
    contact_id: contact.id,
    value: 150,
    type: 'receber',
    limit_date: new Date()
  });

  return user.id;
}

describe('List Loans', () => {
  beforeEach(() => {
    loansRepositoryInMemory = new LoansRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();

    listLoansUseCase = new ListLoansUseCase(
      loansRepositoryInMemory,
      usersRepositoryInMemory
    );

    createLoanUseCase = new CreateLoanUseCase(
      loansRepositoryInMemory,
      usersRepositoryInMemory,
      contactsRepositoryInMemory
    );

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);

    createContactUseCase = new CreateContactUseCase(contactsRepositoryInMemory);
  });

  it("should be able to list the user's loans", async () => {
    const user_id = await createLoans();

    const result = await listLoansUseCase.execute(user_id);

    expect(result.length).toBe(2);
    expect(result[0].user_id).toEqual(user_id);
    expect(result[0].type).toEqual('pagar');
  });

  it('should return status code 204 when the user has no loans', async () => {
    const user = await createUser('test@example.com');

    await expect(listLoansUseCase.execute(user.id)).rejects.toEqual(
      new AppError('No loans found', 204)
    );
  });

  it('should not be able to list the loans of a nonexistent user', async () => {
    await expect(listLoansUseCase.execute('123')).rejects.toEqual(
      new AppError('User not found')
    );
  });
});
