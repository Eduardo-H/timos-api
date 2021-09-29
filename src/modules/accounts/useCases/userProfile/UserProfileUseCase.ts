import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

interface IResponse {
  id: string;
  name: string;
  email: string;
}

@injectable()
class UserProfileUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository
  ) {}

  async execute(user_id: string): Promise<IResponse> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('User not found');
    }

    const userResponse: IResponse = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    return userResponse;
  }
}

export { UserProfileUseCase };
