import { ICreateUserDTO } from '@modules/accounts/dtos/ICreateUserDTO';
import { User } from '@modules/accounts/infra/typeorm/entities/User';

import { IUsersRepository } from '../IUsersRepository';

class UsersRepositoryInMemory implements IUsersRepository {
  users: User[] = [];

  async create({ email, password }: ICreateUserDTO): Promise<User> {
    const user = new User();

    Object.assign(user, {
      email,
      password
    });

    this.users.push(user);

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = this.users.find((user) => user.email === email);
    return user;
  }
}

export { UsersRepositoryInMemory };
