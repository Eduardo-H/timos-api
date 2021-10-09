import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { ContactsRequestsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRequestsRepositoryInMemory';
import { createContact, createContactRequest, createUser } from '@utils/seed';

import { AppError } from '@shared/errors/AppError';

import { AcceptContactRequestUseCase } from '../acceptContactRequest/AcceptContactRequestUseCase';
import { CreateContactRequestUseCase } from '../createContactRequest/CreateContactRequestUseCase';
import { ListContactsUseCase } from './ListContactsUseCase';

let listContactsUseCase: ListContactsUseCase;
let createUserUseCase: CreateUserUseCase;
let createContactRequestUseCase: CreateContactRequestUseCase;
let acceptContactRequestUseCase: AcceptContactRequestUseCase;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let contactsRepositoryInMemory: ContactsRepositoryInMemory;
let contactsRequestsRepositoryInMemory: ContactsRequestsRepositoryInMemory;

let user_id: string;
let first_contact_id: string;
let second_contact_id: string;

describe('List Contacts', () => {
  beforeEach(async () => {
    contactsRequestsRepositoryInMemory =
      new ContactsRequestsRepositoryInMemory();
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();

    listContactsUseCase = new ListContactsUseCase(contactsRepositoryInMemory);

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

    // Creating users
    const user = await createUser(createUserUseCase, 'test@example.com');
    const secondUser = await createUser(createUserUseCase, 'new@example.com');
    const thirdUser = await createUser(createUserUseCase, 'john@example.com');

    // Creating connection requests
    const firtsRequest = await createContactRequest(
      createContactRequestUseCase,
      user.id,
      secondUser.id
    );

    const secondRequest = await createContactRequest(
      createContactRequestUseCase,
      user.id,
      thirdUser.id
    );

    // Accepting connection requests
    await createContact(acceptContactRequestUseCase, firtsRequest.id, user.id);
    await createContact(acceptContactRequestUseCase, secondRequest.id, user.id);

    user_id = user.id;
    first_contact_id = secondUser.id;
    second_contact_id = thirdUser.id;
  });

  it('should be able to list the users contacts', async () => {
    const result = await listContactsUseCase.execute({
      user_id,
      page: 1,
      limit: 10
    });

    expect(result.length).toBe(2);
    expect(result[0].user_id).toEqual(user_id);
    expect(result[0].contact_id).toEqual(first_contact_id);
  });

  it('should be able to paginate results', async () => {
    const result = await listContactsUseCase.execute({
      user_id,
      page: 2,
      limit: 1
    });

    expect(result.length).toBe(1);
    expect(result[0].user_id).toEqual(user_id);
    expect(result[0].contact_id).toEqual(second_contact_id);
  });

  it('should be able to limit results', async () => {
    const result = await listContactsUseCase.execute({
      user_id,
      page: 1,
      limit: 1
    });

    expect(result.length).toBe(1);
    expect(result[0].user_id).toEqual(user_id);
    expect(result[0].contact_id).toEqual(first_contact_id);
  });

  it('should return 204 status when the user have no contacts', async () => {
    await expect(
      listContactsUseCase.execute({
        user_id: '123',
        page: 1,
        limit: 10
      })
    ).rejects.toEqual(new AppError('No contacts found', 204));
  });
});
