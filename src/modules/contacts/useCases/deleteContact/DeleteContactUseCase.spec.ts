import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { ContactsRequestsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRequestsRepositoryInMemory';
import { createContactRequest, createUser } from '@utils/seed';

import { AppError } from '@shared/errors/AppError';

import { AcceptContactRequestUseCase } from '../acceptContactRequest/AcceptContactRequestUseCase';
import { CreateContactRequestUseCase } from '../createContactRequest/CreateContactRequestUseCase';
import { DeleteContactUseCase } from './DeleteContactUseCase';

let deleteContactUseCase: DeleteContactUseCase;
let createUserUseCase: CreateUserUseCase;
let createContactRequestUseCase: CreateContactRequestUseCase;
let acceptContactRequestUseCase: AcceptContactRequestUseCase;
let contactsRequestsRepositoryInMemory: ContactsRequestsRepositoryInMemory;
let contactsRepositoryInMemory: ContactsRepositoryInMemory;
let usersRepositoryInMemory: UsersRepositoryInMemory;

let request_id: string;
let user_id: string;
let contact_id: string;

describe('Delete Contact', () => {
  beforeEach(async () => {
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();
    contactsRequestsRepositoryInMemory =
      new ContactsRequestsRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();

    deleteContactUseCase = new DeleteContactUseCase(contactsRepositoryInMemory);

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

    const requester = await createUser(createUserUseCase, 'test@example.com');
    const anotherUser = await createUser(createUserUseCase, 'new@example.com');

    user_id = anotherUser.id;
    contact_id = requester.id;

    const contactRequest = await createContactRequest(
      createContactRequestUseCase,
      user_id,
      contact_id
    );

    request_id = contactRequest.id;
  });

  it('should be able to delete a contact', async () => {
    await acceptContactRequestUseCase.execute({
      id: request_id,
      user_id
    });

    const result = await deleteContactUseCase.execute({
      user_id,
      contact_id
    });

    expect(result).toBeUndefined();
  });

  it('should not be able to delete a nonexistent contact', async () => {
    await expect(
      deleteContactUseCase.execute({ user_id: '123', contact_id })
    ).rejects.toEqual(new AppError("You're not connected to this user"));
  });
});
