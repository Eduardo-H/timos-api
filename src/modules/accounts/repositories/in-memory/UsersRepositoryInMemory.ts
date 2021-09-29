import { ICreateUserDTO } from '@modules/accounts/dtos/ICreateUserDTO';
import { User } from '@modules/accounts/infra/typeorm/entities/User';

import { IUsersRepository } from '../IUsersRepository';

class UsersRepositoryInMemory implements IUsersRepository {
  users: User[] = [];

  async create({ name, email, password }: ICreateUserDTO): Promise<User> {
    const user = new User();

    Object.assign(user, {
      name,
      email,
      password
    });

    this.users.push(user);

    return user;
  }

  async update(id: string, name: string): Promise<User> {
    const user = this.users.find((user) => user.id === id);

    Object.assign(user, {
      name
    });

    return user;
  }

  async deleteById(id: string): Promise<void> {
    const index = this.users.findIndex((user) => user.id === id);
    this.users.splice(index, 1);
  }

  async findById(id: string): Promise<User> {
    const user = this.users.find((user) => user.id === id);
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = this.users.find((user) => user.email === email);
    return user;
  }
}

export { UsersRepositoryInMemory };
