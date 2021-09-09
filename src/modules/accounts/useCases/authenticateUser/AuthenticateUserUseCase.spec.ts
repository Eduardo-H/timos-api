import { ICreateUserDTO } from '@modules/accounts/dtos/ICreateUserDTO';
import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { UserTokensRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UserTokensRepositoryInMemory';

import { DayjsDateProvider } from '@shared/container/providers/DateProvider/implementations/DayjsDateProvider';
import { AppError } from '@shared/errors/AppError';

import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let userTokensRepositoryInMemory: UserTokensRepositoryInMemory;
let dateProvider: DayjsDateProvider;

describe('Authenticate User', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    userTokensRepositoryInMemory = new UserTokensRepositoryInMemory();
    dateProvider = new DayjsDateProvider();

    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory,
      userTokensRepositoryInMemory,
      dateProvider
    );

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it('should be able to authenticate an user', async () => {
    const user: ICreateUserDTO = {
      email: 'test@example.com',
      password: '12345'
    };

    await createUserUseCase.execute(user);

    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('refresh_token');
  });

  it('should not be able to authenticate a non-existing user', async () => {
    await expect(
      authenticateUserUseCase.execute({
        email: 'johndoe@example.com',
        password: '00000'
      })
    ).rejects.toEqual(new AppError('E-mail or password incorrect'));
  });

  it('should not be able to authenticate an user with the wrong password', async () => {
    const user: ICreateUserDTO = {
      email: 'test@example.com',
      password: '12345'
    };

    await createUserUseCase.execute(user);

    await expect(
      authenticateUserUseCase.execute({
        email: user.email,
        password: 'wrong_password'
      })
    ).rejects.toEqual(new AppError('E-mail or password incorrect'));
  });
});
