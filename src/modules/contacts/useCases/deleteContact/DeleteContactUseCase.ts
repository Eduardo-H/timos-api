import { IContactsRepository } from '@modules/contacts/repositories/IContactsRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

interface IPayload {
  id: string;
  user_id: string;
}

@injectable()
class DeleteContactUseCase {
  constructor(
    @inject('ContactsRepository')
    private contactsRepository: IContactsRepository
  ) {}

  async execute({ id, user_id }: IPayload): Promise<void> {
    const contact = await this.contactsRepository.findById(id);

    if (!contact) {
      throw new AppError('Contact not found');
    }

    if (contact.user_id !== user_id) {
      throw new AppError('This contact does not belong to the user', 403);
    }

    await this.contactsRepository.deleteById(id);
  }
}

export { DeleteContactUseCase };
