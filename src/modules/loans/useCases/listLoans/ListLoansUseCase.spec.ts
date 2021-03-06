import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { ContactsRequestsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRequestsRepositoryInMemory';
import { AcceptContactRequestUseCase } from '@modules/contacts/useCases/acceptContactRequest/AcceptContactRequestUseCase';
import { CreateContactRequestUseCase } from '@modules/contacts/useCases/createContactRequest/CreateContactRequestUseCase';
import { LoansRepositoryInMemory } from '@modules/loans/repositories/in-memory/LoansRepositoryInMemory';
import { PaymentsRepositoryInMemory } from '@modules/loans/repositories/in-memory/PaymentsRepositoryInMemory';
import {
  createUser,
  createLoan,
  createContact,
  createPayment,
  createContactRequest
} from '@utils/seed';

import { DayjsDateProvider } from '@shared/container/providers/DateProvider/implementations/DayjsDateProvider';
import { AppError } from '@shared/errors/AppError';

import { CreateLoanUseCase } from '../createLoan/CreateLoanUseCase';
import { CreatePaymentUseCase } from '../createPayment/CreatePaymentUseCase';
import { ListLoansUseCase } from './ListLoansUseCase';

let listLoansUseCase: ListLoansUseCase;
let createLoanUseCase: CreateLoanUseCase;
let createUserUseCase: CreateUserUseCase;
let createContactRequestUseCase: CreateContactRequestUseCase;
let acceptContactRequestUseCase: AcceptContactRequestUseCase;
let createPaymentUseCase: CreatePaymentUseCase;

let loansRepositoryInMemory: LoansRepositoryInMemory;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let contactsRepositoryInMemory: ContactsRepositoryInMemory;
let contactsRequestsRepositoryInMemory: ContactsRequestsRepositoryInMemory;
let paymentsRepositoryInMemory: PaymentsRepositoryInMemory;
let dateProvider: DayjsDateProvider;

let loan_id: string;
let user_id: string;

describe('List Loans', () => {
  beforeEach(async () => {
    loansRepositoryInMemory = new LoansRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();
    contactsRequestsRepositoryInMemory =
      new ContactsRequestsRepositoryInMemory();
    paymentsRepositoryInMemory = new PaymentsRepositoryInMemory();
    dateProvider = new DayjsDateProvider();

    listLoansUseCase = new ListLoansUseCase(
      loansRepositoryInMemory,
      paymentsRepositoryInMemory
    );

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
    createPaymentUseCase = new CreatePaymentUseCase(
      paymentsRepositoryInMemory,
      loansRepositoryInMemory
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

    const loan = await createLoan(
      createLoanUseCase,
      user.id,
      contact.id,
      dateProvider.addMonths(2)
    );
    await createLoan(
      createLoanUseCase,
      user.id,
      contact.id,
      dateProvider.addMonths(2)
    );

    loan_id = loan.id;
    user_id = user.id;
  });

  it("should be able to list the user's loans", async () => {
    const result = await listLoansUseCase.execute(user_id);

    expect(result.length).toBe(2);
    expect(result[0].payer_id).toEqual(user_id);
    expect(result[0].type).toEqual('pagar');
  });

  it("should be able to show the loan's payments", async () => {
    await createPayment(createPaymentUseCase, user_id, loan_id);

    const result = await listLoansUseCase.execute(user_id);

    expect(result.length).toBe(2);
    expect(result[0].payer_id).toEqual(user_id);
    expect(result[0].type).toEqual('pagar');
    expect(result[0].payments.length).toBe(1);
    expect(result[0].payments[0].value).toBe(50);
    expect(result[1].payments.length).toBe(0);
  });

  it('should return status code 204 when the user has no loans', async () => {
    await expect(listLoansUseCase.execute('123')).rejects.toEqual(
      new AppError('No loans found', 204)
    );
  });
});
