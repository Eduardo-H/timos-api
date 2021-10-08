import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '@modules/accounts/useCases/createUser/CreateUserUseCase';
import { ContactsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRepositoryInMemory';
import { ContactsRequestsRepositoryInMemory } from '@modules/contacts/repositories/in-memory/ContactsRequestsRepositoryInMemory';
import { createContactRequest, createUser } from '@utils/seed';

import { AppError } from '@shared/errors/AppError';

import { CreateContactRequestUseCase } from '../createContactRequest/CreateContactRequestUseCase';
import { RefuseContactRequestUseCase } from './RefuseContactRequestUseCase';

let refuseContactRequestUseCase: RefuseContactRequestUseCase;
let createContactRequestUseCase: CreateContactRequestUseCase;
let createUserUseCase: CreateUserUseCase;
let contactsRequestsRepositoryInMemory: ContactsRequestsRepositoryInMemory;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let contactsRepositoryInMemory: ContactsRepositoryInMemory;

let id: string;
let user_id: string;

describe('Refuse Contact Request', () => {
  beforeEach(async () => {
    contactsRequestsRepositoryInMemory =
      new ContactsRequestsRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    contactsRepositoryInMemory = new ContactsRepositoryInMemory();

    refuseContactRequestUseCase = new RefuseContactRequestUseCase(
      contactsRequestsRepositoryInMemory
    );

    createContactRequestUseCase = new CreateContactRequestUseCase(
      contactsRequestsRepositoryInMemory,
      usersRepositoryInMemory,
      contactsRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);

    const user = await createUser(createUserUseCase, 'test@example.com');
    const anotherUser = await createUser(createUserUseCase, 'new@example.com');

    const request = await createContactRequest(
      createContactRequestUseCase,
      user.id,
      anotherUser.id
    );

    id = request.id;
    user_id = user.id;
  });

  it('should be able to refuse a contact request', async () => {
    const result = await refuseContactRequestUseCase.execute({
      id,
      user_id
    });

    expect(result).toBeUndefined();
  });

  it('should not be able to refuse a nonexistent contact request', async () => {
    await expect(
      refuseContactRequestUseCase.execute({
        id: '123',
        user_id
      })
    ).rejects.toEqual(new AppError('Contact request not found'));
  });

  it('should not allow an user that is not a part of the contact request to refuse it', async () => {
    await expect(
      refuseContactRequestUseCase.execute({
        id,
        user_id: '123'
      })
    ).rejects.toEqual(
      new AppError('This user is not a part of this contact request', 401)
    );
  });
});
