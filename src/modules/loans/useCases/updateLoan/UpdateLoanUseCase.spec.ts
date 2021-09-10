import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { CreateContactUseCase } from '@modules/contacts/useCases/createContact/CreateContactUseCase';
import { LoanType, Status } from '@modules/loans/infra/typeorm/entities/Loan';
import { LoansRepositoryInMemory } from '@modules/loans/repositories/in-memory/LoansRepositoryInMemory';

import { AppError } from '@shared/errors/AppError';

import { CreateLoanUseCase } from '../createLoan/CreateLoanUseCase';
import { UpdateLoanUseCase } from './UpdateLoanUseCase';

let updateLoanUseCase: UpdateLoanUseCase;
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

async function createLoan(user_id: string, contact_id: string) {
  const loan = await createLoanUseCase.execute({
    user_id,
    contact_id,
    value: 50,
    type: LoanType.PAY,
    limit_date: new Date()
  });

  return loan;
}

describe('Update Loan', () => {
  beforeEach(() => {
    loansRepositoryInMemory = new LoansRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();

    updateLoanUseCase = new UpdateLoanUseCase(
      loansRepositoryInMemory,
      usersRepositoryInMemory,
      contactsRepositoryInMemory
    );

    createLoanUseCase = new CreateLoanUseCase(
      loansRepositoryInMemory,
      usersRepositoryInMemory,
      contactsRepositoryInMemory
    );

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);

    createContactUseCase = new CreateContactUseCase(contactsRepositoryInMemory);
  });

  it('should be able to update a loan', async () => {
    const user = await createUser('test@example.com');
    const contact = await createContact(user.id);
    const loan = await createLoan(user.id, contact.id);

    const result = await updateLoanUseCase.execute({
      id: loan.id,
      user_id: loan.user_id,
      contact_id: loan.contact_id,
      value: 100,
      type: LoanType.RECEIVE,
      limit_date: loan.limit_date,
      closed_at: loan.closed_at,
      status: loan.status
    });

    expect(result).toHaveProperty('id');
    expect(result.user_id).toEqual(user.id);
    expect(result.contact_id).toEqual(contact.id);
    expect(result.value).toBe(100);
    expect(result.type).toEqual(LoanType.RECEIVE);
  });

  it("should not be able to update a loan with a contact that doesn't belong to the user", async () => {
    const user = await createUser('test@example.com');
    const contact = await createContact(user.id);

    const otherUser = await createUser('new@example.com');

    const loan = await createLoan(user.id, contact.id);

    await expect(
      updateLoanUseCase.execute({
        id: loan.id,
        user_id: otherUser.id,
        contact_id: loan.contact_id,
        value: 100,
        type: LoanType.RECEIVE,
        limit_date: loan.limit_date,
        closed_at: loan.closed_at,
        status: loan.status
      })
    ).rejects.toEqual(
      new AppError('This contact does not belong to the user', 401)
    );
  });

  it('should not be able to update a loan with the value less than 1', async () => {
    const user = await createUser('test@example.com');
    const contact = await createContact(user.id);
    const loan = await createLoan(user.id, contact.id);

    await expect(
      updateLoanUseCase.execute({
        id: loan.id,
        user_id: loan.user_id,
        contact_id: loan.contact_id,
        value: -1000,
        type: LoanType.RECEIVE,
        limit_date: loan.limit_date,
        closed_at: loan.closed_at,
        status: loan.status
      })
    ).rejects.toEqual(new AppError('The value must be greater than 0'));
  });

  it('should not be able to update a nonexistent loan', async () => {
    const user = await createUser('test@example.com');
    const contact = await createContact(user.id);

    await expect(
      updateLoanUseCase.execute({
        id: '123',
        user_id: user.id,
        contact_id: contact.id,
        value: 100,
        type: LoanType.RECEIVE,
        limit_date: new Date(),
        closed_at: null,
        status: Status.OPEN
      })
    ).rejects.toEqual(new AppError('Loan not found'));
  });

  it('should not be able to update a loan of a nonexistent user', async () => {
    const user = await createUser('test@example.com');
    const contact = await createContact(user.id);
    const loan = await createLoan(user.id, contact.id);

    await expect(
      updateLoanUseCase.execute({
        id: loan.id,
        user_id: '123',
        contact_id: loan.contact_id,
        value: 100,
        type: LoanType.RECEIVE,
        limit_date: loan.limit_date,
        closed_at: loan.closed_at,
        status: loan.status
      })
    ).rejects.toEqual(new AppError('User not found'));
  });

  it('should not be able to update a loan of a nonexistent contact', async () => {
    const user = await createUser('test@example.com');
    const contact = await createContact(user.id);
    const loan = await createLoan(user.id, contact.id);

    await expect(
      updateLoanUseCase.execute({
        id: loan.id,
        user_id: user.id,
        contact_id: '123',
        value: 50,
        type: LoanType.RECEIVE,
        limit_date: loan.limit_date,
        closed_at: loan.closed_at,
        status: loan.status
      })
    ).rejects.toEqual(new AppError('Contact not found'));
  });
});
