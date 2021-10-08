import { User } from '@modules/accounts/infra/typeorm/entities/User';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { Contact } from '@modules/contacts/infra/typeorm/entities/Contact';
import { ContactRequest } from '@modules/contacts/infra/typeorm/entities/ContactRequest';
import { CreateContactUseCase } from '@modules/contacts/useCases/createContact/CreateContactUseCase';
import { CreateContactRequestUseCase } from '@modules/contacts/useCases/createContactRequest/CreateContactRequestUseCase';
import { Loan } from '@modules/loans/infra/typeorm/entities/Loan';
import { Payment } from '@modules/loans/infra/typeorm/entities/Payment';
import { CreateLoanUseCase } from '@modules/loans/useCases/createLoan/CreateLoanUseCase';
import { CreatePaymentUseCase } from '@modules/loans/useCases/createPayment/CreatePaymentUseCase';

async function createUser(
  createUserUseCase: CreateUserUseCase,
  email: string
): Promise<User> {
  const user = await createUserUseCase.execute({
    name: 'John Doe',
    email,
    password: '12345'
  });
  return user;
}

async function createContact(
  createContactUseCase: CreateContactUseCase,
  user_id: string,
  contact_id: string
): Promise<Contact> {
  const contact = await createContactUseCase.execute({
    user_id,
    contact_id
  });
  return contact;
}

async function createLoan(
  createLoanUseCase: CreateLoanUseCase,
  user_id: string,
  contact_id: string,
  limit_date: Date
): Promise<Loan> {
  const loan = await createLoanUseCase.execute({
    user_id,
    contact_id,
    value: 100,
    type: 'pagar',
    limit_date
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

async function createContactRequest(
  createContactRequestUseCase: CreateContactRequestUseCase,
  user_id: string,
  requester_id: string
): Promise<ContactRequest> {
  const contactRequest = await createContactRequestUseCase.execute({
    user_id,
    requester_id
  });
  return contactRequest;
}

export {
  createUser,
  createContact,
  createLoan,
  createPayment,
  createContactRequest
};
