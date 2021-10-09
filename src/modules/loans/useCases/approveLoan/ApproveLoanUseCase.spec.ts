import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { ContactsRequestsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRequestsRepositoryInMemory';
import { AcceptContactRequestUseCase } from '@modules/contacts/useCases/acceptContactRequest/AcceptContactRequestUseCase';
import { CreateContactRequestUseCase } from '@modules/contacts/useCases/createContactRequest/CreateContactRequestUseCase';
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
import { ApproveLoanUseCase } from './ApproveLoanUseCase';

let approveLoanUseCase: ApproveLoanUseCase;
let createUserUseCase: CreateUserUseCase;
let createContactRequestUseCase: CreateContactRequestUseCase;
let acceptContactRequestUseCase: AcceptContactRequestUseCase;
let createLoanUseCase: CreateLoanUseCase;

let usersRepositoryInMemory: UsersRepositoryInMemory;
let contactsRepositoryInMemory: ContactsRepositoryInMemory;
let contactsRequestsRepositoryInMemory: ContactsRequestsRepositoryInMemory;
let loansRepositoryInMemory: LoansRepositoryInMemory;
let dateProvider: DayjsDateProvider;

let user_id: string;
let contact_id: string;
let loan_id: string;

describe('Approve Loan', () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();
    contactsRequestsRepositoryInMemory =
      new ContactsRequestsRepositoryInMemory();
    loansRepositoryInMemory = new LoansRepositoryInMemory();
    dateProvider = new DayjsDateProvider();

    approveLoanUseCase = new ApproveLoanUseCase(loansRepositoryInMemory);

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
    contact_id = contact.id;
    loan_id = loan.id;
  });

  it('should be able to approve a loan', async () => {
    const result = await approveLoanUseCase.execute({
      id: loan_id,
      user_id: contact_id
    });

    expect(result).toBeUndefined();
  });

  it('should not be able to approve a nonexistent loan', async () => {
    await expect(
      approveLoanUseCase.execute({ id: '123', user_id: contact_id })
    ).rejects.toEqual(new AppError('Loan not found'));
  });

  it('should not allow user that created the loan to approve it', async () => {
    await expect(
      approveLoanUseCase.execute({ id: loan_id, user_id })
    ).rejects.toEqual(
      new AppError('This user is not allowed to approve this loan', 401)
    );
  });
});
