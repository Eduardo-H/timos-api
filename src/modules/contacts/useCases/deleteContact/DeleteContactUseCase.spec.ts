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
    const contact = await createContactUseCase.execute({
      name: 'John Doe',
      user_id: '123'
    });

    const result = await deleteContactUseCase.execute({
      id: contact.id,
      user_id: contact.user_id
    });

    expect(result).toBeUndefined();
  });

  it('should not be able to delete a nonexistent contact', async () => {
    await expect(
      deleteContactUseCase.execute({ id: '123', user_id: '123' })
    ).rejects.toEqual(new AppError('Contact not found'));
  });

  it('should not be able to delete of a different user', async () => {
    const contact = await createContactUseCase.execute({
      name: 'John Doe',
      user_id: '123'
    });

    await expect(
      deleteContactUseCase.execute({ id: contact.id, user_id: '000' })
    ).rejects.toEqual(
      new AppError('This contact does not belong to the user', 403)
    );
  });
});
