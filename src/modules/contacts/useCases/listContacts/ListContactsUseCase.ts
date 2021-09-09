import { Contact } from '@modules/contacts/infra/typeorm/entities/Contact';
import { IContactsRepository } from '@modules/contacts/repositories/IContactsRepository';
import { inject, injectable } from 'tsyringe';

import { AppError } from '@shared/errors/AppError';

interface IPayload {
  user_id: string;
  page: number;
  limit: number;
}

@injectable()
class ListContactsUseCase {
  constructor(
    @inject('ContactsRepository')
    private contactsRepository: IContactsRepository
  ) {}

  async execute({ user_id, page, limit }: IPayload): Promise<Contact[]> {
    const contacts = await this.contactsRepository.listContacts(
      user_id,
      page,
      limit
    );

    if (contacts.length === 0) {
      throw new AppError('No contacts found', 204);
    }

    return contacts;
  }
}

export { ListContactsUseCase };
