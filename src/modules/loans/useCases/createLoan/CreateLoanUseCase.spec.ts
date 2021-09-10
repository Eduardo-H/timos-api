import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { CreateContactUseCase } from '@modules/contacts/useCases/createContact/CreateContactUseCase';
import { LoansRepositoryInMemory } from '@modules/loans/repositories/in-memory/LoansRepositoryInMemory';

import { AppError } from '@shared/errors/AppError';

import { CreateLoanUseCase } from './CreateLoanUseCase';

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

describe('Create Loan', () => {
  beforeEach(() => {
    loansRepositoryInMemory = new LoansRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();

    createLoanUseCase = new CreateLoanUseCase(
      loansRepositoryInMemory,
      usersRepositoryInMemory,
      contactsRepositoryInMemory
    );

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);

    createContactUseCase = new CreateContactUseCase(contactsRepositoryInMemory);
  });

  it('should be able to create a loan', async () => {
    const user = await createUser('test@example.com');
    const contact = await createContact(user.id);

    const result = await createLoanUseCase.execute({
      user_id: user.id,
      contact_id: contact.id,
      value: 50,
      type: 'pagar',
      limit_date: new Date()
    });

    expect(result).toHaveProperty('id');
    expect(result.user_id).toEqual(user.id);
    expect(result.contact_id).toEqual(contact.id);
    expect(result.value).toBe(50);
    expect(result.status).toEqual('aberto');
  });

  it("should not be able to create a loan with a contact that doesn't belong to the user", async () => {
    const user = await createUser('test@example.com');
    const contact = await createContact(user.id);

    const otherUser = await createUser('new@example.com');

    await expect(
      createLoanUseCase.execute({
        user_id: otherUser.id,
        contact_id: contact.id,
        value: 50,
        type: 'pagar',
        limit_date: new Date()
      })
    ).rejects.toEqual(
      new AppError('This contact does not belong to the user', 401)
    );
  });

  it('should not be able to create a loan with the value less than 1', async () => {
    const user = await createUser('test@example.com');
    const contact = await createContact(user.id);

    await expect(
      createLoanUseCase.execute({
        user_id: user.id,
        contact_id: contact.id,
        value: -10,
        type: 'pagar',
        limit_date: new Date()
      })
    ).rejects.toEqual(new AppError('The value must be greater than 0'));
  });

  it('should not be able to create a loan of a nonexistent user', async () => {
    const user = await createUser('test@example.com');
    const contact = await createContact(user.id);

    await expect(
      createLoanUseCase.execute({
        user_id: '123',
        contact_id: contact.id,
        value: 50,
        type: 'pagar',
        limit_date: new Date()
      })
    ).rejects.toEqual(new AppError('User not found'));
  });

  it('should not be able to create a loan of a nonexistent contact', async () => {
    const user = await createUser('test@example.com');

    await expect(
      createLoanUseCase.execute({
        user_id: user.id,
        contact_id: '123',
        value: 50,
        type: 'pagar',
        limit_date: new Date()
      })
    ).rejects.toEqual(new AppError('Contact not found'));
  });
});
