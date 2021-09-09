import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { compare } from 'bcrypt';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

interface IPayload {
  id: string;
  password: string;
}

@injectable()
class DeleteUserUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  async execute({ id, password }: IPayload): Promise<void> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new AppError('User not found');
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError('Password incorrect');
    }

    await this.usersRepository.deleteById(id);
  }
}

export { DeleteUserUseCase };
