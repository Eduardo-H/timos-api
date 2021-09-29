import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { createContact, createUser } from '@utils/seed';

import { AppError } from '@shared/errors/AppError';

import { CreateContactUseCase } from '../createContact/CreateContactUseCase';
import { ListContactsUseCase } from './ListContactsUseCase';

let listContactsUseCase: ListContactsUseCase;
let createUserUseCase: CreateUserUseCase;
let createContactUseCase: CreateContactUseCase;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let contactsRepositoryInMemory: ContactsRepositoryInMemory;

let user_id: string;
let first_contact_id: string;
let second_contact_id: string;

describe('List Contacts', () => {
  beforeEach(async () => {
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();

    listContactsUseCase = new ListContactsUseCase(contactsRepositoryInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createContactUseCase = new CreateContactUseCase(contactsRepositoryInMemory);

    const user = await createUser(createUserUseCase, 'test@example.com');
    user_id = user.id;

    const userContact = await createUser(createUserUseCase, 'new@example.com');
    const anotherContact = await createUser(
      createUserUseCase,
      'johndoe@example.com'
    );

    first_contact_id = userContact.id;
    second_contact_id = anotherContact.id;

    // Creating contacts for the user
    await createContact(createContactUseCase, user_id, userContact.id);
    await createContact(createContactUseCase, user_id, anotherContact.id);
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
