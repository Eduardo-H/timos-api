import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { ContactsRequestsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRequestsRepositoryInMemory';
import { AcceptContactRequestUseCase } from '@modules/contacts/useCases/acceptContactRequest/AcceptContactRequestUseCase';
import { CreateContactRequestUseCase } from '@modules/contacts/useCases/createContactRequest/CreateContactRequestUseCase';
import { LoansRepositoryInMemory } from '@modules/loans/repositories/in-memory/LoansRepositoryInMemory';
import { PaymentsRepositoryInMemory } from '@modules/loans/repositories/in-memory/PaymentsRepositoryInMemory';
import {
  createContact,
  createContactRequest,
  createLoan,
  createUser
} from '@utils/seed';

import { DayjsDateProvider } from '@shared/container/providers/DateProvider/implementations/DayjsDateProvider';
import { AppError } from '@shared/errors/AppError';

import { CreateLoanUseCase } from '../createLoan/CreateLoanUseCase';
import { CreatePaymentUseCase } from './CreatePaymentUseCase';

let createPaymentUseCase: CreatePaymentUseCase;
let createUserUseCase: CreateUserUseCase;
let createContactRequestUseCase: CreateContactRequestUseCase;
let acceptContactRequestUseCase: AcceptContactRequestUseCase;
let createLoanUseCase: CreateLoanUseCase;

let paymentsRepositoryInMemory: PaymentsRepositoryInMemory;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let contactsRepositoryInMemory: ContactsRepositoryInMemory;
let contactsRequestsRepositoryInMemory: ContactsRequestsRepositoryInMemory;
let loansRepositoryInMemory: LoansRepositoryInMemory;
let dateProvider: DayjsDateProvider;

let user_id: string;
let loan_id: string;

describe('Create Payment', () => {
  beforeEach(async () => {
    paymentsRepositoryInMemory = new PaymentsRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();
    contactsRequestsRepositoryInMemory =
      new ContactsRequestsRepositoryInMemory();
    loansRepositoryInMemory = new LoansRepositoryInMemory();
    dateProvider = new DayjsDateProvider();

    createPaymentUseCase = new CreatePaymentUseCase(
      paymentsRepositoryInMemory,
      loansRepositoryInMemory
    );

    acceptContactRequestUseCase = new AcceptContactRequestUseCase(
      contactsRequestsRepositoryInMemory,
      contactsRepositoryInMemory
    );
    createContactRequestUseCase = new CreateContactRequestUseCase(
      contactsRequestsRepositoryInMemory,
      usersRepositoryInMemory,
      contactsRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createLoanUseCase = new CreateLoanUseCase(
      loansRepositoryInMemory,
      contactsRepositoryInMemory,
      dateProvider
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

    user_id = user.id;
    loan_id = loan.id;
  });

  it('should be able to create a payment', async () => {
    const result = await createPaymentUseCase.execute({
      user_id,
      loan_id,
      value: 50
    });

    expect(result).toHaveProperty('id');
    expect(result.loan_id).toEqual(loan_id);
    expect(result.value).toBe(50);
    expect(result.status).toEqual('pendente');
  });

  it('should not be able to create a payment of a nonexistent loan', async () => {
    await expect(
      createPaymentUseCase.execute({
        user_id,
        loan_id: '123',
        value: 50
      })
    ).rejects.toEqual(new AppError('Loan not found'));
  });

  it('should not be able to create a payment for a loan of another user', async () => {
    await expect(
      createPaymentUseCase.execute({
        user_id: '123',
        loan_id,
        value: 50
      })
    ).rejects.toEqual(
      new AppError('The loan does not belong to the user', 401)
    );
  });

  it("should not be able to create a payment with a value greater than the loan's value", async () => {
    await expect(
      createPaymentUseCase.execute({
        user_id,
        loan_id,
        value: 150
      })
    ).rejects.toEqual(
      new AppError('The payment value is greater than the remaining loan value')
    );
  });

  it('should not be able to create a payment with a value lower than 1', async () => {
    await expect(
      createPaymentUseCase.execute({
        user_id,
        loan_id,
        value: -50
      })
    ).rejects.toEqual(new AppError('The minimum payment value is 1'));
  });
});
