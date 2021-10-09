import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { ContactsRequestsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRequestsRepositoryInMemory';
import { AcceptContactRequestUseCase } from '@modules/contacts/useCases/acceptContactRequest/AcceptContactRequestUseCase';
import { CreateContactRequestUseCase } from '@modules/contacts/useCases/createContactRequest/CreateContactRequestUseCase';
import { LoansRepositoryInMemory } from '@modules/loans/repositories/in-memory/LoansRepositoryInMemory';
import { createContact, createContactRequest, createUser } from '@utils/seed';

import { DayjsDateProvider } from '@shared/container/providers/DateProvider/implementations/DayjsDateProvider';
import { AppError } from '@shared/errors/AppError';

import { CreateLoanUseCase } from './CreateLoanUseCase';

let createLoanUseCase: CreateLoanUseCase;
let createUserUseCase: CreateUserUseCase;
let createContactRequestUseCase: CreateContactRequestUseCase;
let acceptContactRequestUseCase: AcceptContactRequestUseCase;

let loansRepositoryInMemory: LoansRepositoryInMemory;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let contactsRepositoryInMemory: ContactsRepositoryInMemory;
let contactsRequestsRepositoryInMemory: ContactsRequestsRepositoryInMemory;
let dateProvider: DayjsDateProvider;

let user_id: string;
let contact_id: string;

describe('Create Loan', () => {
  beforeEach(async () => {
    loansRepositoryInMemory = new LoansRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();
    contactsRequestsRepositoryInMemory =
      new ContactsRequestsRepositoryInMemory();
    dateProvider = new DayjsDateProvider();

    createLoanUseCase = new CreateLoanUseCase(
      loansRepositoryInMemory,
      contactsRepositoryInMemory,
      dateProvider
    );

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    acceptContactRequestUseCase = new AcceptContactRequestUseCase(
      contactsRequestsRepositoryInMemory,
      contactsRepositoryInMemory
    );
    createContactRequestUseCase = new CreateContactRequestUseCase(
      contactsRequestsRepositoryInMemory,
      usersRepositoryInMemory,
      contactsRepositoryInMemory
    );

    const user = await createUser(createUserUseCase, 'test@example.com');
    const contact = await createUser(createUserUseCase, 'new@example.com');

    const contactRequest = await createContactRequest(
      createContactRequestUseCase,
      user.id,
      contact.id
    );

    await createContact(
      acceptContactRequestUseCase,
      contactRequest.id,
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
    expect(result.payer_id).toEqual(user_id);
    expect(result.receiver_id).toEqual(contact_id);
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
    expect(result.payer_id).toEqual(user_id);
    expect(result.receiver_id).toEqual(contact_id);
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
    ).rejects.toEqual(new AppError("You're not connected to this user"));
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
