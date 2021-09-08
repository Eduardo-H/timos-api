import { ICreateUserDTO } from '@modules/accounts/dtos/ICreateUserDTO';
import { UsersRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UsersRepositoryInMemory';
import { UserTokensRepositoryInMemory } from '@modules/accounts/repositories/in-memory/UserTokensRepositoryInMemory';
import { JsonWebTokenError } from 'jsonwebtoken';

import { DayjsDateProvider } from '@shared/container/providers/DateProvider/implementations/DayjsDateProvider';

import { AuthenticateUserUseCase } from '../authenticateUser/AuthenticateUserUseCase';
import { CreateUserUseCase } from '../createAccount/CreateUserUseCase';
import { RefreshTokenUseCase } from './RefreshTokenUseCase';

let refreshTokenUseCase: RefreshTokenUseCase;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let userTokensRepositoryInMemory: UserTokensRepositoryInMemory;
let dateProvider: DayjsDateProvider;

const wrongJWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUifQ.KSOCK1xgysHEraNTu4wujkrCR7hfyeNj-TaAkDF5uHo';

describe('Refresh Token', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    userTokensRepositoryInMemory = new UserTokensRepositoryInMemory();
    dateProvider = new DayjsDateProvider();

    refreshTokenUseCase = new RefreshTokenUseCase(
      userTokensRepositoryInMemory,
      dateProvider
    );

    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory,
      userTokensRepositoryInMemory,
      dateProvider
    );

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it('should be able to generate a new refresh token', async () => {
    const user: ICreateUserDTO = {
      email: 'test@example.com',
      password: '12345'
    };

    await createUserUseCase.execute(user);

    const response = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    const result = await refreshTokenUseCase.execute(response.refresh_token);

    expect(result).toHaveProperty('refresh_token');
    expect(result).toHaveProperty('token');
  });

  it('should not be able to generate a new token when using a wrong refresh token', async () => {
    await expect(refreshTokenUseCase.execute(wrongJWT)).rejects.toBeInstanceOf(
      JsonWebTokenError
    );
  });
});
