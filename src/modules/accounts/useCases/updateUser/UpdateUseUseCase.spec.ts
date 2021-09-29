import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { createUser } from '@utils/seed';

import { AppError } from '@shared/errors/AppError';

import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { UpdateUserUseCase } from './UpdateUserUseCase';

let updateUserUseCase: UpdateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: UsersRepositoryInMemory;

let user_id: string;

describe('Update User', () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();

    updateUserUseCase = new UpdateUserUseCase(usersRepositoryInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);

    const user = await createUser(createUserUseCase, 'test@example.com');

    user_id = user.id;
  });

  it('should be able to update an user', async () => {
    const result = await updateUserUseCase.execute(user_id, 'Marry Louise');

    expect(result.id).toEqual(user_id);
    expect(result.email).toEqual('test@example.com');
    expect(result.name).toEqual('Marry Louise');
  });

  it('should not be able to update a nonexistent user', async () => {
    await expect(
      updateUserUseCase.execute('123', 'Marry Louise')
    ).rejects.toEqual(new AppError('User not found'));
  });
});
