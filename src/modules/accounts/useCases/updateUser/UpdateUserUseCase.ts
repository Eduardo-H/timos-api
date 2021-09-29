import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

interface IResponse {
  id: string;
  name: string;
  email: string;
}

@injectable()
class UpdateUserUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  async execute(id: string, name: string): Promise<IResponse> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new AppError('User not found');
    }

    const updatedUser = await this.usersRepository.update(id, name);

    const userResponse: IResponse = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email
    };

    return userResponse;
  }
}

export { UpdateUserUseCase };
