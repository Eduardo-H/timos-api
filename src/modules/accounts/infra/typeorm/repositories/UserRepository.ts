import { ICreateUserDTO } from '@modules/accounts/dtos/ICreateUserDTO';
import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { getRepository, Repository } from 'typeorm';

import { User } from '../entities/User';

class UserRepository implements IUsersRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = getRepository(User);
  }

  async create({ name, email, password }: ICreateUserDTO): Promise<User> {
    const user = this.repository.create({ name, email, password });

    await this.repository.save(user);

    return user;
  }

  async update(id: string, name: string): Promise<User> {
    const user = await this.repository.findOne({ id });

    user.name = name;

    await this.repository.save(user);

    return user;
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete({ id });
  }

  async findById(id: string): Promise<User> {
    const user = await this.repository.findOne({ id });
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.repository.findOne({ email });
    return user;
  }
}

export { UserRepository };
