import { User } from '@modules/accounts/infra/typeorm/entities/User';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { Contact } from '@modules/contacts/infra/typeorm/entities/Contact';
import { CreateContactUseCase } from '@modules/contacts/useCases/createContact/CreateContactUseCase';
import { Loan } from '@modules/loans/infra/typeorm/entities/Loan';
import { Payment } from '@modules/loans/infra/typeorm/entities/Payment';
import { CreateLoanUseCase } from '@modules/loans/useCases/createLoan/CreateLoanUseCase';
import { CreatePaymentUseCase } from '@modules/loans/useCases/createPayment/CreatePaymentUseCase';

async function createUser(
  createUserUseCase: CreateUserUseCase,
  email: string
): Promise<User> {
  const user = await createUserUseCase.execute({
    email,
    password: '12345'
  });
  return user;
}

async function createContact(
  createContactUseCase: CreateContactUseCase,
  name: string,
  user_id: string
): Promise<Contact> {
  const contact = await createContactUseCase.execute({
    name,
    user_id
  });
  return contact;
}

async function createLoan(
  createLoanUseCase: CreateLoanUseCase,
  user_id: string,
  contact_id: string
): Promise<Loan> {
  const loan = await createLoanUseCase.execute({
    user_id,
    contact_id,
    value: 100,
    type: 'pagar',
    limit_date: new Date('2030-06-01')
  });
  return loan;
}

async function createPayment(
  createPaymentUseCase: CreatePaymentUseCase,
  user_id: string,
  loan_id: string
): Promise<Payment> {
  const payment = await createPaymentUseCase.execute({
    user_id,
    loan_id,
    value: 50
  });
  return payment;
}

export { createUser, createContact, createLoan, createPayment };
