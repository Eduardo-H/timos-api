import { IUsersRepository } from '@modules/accounts/repositories/IUsersRepository';
import { ContactRequest } from '@modules/contacts/infra/typeorm/entities/ContactRequest';
import { IContactsRepository } from '@modules/contacts/repositories/IContactsRepository';
import { IContactsRequestsRepository } from '@modules/contacts/repositories/IContactsRequestsRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

interface IPayload {
  user_id: string;
  requester_id: string;
}

@injectable()
class CreateContactRequestUseCase {
  constructor(
    @inject('ContactsRequestsRepository')
    private contactsRequestsRepository: IContactsRequestsRepository,
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('ContactsRepository')
    private contactsRepository: IContactsRepository
  ) {}

  async execute({ user_id, requester_id }: IPayload): Promise<ContactRequest> {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('User not found');
    }

    const contactRequest =
      await this.contactsRequestsRepository.findConnectionRequest(
        user_id,
        requester_id
      );

    if (contactRequest) {
      throw new AppError('This connection request already exists');
    }

    const connection = await this.contactsRepository.findConnection(
      user_id,
      requester_id
    );

    if (connection) {
      throw new AppError('The users are already connected');
    }

    const request = await this.contactsRequestsRepository.create({
      user_id,
      requester_id
    });

    return request;
  }
}

export { CreateContactRequestUseCase };
