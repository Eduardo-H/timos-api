import { UserRepository } from '@modules/accounts/infra/typeorm/repositories/UserRepository';
import { UserTokensRepository } from '@modules/accounts/infra/typeorm/repositories/UserTokensRepository';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { IUsersTokensRepository } from '@modules/accounts/repositories/IUsersTokensRepository';
import { ContactsRepository } from '@modules/contacts/infra/typeorm/repositories/ContactsRepository';
import { IContactsRepository } from '@modules/contacts/repositories/IContactsRepository';
import { container } from 'tsyringe';
import '@shared/container/providers';

container.registerSingleton<IUsersRepository>(
  'UsersRepository',
  UserRepository
);

container.registerSingleton<IUsersTokensRepository>(
  'UserTokensRepository',
  UserTokensRepository
);

container.registerSingleton<IContactsRepository>(
  'ContactsRepository',
  ContactsRepository
);
