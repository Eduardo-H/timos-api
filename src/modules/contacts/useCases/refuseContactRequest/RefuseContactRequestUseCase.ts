import { IContactsRequestsRepository } from '@modules/contacts/repositories/IContactsRequestsRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

interface IPayload {
  id: string;
  user_id: string;
}

@injectable()
class RefuseContactRequestUseCase {
  constructor(
    @inject('ContactsRequestsRepository')
    private contactsRequestsRepository: IContactsRequestsRepository
  ) {}

  async execute({ id, user_id }: IPayload): Promise<void> {
    const contactRequest = await this.contactsRequestsRepository.findById(id);

    if (!contactRequest) {
      throw new AppError('Contact request not found');
    }

    if (
      contactRequest.user_id !== user_id &&
      contactRequest.requester_id !== user_id
    ) {
      throw new AppError(
        'This user is not a part of this contact request',
        401
      );
    }

    await this.contactsRequestsRepository.deleteById(id);
  }
}

export { RefuseContactRequestUseCase };
