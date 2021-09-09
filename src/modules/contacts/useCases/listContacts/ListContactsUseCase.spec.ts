import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';

import { AppError } from '@shared/errors/AppError';

import { CreateContactUseCase } from '../createContact/CreateContactUseCase';
import { ListContactsUseCase } from './ListContactsUseCase';

let listContactsUseCase: ListContactsUseCase;
let createContactUseCase: CreateContactUseCase;
let contactsRepositoryInMemory: ContactsRepositoryInMemory;

async function createContacts(size: number) {
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < size; i++) {
    // eslint-disable-next-line no-await-in-loop
    await createContactUseCase.execute({
      name: `John Doe #${i}`,
      user_id: '123'
    });
  }
}

describe('List Contacts', () => {
  beforeEach(() => {
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();

    listContactsUseCase = new ListContactsUseCase(contactsRepositoryInMemory);
    createContactUseCase = new CreateContactUseCase(contactsRepositoryInMemory);
  });

  it('should be able to list the users contacts', async () => {
    await createContacts(10);

    const result = await listContactsUseCase.execute({
      user_id: '123',
      page: 1,
      limit: 10
    });

    expect(result.length).toBe(10);
    expect(result[0].name).toEqual('John Doe #0');
    expect(result[0].user_id).toEqual('123');
  });

  it('should be able to paginate results', async () => {
    await createContacts(15);

    const result = await listContactsUseCase.execute({
      user_id: '123',
      page: 2,
      limit: 10
    });

    expect(result.length).toBe(5);
    expect(result[0].name).toEqual('John Doe #10');
    expect(result[0].user_id).toEqual('123');
  });

  it('should be able to limit results', async () => {
    await createContacts(10);

    const result = await listContactsUseCase.execute({
      user_id: '123',
      page: 3,
      limit: 2
    });

    expect(result.length).toBe(2);
    expect(result[0].name).toEqual('John Doe #4');
    expect(result[0].user_id).toEqual('123');
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

  it('should not be able to list contacts of a different user', async () => {
    await createContacts(10);

    await expect(
      listContactsUseCase.execute({
        user_id: '000',
        page: 1,
        limit: 10
      })
    ).rejects.toEqual(new AppError('No contacts found', 204));
  });
});
