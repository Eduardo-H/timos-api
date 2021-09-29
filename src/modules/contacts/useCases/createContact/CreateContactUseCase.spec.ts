import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';

import { AppError } from '@shared/errors/AppError';

import { CreateContactUseCase } from './CreateContactUseCase';

let createContactUseCase: CreateContactUseCase;
let contactsRepositoryInMemory: ContactsRepositoryInMemory;

describe('Create Contact', () => {
  beforeEach(() => {
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();

    createContactUseCase = new CreateContactUseCase(contactsRepositoryInMemory);
  });

  it('should be able to create a contact', async () => {
    const result = await createContactUseCase.execute({
      user_id: '1234',
      contact_id: '9876'
    });

    expect(result).toHaveProperty('id');
    expect(result.user_id).toEqual('1234');
    expect(result.contact_id).toEqual('9876');
  });

  it('should not be able to create a repeated contact', async () => {
    await createContactUseCase.execute({
      user_id: '1234',
      contact_id: '9876'
    });

    await expect(
      createContactUseCase.execute({
        user_id: '1234',
        contact_id: '9876'
      })
    ).rejects.toEqual(new AppError('This connection already exists'));
  });
});
