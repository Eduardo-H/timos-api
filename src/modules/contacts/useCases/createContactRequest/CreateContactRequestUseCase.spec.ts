import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { ContactsRequestsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRequestsRepositoryInMemory';
import { createContact, createUser } from '@utils/seed';

import { AppError } from '@shared/errors/AppError';

import { CreateContactUseCase } from '../createContact/CreateContactUseCase';
import { CreateContactRequestUseCase } from './CreateContactRequestUseCase';

let createContactRequestUseCase: CreateContactRequestUseCase;
let createUserUseCase: CreateUserUseCase;
let createContactUseCase: CreateContactUseCase;
let contactsRequestsRepositoryInMemory: ContactsRequestsRepositoryInMemory;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let contactsRepositoryInMemory: ContactsRepositoryInMemory;

let user_id: string;
let requester_id: string;

describe('Create Contact Request', () => {
  beforeEach(async () => {
    contactsRequestsRepositoryInMemory =
      new ContactsRequestsRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();

    createContactRequestUseCase = new CreateContactRequestUseCase(
      contactsRequestsRepositoryInMemory,
      usersRepositoryInMemory,
      contactsRepositoryInMemory
    );

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    createContactUseCase = new CreateContactUseCase(contactsRepositoryInMemory);

    const requester = await createUser(createUserUseCase, 'test@example.com');
    const anotherUser = await createUser(createUserUseCase, 'new@example.com');

    user_id = anotherUser.id;
    requester_id = requester.id;
  });

  it('should be able to create a contact request', async () => {
    const result = await createContactRequestUseCase.execute({
      user_id,
      requester_id
    });

    expect(result).toHaveProperty('id');
    expect(result.user_id).toEqual(user_id);
    expect(result.requester_id).toEqual(requester_id);
  });

  it('should not be able to create a repeated contact request', async () => {
    await createContactRequestUseCase.execute({
      user_id,
      requester_id
    });

    await expect(
      createContactRequestUseCase.execute({
        user_id,
        requester_id
      })
    ).rejects.toEqual(new AppError('This connection request already exists'));
  });

  it('should not be able to create a contact request when the users are already connected', async () => {
    await createContact(createContactUseCase, requester_id, user_id);

    await expect(
      createContactRequestUseCase.execute({
        user_id,
        requester_id
      })
    ).rejects.toEqual(new AppError('The users are already connected'));
  });

  it('should not be able to create a contact request for a nonexistent user', async () => {
    await expect(
      createContactRequestUseCase.execute({
        user_id: '123',
        requester_id
      })
    ).rejects.toEqual(new AppError('User not found'));
  });
});
