import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { CreateContactUseCase } from '@modules/contacts/useCases/createContact/CreateContactUseCase';
import { LoansRepositoryInMemory } from '@modules/loans/repositories/in-memory/LoansRepositoryInMemory';
import { createContact, createUser } from '@utils/seed';

import { DayjsDateProvider } from '@shared/container/providers/DateProvider/implementations/DayjsDateProvider';
import { AppError } from '@shared/errors/AppError';

import { CreateLoanUseCase } from './CreateLoanUseCase';

let createLoanUseCase: CreateLoanUseCase;
let createUserUseCase: CreateUserUseCase;
let createContactUseCase: CreateContactUseCase;
let loansRepositoryInMemory: LoansRepositoryInMemory;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let contactsRepositoryInMemory: ContactsRepositoryInMemory;
let dateProvider: DayjsDateProvider;

let user_id: string;
let contact_id: string;

describe('Create Loan', () => {
  beforeEach(async () => {
    loansRepositoryInMemory = new LoansRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();
    dateProvider = new DayjsDateProvider();

    createLoanUseCase = new CreateLoanUseCase(
      loansRepositoryInMemory,
      contactsRepositoryInMemory,
      dateProvider
    );

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createContactUseCase = new CreateContactUseCase(contactsRepositoryInMemory);

    const user = await createUser(createUserUseCase, 'test@example.com');
    const contact = await createContact(
      createContactUseCase,
      'John Doe',
      user.id
    );

    user_id = user.id;
    contact_id = contact.id;
  });

  it('should be able to create a loan', async () => {
    const result = await createLoanUseCase.execute({
      user_id,
      contact_id,
      value: 50,
      type: 'pagar',
      limit_date: dateProvider.addMonths(2)
    });

    expect(result).toHaveProperty('id');
    expect(result.user_id).toEqual(user_id);
    expect(result.contact_id).toEqual(contact_id);
    expect(result.value).toBe(50);
    expect(result.status).toEqual('aberto');
  });

  it('should be able to create a loan with fee', async () => {
    const result = await createLoanUseCase.execute({
      user_id,
      contact_id,
      value: 1000,
      type: 'pagar',
      fee: 1,
      limit_date: dateProvider.addMonths(2)
    });

    expect(result).toHaveProperty('id');
    expect(result.user_id).toEqual(user_id);
    expect(result.contact_id).toEqual(contact_id);
    expect(result.value).toBe(1020);
    expect(result.status).toEqual('aberto');
  });

  it('should not be able to create a loan of a nonexistent contact', async () => {
    await expect(
      createLoanUseCase.execute({
        user_id,
        contact_id: '123',
        value: 50,
        type: 'pagar',
        limit_date: dateProvider.addMonths(2)
      })
    ).rejects.toEqual(new AppError('Contact not found'));
  });

  it("should not be able to create a loan with a contact that doesn't belong to the user", async () => {
    const newUser = await createUser(createUserUseCase, 'new@example.com');

    await expect(
      createLoanUseCase.execute({
        user_id: newUser.id,
        contact_id,
        value: 50,
        type: 'pagar',
        limit_date: dateProvider.addMonths(2)
      })
    ).rejects.toEqual(
      new AppError('This contact does not belong to the user', 401)
    );
  });

  it('should not be able to create a loan with the value less than 1', async () => {
    await expect(
      createLoanUseCase.execute({
        user_id,
        contact_id,
        value: -10,
        type: 'pagar',
        limit_date: dateProvider.addMonths(2)
      })
    ).rejects.toEqual(new AppError('The minimum loan value is 1'));
  });
});
