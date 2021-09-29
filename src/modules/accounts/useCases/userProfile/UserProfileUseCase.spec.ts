import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { createUser } from '@utils/seed';

import { AppError } from '@shared/errors/AppError';

import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { UserProfileUseCase } from './UserProfileUseCase';

let userProfileUseCase: UserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: UsersRepositoryInMemory;

let user_id: string;

describe('User Profile', () => {
  beforeEach(async () => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();

    userProfileUseCase = new UserProfileUseCase(usersRepositoryInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);

    const user = await createUser(createUserUseCase, 'test@example.com');

    user_id = user.id;
  });

  it('should be able to access the user profile', async () => {
    const result = await userProfileUseCase.execute(user_id);

    expect(result.id).toEqual(user_id);
    expect(result.email).toEqual('test@example.com');
    expect(result.name).toEqual('John Doe');
  });

  it('should not be able to access the profile of a nonexistent user', async () => {
    await expect(userProfileUseCase.execute('123')).rejects.toEqual(
      new AppError('User not found')
    );
  });
});
