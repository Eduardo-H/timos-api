import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';

import { AppError } from '@shared/errors/AppError';

import { CreateContactUseCase } from '../createContact/CreateContactUseCase';
import { UpdateContactUseCase } from './UpdateContactUseCase';

let updateContactUseCase: UpdateContactUseCase;
let createContactUseCase: CreateContactUseCase;
let contactsRepositoryInMemory: ContactsRepositoryInMemory;

describe('Update Contact', () => {
  beforeEach(() => {
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();

    updateContactUseCase = new UpdateContactUseCase(contactsRepositoryInMemory);

    createContactUseCase = new CreateContactUseCase(contactsRepositoryInMemory);
  });

  it('should be able to update a contact', async () => {
    const contact = await createContactUseCase.execute({
      name: 'John Doe',
      user_id: '123'
    });

    const result = await updateContactUseCase.execute({
      id: contact.id,
      name: 'Trevor Slow',
      user_id: contact.user_id
    });

    expect(result.id).toEqual(contact.id);
    expect(result.name).toEqual('Trevor Slow');
    expect(result.user_id).toEqual('123');
  });

  it('should not be able to update a nonexistent contact', async () => {
    await expect(
      updateContactUseCase.execute({
        id: '456',
        name: 'John Doe',
        user_id: '123'
      })
    ).rejects.toEqual(new AppError('Contact not found'));
  });

  it('should not be able to update a contact with a repeated name', async () => {
    await createContactUseCase.execute({
      name: 'John Doe',
      user_id: '123'
    });

    const contact = await createContactUseCase.execute({
      name: 'Trevor Slow',
      user_id: '123'
    });

    await expect(
      updateContactUseCase.execute({
        id: contact.id,
        name: 'John Doe',
        user_id: contact.user_id
      })
    ).rejects.toEqual(new AppError('Contact already exists'));
  });
});
