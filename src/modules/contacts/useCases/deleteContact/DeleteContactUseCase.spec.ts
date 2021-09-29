import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';

import { AppError } from '@shared/errors/AppError';

import { CreateContactUseCase } from '../createContact/CreateContactUseCase';
import { DeleteContactUseCase } from './DeleteContactUseCase';

let deleteContactUseCase: DeleteContactUseCase;
let createContactUseCase: CreateContactUseCase;
let contactsRepositoryInMemory: ContactsRepositoryInMemory;

describe('Delete Contact', () => {
  beforeEach(() => {
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();

    deleteContactUseCase = new DeleteContactUseCase(contactsRepositoryInMemory);
    createContactUseCase = new CreateContactUseCase(contactsRepositoryInMemory);
  });

  it('should be able to delete a contact', async () => {
    await createContactUseCase.execute({
      user_id: '123',
      contact_id: '987'
    });

    const result = await deleteContactUseCase.execute({
      user_id: '123',
      contact_id: '987'
    });

    expect(result).toBeUndefined();
  });

  it('should not be able to delete a nonexistent contact', async () => {
    await expect(
      deleteContactUseCase.execute({ user_id: '123', contact_id: '000' })
    ).rejects.toEqual(new AppError("You're not connected to this user"));
  });
});
