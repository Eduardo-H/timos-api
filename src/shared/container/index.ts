import { UserRepository } from '@modules/accounts/infra/typeorm/repositories/UserRepository';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { container } from 'tsyringe';

container.registerSingleton<IUsersRepository>(
  'UsersRepository',
  UserRepository
);
