import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { ContactsRequestsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRequestsRepositoryInMemory';
import { createUser } from '@utils/seed';

import { AppError } from '@shared/errors/AppError';

import { CreateContactRequestUseCase } from '../createContactRequest/CreateContactRequestUseCase';
import { AcceptContactRequestUseCase } from './AcceptContactRequestUseCase';

let acceptContactRequestUseCase: AcceptContactRequestUseCase;
let createContactRequestUseCase: CreateContactRequestUseCase;
let createUserUseCase: CreateUserUseCase;
let contactsRequestsRepositoryInMemory: ContactsRequestsRepositoryInMemory;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let contactsRepositoryInMemory: ContactsRepositoryInMemory;

let request_id: string;
let user_id: string;
let contact_id: string;

describe('Accept Contact Request', () => {
  beforeEach(async () => {
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    contactsRequestsRepositoryInMemory =
      new ContactsRequestsRepositoryInMemory();

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

    const user = await createUser(createUserUseCase, 'test@example.com');
    const anotherUser = await createUser(createUserUseCase, 'new@example.com');

    const contactRequest = await createContactRequestUseCase.execute({
      user_id: user.id,
      requester_id: anotherUser.id
    });

    request_id = contactRequest.id;
    user_id = user.id;
    contact_id = anotherUser.id;
  });

  it('should be able to accept a contact request', async () => {
    const result = await acceptContactRequestUseCase.execute({
      id: request_id,
      user_id
    });

    expect(result).toHaveProperty('id');
    expect(result.user_id).toEqual(user_id);
    expect(result.contact_id).toEqual(contact_id);
  });

  it('should not allow requester to accept a contact request', async () => {
    await expect(
      acceptContactRequestUseCase.execute({
        id: request_id,
        user_id: contact_id
      })
    ).rejects.toEqual(
      new AppError("This user can't accept this contact request", 401)
    );
  });
});
