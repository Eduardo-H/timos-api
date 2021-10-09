import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { ContactsRequestsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRequestsRepositoryInMemory';
import { AcceptContactRequestUseCase } from '@modules/contacts/useCases/acceptContactRequest/AcceptContactRequestUseCase';
import { CreateContactRequestUseCase } from '@modules/contacts/useCases/createContactRequest/CreateContactRequestUseCase';
import { Loan } from '@modules/loans/infra/typeorm/entities/Loan';
import { LoansRepositoryInMemory } from '@modules/loans/repositories/in-memory/LoansRepositoryInMemory';
import {
  createContact,
  createContactRequest,
  createLoan,
  createUser
} from '@utils/seed';

import { DayjsDateProvider } from '@shared/container/providers/DateProvider/implementations/DayjsDateProvider';
import { AppError } from '@shared/errors/AppError';

import { CreateLoanUseCase } from '../createLoan/CreateLoanUseCase';
import { UpdateLoanUseCase } from './UpdateLoanUseCase';

let updateLoanUseCase: UpdateLoanUseCase;
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
let loan: Loan;

describe('Update Loan', () => {
  beforeEach(async () => {
    loansRepositoryInMemory = new LoansRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();
    contactsRequestsRepositoryInMemory =
      new ContactsRequestsRepositoryInMemory();
    dateProvider = new DayjsDateProvider();

    updateLoanUseCase = new UpdateLoanUseCase(loansRepositoryInMemory);

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

    loan = await createLoan(
      createLoanUseCase,
      user.id,
      contact.id,
      dateProvider.addMonths(2)
    );

    user_id = user.id;
    contact_id = contact.id;
  });

  it('should be able to update a loan', async () => {
    const result = await updateLoanUseCase.execute({
      id: loan.id,
      user_id,
      value: 100,
      type: 'receber',
      limit_date: loan.limit_date,
      closed_at: loan.closed_at,
      status: loan.status
    });

    expect(result).toHaveProperty('id');
    expect(result.receiver_id).toEqual(user_id);
    expect(result.payer_id).toEqual(contact_id);
    expect(result.value).toBe(100);
    expect(result.type).toEqual('receber');
  });

  it("should not be able to update a loan with a contact that doesn't belong to the user", async () => {
    const newUser = await createUser(createUserUseCase, 'johndoe@example.com');

    await expect(
      updateLoanUseCase.execute({
        id: loan.id,
        user_id: newUser.id,
        value: 100,
        type: 'receber',
        limit_date: loan.limit_date,
        closed_at: loan.closed_at,
        status: loan.status
      })
    ).rejects.toEqual(
      new AppError('This loan does not belong to the user', 401)
    );
  });

  it('should not be able to update a loan with the value less than 1', async () => {
    await expect(
      updateLoanUseCase.execute({
        id: loan.id,
        user_id,
        value: -1000,
        type: 'receber',
        limit_date: loan.limit_date,
        closed_at: loan.closed_at,
        status: loan.status
      })
    ).rejects.toEqual(new AppError('The value must be greater than 0'));
  });

  it('should not be able to update a nonexistent loan', async () => {
    await expect(
      updateLoanUseCase.execute({
        id: '123',
        user_id,
        value: 100,
        type: 'receber',
        limit_date: new Date(),
        closed_at: null,
        status: 'aberto'
      })
    ).rejects.toEqual(new AppError('Loan not found'));
  });
});
