import { ICreateUserDTO } from '@modules/accounts/dtos/ICreateUserDTO';
import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';

import { AppError } from '@shared/errors/AppError';

import { CreateUserUseCase } from './CreateUserUseCase';

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: UsersRepositoryInMemory;

describe('Create User', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it('should be able to create an user', async () => {
    const newUser: ICreateUserDTO = {
      email: 'test@example.com',
      password: '12345'
    };

    const user = await createUserUseCase.execute(newUser);

    expect(user).toHaveProperty('id');
  });

  it('should not be able to create a repeated user', async () => {
    const newUser: ICreateUserDTO = {
      email: 'test@example.com',
      password: '12345'
    };

    await createUserUseCase.execute(newUser);

    await expect(createUserUseCase.execute(newUser)).rejects.toEqual(
      new AppError('User already exists')
    );
  });
});
