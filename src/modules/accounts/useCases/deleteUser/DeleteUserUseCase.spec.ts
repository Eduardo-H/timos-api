import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';

import { AppError } from '@shared/errors/AppError';

import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { DeleteUserUseCase } from './DeleteUserUseCase';

let deleteUserUseCase: DeleteUserUseCase;
let createAccountUseCase: CreateUserUseCase;
let usersRepositoryInMemory: UsersRepositoryInMemory;

describe('Delete User', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();

    deleteUserUseCase = new DeleteUserUseCase(usersRepositoryInMemory);
    createAccountUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it('should be able to delete an user', async () => {
    const user = await createAccountUseCase.execute({
      name: 'John Doe',
      email: 'test@example.com',
      password: '12345'
    });

    const result = await deleteUserUseCase.execute({
      id: user.id,
      password: '12345'
    });

    expect(result).toBeUndefined();
  });

  it('should not be able to delete a nonexistent user', async () => {
    await expect(
      deleteUserUseCase.execute({
        id: '123',
        password: '12345'
      })
    ).rejects.toEqual(new AppError('User not found'));
  });

  it('should not be able to delete an user with wrong password', async () => {
    const user = await createAccountUseCase.execute({
      name: 'John Doe',
      email: 'test@example.com',
      password: '12345'
    });

    await expect(
      deleteUserUseCase.execute({
        id: user.id,
        password: 'wrong_password'
      })
    ).rejects.toEqual(new AppError('Password incorrect'));
  });
});
