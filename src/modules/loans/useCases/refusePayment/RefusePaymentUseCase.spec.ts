import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { CreateContactUseCase } from '@modules/contacts/useCases/createContact/CreateContactUseCase';
import { LoansRepositoryInMemory } from '@modules/loans/repositories/in-memory/LoansRepositoryInMemory';
import { PaymentsRepositoryInMemory } from '@modules/loans/repositories/in-memory/PaymentsRepositoryInMemory';
import {
  createContact,
  createLoan,
  createPayment,
  createUser
} from '@utils/seed';

import { DayjsDateProvider } from '@shared/container/providers/DateProvider/implementations/DayjsDateProvider';
import { AppError } from '@shared/errors/AppError';

import { CreateLoanUseCase } from '../createLoan/CreateLoanUseCase';
import { CreatePaymentUseCase } from '../createPayment/CreatePaymentUseCase';
import { RefusePaymentUseCase } from './RefusePaymentUseCase';

let refusePaymentUseCase: RefusePaymentUseCase;
let createPaymentUseCase: CreatePaymentUseCase;
let createUserUseCase: CreateUserUseCase;
let createContactUseCase: CreateContactUseCase;
let createLoanUseCase: CreateLoanUseCase;
let paymentsRepositoryInMemory: PaymentsRepositoryInMemory;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let contactsRepositoryInMemory: ContactsRepositoryInMemory;
let loansRepositoryInMemory: LoansRepositoryInMemory;
let dateProvider: DayjsDateProvider;

let user_id: string;
let contact_id: string;
let payment_id: string;

describe('Refuse Payment', () => {
  beforeEach(async () => {
    paymentsRepositoryInMemory = new PaymentsRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();
    loansRepositoryInMemory = new LoansRepositoryInMemory();
    dateProvider = new DayjsDateProvider();

    refusePaymentUseCase = new RefusePaymentUseCase(
      paymentsRepositoryInMemory,
      loansRepositoryInMemory
    );

    createPaymentUseCase = new CreatePaymentUseCase(
      paymentsRepositoryInMemory,
      loansRepositoryInMemory
    );
    createContactUseCase = new CreateContactUseCase(contactsRepositoryInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createLoanUseCase = new CreateLoanUseCase(
      loansRepositoryInMemory,
      contactsRepositoryInMemory,
      dateProvider
    );

    const user = await createUser(createUserUseCase, 'test@example.com');
    const contact = await createUser(createUserUseCase, 'new@example.com');

    await createContact(createContactUseCase, user.id, contact.id);

    const loan = await createLoan(
      createLoanUseCase,
      user.id,
      contact.id,
      dateProvider.addMonths(2)
    );

    const payment = await createPayment(createPaymentUseCase, user.id, loan.id);

    user_id = user.id;
    contact_id = contact.id;
    payment_id = payment.id;
  });

  it('should be able to refuse a payment', async () => {
    const result = await refusePaymentUseCase.execute(payment_id, contact_id);

    expect(result).toBeUndefined();
  });

  it('should not be able to refuse a nonexistent payment', async () => {
    await expect(
      refusePaymentUseCase.execute('123', contact_id)
    ).rejects.toEqual(new AppError('Payment not found'));
  });

  it('should not allow the payer to refuse a payment', async () => {
    await expect(
      refusePaymentUseCase.execute(payment_id, user_id)
    ).rejects.toEqual(
      new AppError('Only the receiver can refuse the payment', 401)
    );
  });
});
