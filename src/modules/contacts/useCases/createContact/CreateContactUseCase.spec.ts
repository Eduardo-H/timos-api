import { ICreateUserDTO } from '@modules/accounts/dtos/ICreateUserDTO';
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
    const user: ICreateUserDTO = {
      id: '1234',
      email: 'test@example.com',
      password: '12345'
    };

    const result = await createContactUseCase.execute({
      name: 'John Doe',
      user_id: user.id
    });

    expect(result).toHaveProperty('id');
    expect(result.name).toEqual('John Doe');
    expect(result.user_id).toEqual(user.id);
  });

  it('should not be able to create a repeated contact', async () => {
    const user: ICreateUserDTO = {
      id: '1234',
      email: 'test@example.com',
      password: '12345'
    };

    await createContactUseCase.execute({
      name: 'John Doe',
      user_id: user.id
    });

    await expect(
      createContactUseCase.execute({
        name: 'John Doe',
        user_id: user.id
      })
    ).rejects.toEqual(new AppError('Contact already exists'));
  });
});
